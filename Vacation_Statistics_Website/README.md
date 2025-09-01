##  Technology Used

- Frontend: React 18.2, TypeScript 4.9, Recharts, Axios, Bootstrap 5
- Backend: Flask 3.0, Flask-JWT-Extended, Flask-CORS, psycopg2, python-dotenv
- Database: PostgreSQL 15
- Authentication: JWT (JSON Web Tokens)
- DevOps: Docker, Docker Compose, AWS compatibility
- Other: RESTful API, modern responsive UI
- DockerHub of the project : https://hub.docker.com/repositories/al7koz

## Overview

This project provides a comprehensive statistics dashboard for administrators to monitor vacation system metrics, user engagement, and destination popularity through an intuitive interface with real-time data visualization.


## Authors:

  #### Doron Shalom & Alexey Kozlov ###
- Course: Python Full Stack Web Developer
- Institution: John Bryce Training
- Role: Full Stack Developers


### Doron Shalom
- Email: doron1405@gmail.com
- GitHub: [@doron1405](https://github.com/doron1405)
- LinkedIn: [Doron Shalom](https://www.linkedin.com/in/doron-shalom-370977233/)


### Alexey Kozlov
- Email: AL7koz@gmail.com
- GitHub:[@AlexeyKoz](https://github.com/AlexeyKoz)
- LinkedIn [Alexey Kozlov](https://www.linkedin.com/in/alexey-kozlov-full-stack-developer/)

### Run the Project with Docker Compose

1. **Clone the repository**
```bash
git clone https://github.com/doron1405/Vacations_Demo_Project
```
2. **Install Docker Desktop (if installed already skip to part 3)**


3. **Run Docker Desktop**


4. **Run "clean-docker.bat" Located In The Project Folder**


5. **Run "start-docker.bat" Located In The Project Folder**



6. **After the batch file initialized you may the Access the Applications:**
- Dashboard: http://localhost:3000
- API: http://localhost:5001
- Vacation Website: http://localhost:8000

### Frontend Tests:
**Frontend Tests Include Six Tests One Positive and One Negative for Each of the Dashboard,About and Api Websites Six tests in Total**

### Step 1: Build the frontend image
```powershell
docker build --target frontend-build -t frontend-test
```

### Step 2: Run the tests
```powershell
docker run --rm frontend-test npm run test:frontend
```

### DONE!!!

