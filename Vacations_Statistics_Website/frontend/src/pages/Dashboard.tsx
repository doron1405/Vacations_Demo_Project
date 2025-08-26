import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { statsAPI } from '../services/Api';

interface SummaryStats {
  vacationStats: {
    pastVacations: number;
    ongoingVacations: number;
    futureVacations: number;
  };
  totalUsers: number;
  totalLikes: number;
  topDestinations: Array<{
    destination: string;
    likes: number;
  }>;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('📊 Fetching dashboard statistics...');
      const data = await statsAPI.getSummaryStats();
      setStats(data);
      setLastUpdated(new Date());
      console.log('✅ Statistics loaded successfully');
    } catch (err: any) {
      console.error('❌ Error fetching stats:', err);
      setError('Failed to load statistics. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchStats();
  };

  if (isLoading && !stats) {
    return (
      <div className="page">
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <h2>Loading statistics...</h2>
          <p>Connecting to API and fetching data...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="page">
        <div className="dashboard-loading">
          <h2>⚠️ Error Loading Data</h2>
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-button">
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>📊 Statistics Dashboard</h1>
            <p>Welcome back, {user?.first_name || user?.email}!</p>
            <small className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </small>
          </div>
          <div className="dashboard-actions">
            <button 
              onClick={handleRefresh} 
              className="refresh-btn"
              disabled={isLoading}
            >
              {isLoading ? '⏳ Refreshing...' : '🔄 Refresh'}
            </button>
            <button onClick={logout} className="logout-btn">
              🚪 Logout
            </button>
          </div>
        </div>

        {stats && (
          <>
            {/* Main Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>Total Users</h3>
                  <p className="stat-value">{stats.totalUsers}</p>
                  <span className="stat-change">Registered users</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">❤️</div>
                <div className="stat-content">
                  <h3>Total Likes</h3>
                  <p className="stat-value">{stats.totalLikes.toLocaleString()}</p>
                  <span className="stat-change">All-time likes</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <h3>Past Vacations</h3>
                  <p className="stat-value">{stats.vacationStats.pastVacations}</p>
                  <span className="stat-change">Completed</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🏖️</div>
                <div className="stat-content">
                  <h3>Ongoing Vacations</h3>
                  <p className="stat-value">{stats.vacationStats.ongoingVacations}</p>
                  <span className="stat-change">Active now</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <h3>Future Vacations</h3>
                  <p className="stat-value">{stats.vacationStats.futureVacations}</p>
                  <span className="stat-change">Planned</span>
                </div>
              </div>
            </div>

            {/* Top Destinations */}
            <div className="destinations-section">
              <h2>🏆 Top Destinations</h2>
              <div className="destinations-grid">
                {stats.topDestinations.map((dest, index) => (
                  <div key={index} className="destination-card">
                    <div className="destination-rank">#{index + 1}</div>
                    <div className="destination-info">
                      <h3>{dest.destination}</h3>
                      <p>{dest.likes} likes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;