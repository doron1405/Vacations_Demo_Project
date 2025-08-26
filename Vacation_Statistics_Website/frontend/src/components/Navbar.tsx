import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/">📊 Vacation Stats</Link>
        </div>

        <div className="nav-menu">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Home
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/about" 
                className={`nav-link ${isActive('/about') ? 'active' : ''}`}
              >
                About
              </Link>
            </>
          ) : (
            <Link 
              to="/about" 
              className={`nav-link ${isActive('/about') ? 'active' : ''}`}
            >
              About
            </Link>
          )}
        </div>

        <div className="nav-user">
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-name">
                Hello, {user?.first_name || user?.email}
              </span>
              <button onClick={logout} className="logout-button">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-link">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;