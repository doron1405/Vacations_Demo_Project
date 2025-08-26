import React from 'react';

const Home: React.FC = () => {
    return (
        <div className="page">
            <div className="hero-section">
                <h1>Vacation Statistics Dashboard</h1>
                <p>Your comprehensive solution for vacation analytics</p>

                <div className="features-preview">
                    <div className="feature-card">
                        <h3>📊 Real-time Stats</h3>
                        <p>Monitor vacation data in real-time</p>
                    </div>

                    <div className="feature-card">
                        <h3>👥 User Analytics</h3>
                        <p>Track user engagement and activity</p>
                    </div>

                    <div className="feature-card">
                        <h3>📈 Trend Analysis</h3>
                        <p>Analyze vacation trends and patterns</p>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default Home;