const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Prisma Client
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access token required' 
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                success: false, 
                message: 'Invalid or expired token' 
            });
        }
        req.user = user;
        next();
    });
};

// Basic API routes for Space Simulator
app.get('/api/missions', async (req, res, next) => {
    try {
        const missions = await prisma.mission.findMany({
            orderBy: {
                startTime: 'asc'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        });

        res.json({ 
            success: true, 
            message: 'Missions retrieved successfully',
            missions: missions,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});

app.post('/api/missions', authenticateToken, async (req, res, next) => {
    try {
        const { name, description, startTime } = req.body;

        // Validation
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Mission name is required'
            });
        }

        // Convert startTime to valid DateTime if provided
        let missionStartTime = null;
        if (startTime) {
            missionStartTime = new Date(startTime);
            if (isNaN(missionStartTime.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid startTime format. Use ISO-8601 format.'
                });
            }
        }

        // Create mission
        const mission = await prisma.mission.create({
            data: {
                name,
                description: description || null,
                userId: req.user.id
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Mission created successfully',
            mission: mission,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});

// Authentication routes
app.post('/api/auth/register', async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, and password are required'
            });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: username }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                createdAt: newUser.createdAt
            },
            token
        });

    } catch (error) {
        next(error);
    }
});

app.post('/api/auth/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Compare password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt
            },
            token
        });

    } catch (error) {
        next(error);
    }
});

app.get('/api/auth/profile', authenticateToken, async (req, res, next) => {
    try {
        // User data is already attached to req.user by the middleware
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
});

// Global error handling middleware (placed before static file serving)
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    // Default error response
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Static file hosting for frontend
app.use(express.static('../client/dist'));

// SPA fallback route - send index.html for any unmatched routes
app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
