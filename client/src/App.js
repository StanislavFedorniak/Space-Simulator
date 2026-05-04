import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { clearStoredToken } from './services/jwtAuth';
import Ship from './components/Ship';
import Missions from './components/Missions';
import TripLog from './components/TripLog';
import Register from './components/Register';
import Login from './components/Login';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('token')));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(Boolean(localStorage.getItem('token')));
    };

    syncAuthState();
    setLoading(false);

    window.addEventListener('auth-changed', syncAuthState);

    return () => {
      window.removeEventListener('auth-changed', syncAuthState);
    };
  }, []);

  const handleLogout = async () => {
    clearStoredToken();
    setIsAuthenticated(false);
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
            {isAuthenticated ? (
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
              element={isAuthenticated ? <TripLog /> : <Navigate to="/login" replace />} 
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
