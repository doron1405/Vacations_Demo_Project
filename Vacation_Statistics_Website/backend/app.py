"""
Flask API for vacation statistics.
Provides endpoints for admin dashboard.
"""
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
from auth_helper import verify_django_password, list_admin_users

load_dotenv()

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv(
    'JWT_SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Enable CORS for React frontend
CORS(app, origins=['http://localhost:3000', 'http://localhost:3001',
     'http://localhost:80', 'http://3.67.174.202:3000', 'http://56.228.81.220:3000', 'http://stats-frontend', 'http://localhost'])
jwt = JWTManager(app)

# Database configuration
DB_CONFIG = {
    'dbname': os.getenv('DB_NAME', 'project_db'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', '1234'),
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432')
}


def get_db_connection():
    """Creates and returns a PostgreSQL database connection."""
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)


@app.route('/', methods=['GET'])
def home():
    """Serves the home page to verify the server is running."""
    return render_template('index.html')


@app.route('/api/health', methods=['GET'])
def health_check():
    """Returns the health status of the API service."""
    return jsonify({'status': 'healthy', 'service': 'stats-api'}), 200


@app.route('/api/login', methods=['POST'])
def login():
    """Authenticates admin users and returns a JWT access token."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Get user with admin privileges (is_staff = true)
        cur.execute("""
            SELECT id, email, password, first_name, last_name, is_staff 
            FROM accounts_user 
            WHERE email = %s AND is_staff = true
        """, (email,))

        user = cur.fetchone()
        cur.close()
        conn.close()

        if not user:
            return jsonify({'error': 'Invalid credentials or not an admin'}), 401

        # Verify Django password hash
        if not verify_django_password(password, user['password']):
            return jsonify({'error': 'Invalid credentials'}), 401

        # Create JWT token
        access_token = create_access_token(
            identity=str(user['id']),
            additional_claims={
                'email': user['email'],
                'first_name': user['first_name'],
                'last_name': user['last_name']
            }
        )

        return jsonify({
            'access_token': access_token,
            'user': {
                'email': user['email'],
                'first_name': user['first_name'],
                'last_name': user['last_name']
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout endpoint - invalidates the token (client-side handling)."""
    return jsonify({'message': 'Logged out successfully'}), 200


@app.route('/api/stats/vacations', methods=['GET'])
@jwt_required()
def vacation_stats():
    """
    Get vacation statistics.
    Returns: { "pastVacations": 12, "ongoingVacations": 7, "futureVacations": 15 }
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        today = datetime.now().date()

        # Count past vacations
        cur.execute("""
            SELECT COUNT(*) as count 
            FROM vacations_vacation 
            WHERE end_date < %s
        """, (today,))
        past_count = cur.fetchone()['count']

        # Count ongoing vacations
        cur.execute("""
            SELECT COUNT(*) as count 
            FROM vacations_vacation 
            WHERE start_date <= %s AND end_date >= %s
        """, (today, today))
        ongoing_count = cur.fetchone()['count']

        # Count future vacations
        cur.execute("""
            SELECT COUNT(*) as count 
            FROM vacations_vacation 
            WHERE start_date > %s
        """, (today,))
        future_count = cur.fetchone()['count']

        cur.close()
        conn.close()

        return jsonify({
            'pastVacations': past_count,
            'ongoingVacations': ongoing_count,
            'futureVacations': future_count
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/users/total', methods=['GET'])
@jwt_required()
def total_users():
    """Returns the total count of non-admin users in the system."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            "SELECT COUNT(*) as count FROM accounts_user WHERE is_staff = false")
        count = cur.fetchone()['count']

        cur.close()
        conn.close()

        return jsonify({'totalUsers': count}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/likes/total', methods=['GET'])
@jwt_required()
def total_likes():
    """Returns the total count of likes across all vacations."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("SELECT COUNT(*) as count FROM vacations_like")
        count = cur.fetchone()['count']

        cur.close()
        conn.close()

        return jsonify({'totalLikes': count}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/likes/distribution', methods=['GET'])
@jwt_required()
def likes_distribution():
    """Returns the distribution of likes grouped by vacation destinations."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT 
                c.name as destination,
                COUNT(l.id) as likes
            FROM vacations_vacation v
            JOIN core_country c ON v.country_id = c.id
            LEFT JOIN vacations_like l ON v.id = l.vacation_id
            GROUP BY c.id, c.name
            ORDER BY likes DESC, c.name
        """)

        results = cur.fetchall()
        cur.close()
        conn.close()

        # Convert to list of dicts
        distribution = [
            {'destination': row['destination'], 'likes': row['likes']}
            for row in results
        ]

        return jsonify(distribution), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/stats/summary', methods=['GET'])
@jwt_required()
def stats_summary():
    """Returns all dashboard statistics in a single API call for efficiency."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        today = datetime.now().date()

        # Vacation stats
        cur.execute("""
            SELECT 
                COUNT(CASE WHEN end_date < %s THEN 1 END) as past,
                COUNT(CASE WHEN start_date <= %s AND end_date >= %s THEN 1 END) as ongoing,
                COUNT(CASE WHEN start_date > %s THEN 1 END) as future
            FROM vacations_vacation
        """, (today, today, today, today))
        vacation_stats = cur.fetchone()

        # User count
        cur.execute(
            "SELECT COUNT(*) as count FROM accounts_user WHERE is_staff = false")
        user_count = cur.fetchone()['count']

        # Likes count
        cur.execute("SELECT COUNT(*) as count FROM vacations_like")
        likes_count = cur.fetchone()['count']

        # Likes distribution
        cur.execute("""
            SELECT 
                c.name as destination,
                COUNT(l.id) as likes
            FROM vacations_vacation v
            JOIN core_country c ON v.country_id = c.id
            LEFT JOIN vacations_like l ON v.id = l.vacation_id
            GROUP BY c.id, c.name
            ORDER BY likes DESC, c.name
            LIMIT 10
        """)
        top_destinations = cur.fetchall()

        cur.close()
        conn.close()

        return jsonify({
            'vacationStats': {
                'pastVacations': vacation_stats['past'],
                'ongoingVacations': vacation_stats['ongoing'],
                'futureVacations': vacation_stats['future']
            },
            'totalUsers': user_count,
            'totalLikes': likes_count,
            'topDestinations': [
                {'destination': row['destination'], 'likes': row['likes']}
                for row in top_destinations
            ]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def startup_check():
    """Checks and displays admin users on server startup for debugging purposes."""
    try:
        print("\n" + "="*50)
        print(" FLASK BACKEND STARTUP - CHECKING ADMIN USERS")
        print("="*50)

        conn = get_db_connection()
        list_admin_users(conn)
        conn.close()

        print("\n To create new admin users:")
        print("   1. Access Django admin at http://localhost:8000/admin")
        print("   2. Or create via Django shell in the Django container")
        print("   3. Make sure user has 'is_staff = True' to access dashboard")
        print("="*50 + "\n")

    except Exception as e:
        print(f" Error checking admin users: {e}")


if __name__ == '__main__':
    startup_check()
    app.run(debug=True, host='0.0.0.0', port=5001)
