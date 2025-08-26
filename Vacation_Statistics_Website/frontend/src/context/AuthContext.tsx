import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/Api';

interface User {
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем сохраненные данные при загрузке
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('🔐 Attempting login for:', email);
      
      const response = await authAPI.login({ email, password });
      
      console.log('✅ Login successful:', response.user);
      
      // Сохраняем данные
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setToken(response.access_token);
      setUser(response.user);
      
      // Переходим на dashboard
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      
      let errorMessage: string;
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message === 'Invalid credentials') {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Cannot connect to server. Using demo mode.';
      } else {
        errorMessage = 'Login failed. Please try again.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.warn('Logout API call failed, but continuing with local logout');
    }
    
    // Очищаем локальные данные
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setToken(null);
    setUser(null);
    
    // Переходим на главную страницу
    navigate('/');
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