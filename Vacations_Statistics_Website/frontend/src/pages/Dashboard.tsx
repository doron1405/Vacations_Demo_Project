import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Stats {
  totalUsers: number;
  totalLikes: number;
  pastVacations: number;
  ongoingVacations: number;
  futureVacations: number;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Симулируем загрузку данных
    const loadStats = async () => {
      setIsLoading(true);
      
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      
      const mockStats: Stats = {
        totalUsers: 127,
        totalLikes: 1_542,
        pastVacations: 89,
        ongoingVacations: 12,
        futureVacations: 34
      };
      
      setStats(mockStats);
      setIsLoading(false);
    };
    
    loadStats();
  }, []);

  const handleRefresh = () => {
    setStats(null);
    setIsLoading(true);
    
    setTimeout(() => {
      setStats({
        totalUsers: Math.floor(Math.random() * 200) + 100,
        totalLikes: Math.floor(Math.random() * 2000) + 1000,
        pastVacations: Math.floor(Math.random() * 100) + 50,
        ongoingVacations: Math.floor(Math.random() * 20) + 5,
        futureVacations: Math.floor(Math.random() * 50) + 20
      });
      setIsLoading(false);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="page">
        <div className="dashboard-loading">
          <h2>Loading statistics...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Statistics Dashboard</h1>
            <p>Welcome back, {user?.first_name}!</p>
          </div>
          <div className="dashboard-actions">
            <button onClick={handleRefresh} className="refresh-btn">
              Refresh
            </button>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Total Users</h3>
                <p className="stat-value">{stats.totalUsers}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">Likes</div>
              <div className="stat-content">
                <h3>Total Likes</h3>
                <p className="stat-value">{stats.totalLikes.toLocaleString()}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">Calendar</div>
              <div className="stat-content">
                <h3>Past Vacations</h3>
                <p className="stat-value">{stats.pastVacations}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">Vacations</div>
              <div className="stat-content">
                <h3>Ongoing Vacations</h3>
                <p className="stat-value">{stats.ongoingVacations}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">Target</div>
              <div className="stat-content">
                <h3>Future Vacations</h3>
                <p className="stat-value">{stats.futureVacations}</p>
              </div>
            </div>
          </div>
        )}

        <div className="charts-placeholder">
          <div className="chart-card">
            <h3>Graphics </h3>
            <p>Interactive charts will be added in the next update</p>
            <ul>
              <li>Vacation Status Distribution</li>
              <li>Popular Destinations</li>
              <li>User Engagement Trends</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;