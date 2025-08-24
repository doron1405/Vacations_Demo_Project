const About = () => {
    return (
        <div className="about-page">
            <div className="container">
                <h1>About Vacation Statistics Dashboard</h1>
                <div className="about-content">
                    <section className="about-section">
                        <h2>Project Overview</h2>
                        <p>
                            The Vacation Statistics Dashboard is a comprehensive web application designed to
                            provide insights and analytics for vacation management and planning.
                        </p>
                    </section>

                    <section className="about-section">
                        <h2>Features</h2>
                        <ul>
                            <li>Real-time vacation statistics</li>
                            <li>Interactive data visualization</li>
                            <li>User authentication and authorization</li>
                            <li>Responsive design for all devices</li>
                            <li>Data export capabilities</li>
                        </ul>
                    </section>

                    <section className="about-section">
                        <h2>Technology Stack</h2>
                        <ul>
                            <li><strong>Frontend:</strong> React with TypeScript</li>
                            <li><strong>Backend:</strong> Python with Django REST Framework</li>
                            <li><strong>Database:</strong> PostgreSQL</li>
                            <li><strong>Styling:</strong> CSS3 with modern design principles</li>
                        </ul>
                    </section>

                    <section className="about-section">
                        <h2>Contact</h2>
                        <p>
                            For more information about this project, please contact the development team.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default About;
