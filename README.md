# SMS Management System Documentation 

The SMS Management System is designed to track SMS metrics and manage country-specific operators for monitoring and control purposes. It provides a secure, user-friendly web interface for authentication, SMS metrics visualization, and country/operator management. This system comprises a FastAPI backend and a React frontend with RESTful API endpoints for operations like authentication, fetching SMS metrics, starting and stopping sessions, and managing country operators. 

## Technologies Used 
• Frontend: React, Axios, Chart.js, Tailwind CSS, Framer Motion  
• Backend: FastAPI  
• Database: MongoDB, MySQL  
• API Documentation: FastAPI interactive docs (Swagger UI)  

## Features 
• **User Authentication:**  
  • Login & Signup: Users can log in or create an account with a username, email, and password.  
  • Token-based Authentication: Uses access and refresh tokens with automatic renewal.  
  • Logout: Clears user session.  

• **SMS Metrics Visualization:**  
  • Dashboard Display: Graphs showing metrics like SMS sent, success rates, and failures per country and operator.  
  • Real-time Updates: Sessions can be started/stopped for specific country operators, updating metrics in real-time.  

• **Country Operator Management:**  
  • Add/Update/Delete Operators: Manage operators assigned to specific countries.  
  • High-Priority Flag: Operators can be marked as high priority.  

## Terminal Commands for Project Setup: 
• Inside FastAPI directory:  
  o `python -m venv venv`  
  o `venv\Scripts\activate`  
  o `pip install fastapi uvicorn motor pymongo mysql-connector-python python-jose`  
  o `pip install bcrypt==3.20`  
  o `uvicorn main:app --reload`  // To start the server  
• Inside frontend directory:
  npm i 
  npm run dev

To set up the SMS Management System using Docker, follow these steps:  
```bash
docker-compose up --build  
docker-compose up  
