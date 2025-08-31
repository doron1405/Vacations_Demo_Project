import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, LoginCredentials, User } from '../types';
import { authAPI } from '../services/Api';

// Helper function for development-only logging
const devLog = (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(message, ...args);
    }
};

const devError = (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
        console.error(message, ...args);
    }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to access authentication context throughout the application.
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

/**
 * Authentication provider component that manages user login state and JWT tokens.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check for stored auth data on mount
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }

        setIsLoading(false);
    }, []);

    /**
     * Handles user login by authenticating credentials and storing JWT token.
     */
    const login = async (credentials: LoginCredentials) => {
        try {
            devLog('AuthContext: Starting login process');
            devLog('Login attempt for:', credentials.email);

            const response = await authAPI.login(credentials);

            devLog('AuthContext: Login API call successful');
            devLog('User data:', response.user);
            devLog('Token received:', !!response.access_token);

            // Store auth data
            localStorage.setItem('token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));

            setToken(response.access_token);
            setUser(response.user);

            const welcomeName = response.user.first_name || response.user.email;
            devLog('AuthContext: Login successful, redirecting to dashboard');
            navigate('/dashboard');
        } catch (error: any) {
            devError('AuthContext: Login failed:', error);

            let message: string;

            // Use enhanced error messages
            if (error.message && typeof error.message === 'string') {
                message = error.message;
            } else if (error.response?.data?.error) {
                const serverError = error.response.data.error;
                devLog('Server error message:', serverError);

                // Map server errors to user-friendly messages
                if (serverError.includes('Invalid credentials') || serverError.includes('not found')) {
                    message = 'Invalid email or password. Please check your credentials.';
                } else if (serverError.includes('not an admin')) {
                    message = 'Access denied. Only administrators can access the dashboard.';
                } else if (serverError.includes('Email and password required')) {
                    message = 'Please enter both email and password.';
                } else {
                    message = serverError;
                }
            } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                message = 'Cannot connect to server. Please check your internet connection and try again.';
            } else if (error.code === 'ECONNABORTED') {
                message = 'Login timeout. Please try again.';
            } else {
                message = 'Login failed. Please try again later.';
            }

            devLog('Error message for user:', message);
            throw error;
        }
    };

    /**
     * Handles user logout by clearing stored tokens and redirecting to login page.
     */
    const logout = () => {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setToken(null);
        setUser(null);

        navigate('/login');

        // Call logout API (optional, since JWT is stateless)
        authAPI.logout().catch(() => {
            // Ignore logout errors
        });
    };

    const value: AuthContextType = {
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        isLoading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};