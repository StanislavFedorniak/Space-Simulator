import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Ship from './components/Ship';
import Missions from './components/Missions';
import TripLog from './components/TripLog';
import Register from './components/Register';
import Login from './components/Login';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser);
      setUser(currentUser);
      setLoading(false);
    });

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false);
      console.log('Loading timeout triggered');
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return <div className="loading">Завантаження...</div>;
  }

  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li><Link to="/">Стан корабля</Link></li>
            <li><Link to="/missions">Місії</Link></li>
            <li><Link to="/log">Журнал подорожей</Link></li>
            {user ? (
              <li><button onClick={handleLogout} className="logout-button">Вийти</button></li>
            ) : (
              <li><Link to="/login">Вхід</Link></li>
            )}
          </ul>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<Ship />} />
            <Route path="/missions" element={<Missions />} />
            <Route 
              path="/log" 
              element={user ? <TripLog /> : <Navigate to="/login" replace />} 
            />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
