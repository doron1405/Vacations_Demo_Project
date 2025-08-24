import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [email, setEmail] = useState('admin@example.com');
    const [password, setPassword] = useState('admin123');
    const [error, setError] = useState('');

    const { login, isLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="page">
            <div className="login-container">
                <div className="login-form">
                    <h2>Admin Login</h2>
                    <p>Sign in to access the statistics dashboard</p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email:</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password:</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="demo-credentials">
                        <h4>Demo Credentials:</h4>
                        <p>Email: admin@example.com</p>
                        <p>Password: admin</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;