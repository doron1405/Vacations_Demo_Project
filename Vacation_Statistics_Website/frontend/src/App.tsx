import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import About from './pages/About';
import './App.css';

// Simple Dashboard component
const Dashboard = () => (
    <div className="page">
        <div className="dashboard-container">
            <h1>Dashboard</h1>
            <p>Welcome to the Vacation Statistics Dashboard!</p>
            <div className="dashboard-content">
                <div className="stats-card">
                    <h3>Total Vacations</h3>
                    <p className="stat-number">0</p>
                </div>
                <div className="stats-card">
                    <h3>Active Users</h3>
                    <p className="stat-number">0</p>
                </div>
                <div className="stats-card">
                    <h3>This Month</h3>
                    <p className="stat-number">0</p>
                </div>
            </div>
        </div>
    </div>
);

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <div className="app">
                    <nav className="navbar">
                        <div className="nav-brand">
                            <h2>Vacation Stats</h2>
                        </div>
                        <div className="nav-links">
                            <Link to="/">Home</Link>
                            <Link to="/login">Login</Link>
                            <Link to="/about">About</Link>
                        </div>
                    </nav>

                    <main className="main-content">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App;