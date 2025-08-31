import axios from 'axios';
import {
    AuthResponse,
    LoginCredentials,
    VacationStats,
    TotalUsers,
    TotalLikes,
    LikeDistribution,
    SummaryStats
} from '../types';

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

// Create axios instance with base configuration
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || '/api', // use relative path -> goes through Nginx
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Add debugging and token to requests
api.interceptors.request.use(
    (config) => {
        devLog(' API Request:', {
            method: config.method?.toUpperCase(),
            url: `${config.baseURL}${config.url}`,
            data: config.data,
            headers: config.headers
        });

        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            devLog(' Token added to request');
        }
        return config;
    },
    (error) => {
        devError(' Request Error:', error);
        return Promise.reject(error);
    }
);

// Enhanced response interceptor with debugging and better error handling
api.interceptors.response.use(
    (response) => {
        devLog(' API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data
        });
        return response;
    },
    (error) => {
        devError(' API Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            data: error.response?.data,
            message: error.message,
            code: error.code
        });

        // Handle different types of errors
        if (error.code === 'ECONNABORTED') {
            error.userMessage = 'Request timeout. Please check your connection and try again.';
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
            error.userMessage = 'Network error. Please check your connection and try again.';
        } else if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            error.userMessage = 'Session expired. Please login again.';
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        } else if (error.response?.status === 403) {
            error.userMessage = 'Access denied. Administrator privileges required.';
        } else if (error.response?.status === 404) {
            error.userMessage = 'Service not found. Please try again later.';
        } else if (error.response?.status >= 500) {
            error.userMessage = 'Server error. Please try again later.';
        }

        return Promise.reject(error);
    }
);

/**
 * Authentication API endpoints for login and logout operations.
 */
export const authAPI = {
    /**Authenticates user credentials and returns JWT token with user data.*/
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        try {
            devLog(' Attempting login for:', credentials.email);
            devLog(' API Base URL:', process.env.REACT_APP_API_URL || 'http://35.159.86.101:5001/api');

            const response = await api.post<AuthResponse>('/login', credentials);

            devLog(' Login successful:', {
                user: response.data.user,
                tokenExists: !!response.data.access_token
            });

            return response.data;
        } catch (error: any) {
            devError(' Login failed:', error);

            // Enhanced error handling with specific messages
            if (error.response?.status === 401) {
                const errorMsg = error.response?.data?.error || 'Invalid credentials';
                if (errorMsg.includes('Invalid credentials')) {
                    throw new Error('Invalid email or password. Please check your credentials and try again.');
                } else if (errorMsg.includes('not an admin')) {
                    throw new Error('Access denied. Only administrators can access the dashboard.');
                } else {
                    throw new Error(errorMsg);
                }
            } else if (error.userMessage) {
                throw new Error(error.userMessage);
            } else {
                throw error;
            }
        }
    },

    /**Logs out the current user by invalidating the session.*/
    logout: async (): Promise<void> => {
        try {
            devLog(' Logging out user');
            await api.post('/logout');
            devLog(' Logout successful');
        } catch (error) {
            devError(' Logout error (ignoring):', error);
            // Ignore logout errors since JWT is stateless
        }
    },
};

/**
 * Statistics API endpoints for retrieving dashboard data and analytics.
 */
export const statsAPI = {
    /**Retrieves vacation statistics including past, ongoing, and future vacations.*/
    getVacationStats: async (): Promise<VacationStats> => {
        const response = await api.get<VacationStats>('/stats/vacations');
        return response.data;
    },

    /**Retrieves the total count of users in the system.*/
    getTotalUsers: async (): Promise<TotalUsers> => {
        const response = await api.get<TotalUsers>('/users/total');
        return response.data;
    },

    /**Retrieves the total count of likes across all vacations.*/
    getTotalLikes: async (): Promise<TotalLikes> => {
        const response = await api.get<TotalLikes>('/likes/total');
        return response.data;
    },

    /**Retrieves the distribution of likes grouped by vacation destinations.*/
    getLikesDistribution: async (): Promise<LikeDistribution[]> => {
        const response = await api.get<LikeDistribution[]>('/likes/distribution');
        return response.data;
    },

    /**Retrieves all dashboard statistics in a single API call for efficiency.*/
    getSummaryStats: async (): Promise<SummaryStats> => {
        const response = await api.get<SummaryStats>('/stats/summary');
        return response.data;
    },
};

export default api;