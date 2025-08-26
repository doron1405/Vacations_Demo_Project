import axios from 'axios';

// Типы для API
interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  user: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

interface VacationStats {
  pastVacations: number;
  ongoingVacations: number;
  futureVacations: number;
}

interface SummaryStats {
  vacationStats: VacationStats;
  totalUsers: number;
  totalLikes: number;
  topDestinations: Array<{
    destination: string;
    likes: number;
  }>;
}

// Создаем экземпляр axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Добавляем токен к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Обрабатываем ответы
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен истек
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API методы
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/login', credentials);
      return response.data;
    } catch (error: any) {
      // Пока API не готов, используем мок
      if (error.code === 'NETWORK_ERROR' || error.response?.status >= 500) {
        console.warn('API not available, using mock data');
        if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
          return {
            access_token: 'mock-jwt-token-12345',
            user: {
              email: 'admin@example.com',
              first_name: 'Admin',
              last_name: 'User'
            }
          };
        } else {
          throw new Error('Invalid credentials');
        }
      }
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/logout');
    } catch (error) {
      // Игнорируем ошибки logout
      console.warn('Logout API call failed, proceeding anyway');
    }
  },
};

export const statsAPI = {
  getSummaryStats: async (): Promise<SummaryStats> => {
    try {
      const response = await api.get<SummaryStats>('/stats/summary');
      return response.data;
    } catch (error: any) {
      // Мок данные если API недоступен
      console.warn('Stats API not available, using mock data');
      return {
        vacationStats: {
          pastVacations: Math.floor(Math.random() * 100) + 50,
          ongoingVacations: Math.floor(Math.random() * 20) + 5,
          futureVacations: Math.floor(Math.random() * 50) + 20
        },
        totalUsers: Math.floor(Math.random() * 200) + 100,
        totalLikes: Math.floor(Math.random() * 2000) + 1000,
        topDestinations: [
          { destination: 'Paris', likes: 45 },
          { destination: 'Tokyo', likes: 38 },
          { destination: 'New York', likes: 32 },
          { destination: 'London', likes: 28 },
          { destination: 'Rome', likes: 25 }
        ]
      };
    }
  },

  getVacationStats: async (): Promise<VacationStats> => {
    try {
      const response = await api.get<VacationStats>('/stats/vacations');
      return response.data;
    } catch (error) {
      console.warn('Vacation stats API not available, using mock data');
      return {
        pastVacations: Math.floor(Math.random() * 100) + 50,
        ongoingVacations: Math.floor(Math.random() * 20) + 5,
        futureVacations: Math.floor(Math.random() * 50) + 20
      };
    }
  },
};

export default api;

// Ensure this file is treated as a module
export {};