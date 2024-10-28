SMS Management System Documentation 
The SMS Management System is designed to track SMS metrics and manage country-specific operators for monitoring and control purposes. It provides a secure, user-friendly web interface for authentication, SMS metrics visualization, and country/operator management. This system comprises a FastAPI backend and a React frontend with RESTful API endpoints for operations like authentication, fetching SMS metrics, starting and stopping sessions, and managing country operators. 
Technologies Used 
•	Frontend: React, Axios, Chart.js, Tailwind CSS, Framer Motion 
•	Backend: FastAPI, 
•	Database: MongoDB, mySQL 
•	API Documentation: FastAPI interactive docs (Swagger UI) 
 

Features 
•	User Authentication: 
•	Login & Signup: Users can log in or create an account with a username, email, and password. 
•	Token-based Authentication: Uses access and refresh tokens with automatic renewal. 
•	Logout: Clears user session. 
•	SMS Metrics Visualization: 
•	Dashboard Display: Graphs showing metrics like SMS sent, success rates, and failures per country and operator. 
•	Real-time Updates: Sessions can be started/stopped for specific country operators, updating metrics in real-time. 
•	Country Operator Management: 
•	Add/Update/Delete Operators: Manage operators assigned to specific countries. 
•	High-Priority Flag: Operators can be marked as high priority. 
 
Terminal Commands for project setup : 
•	Inside fastAPI directory :  
o	python -m venv venv o venv\Scripts\activate 
o	pip install fastapi uvicorn motor pymongo mysql-connector-python python-jose  o pip install bcrypt==3.20 
o	uvicorn main:app –reload     // To start the server  

  To set up the SMS Management System using Docker, follow these steps:
docker-compose up --build
docker-compose up

  To setup it Locally :
Now, Open a new terminal and and run cd frontend 
•	In frontend : 
o	npm i        //To install all the required dependencies specified in package.json file. 
o	Npm run dev  // To run the frontend. 
Now, our frontend will be running at localhost:5173 & backend will be running at localhost:5000. 
 
API Endpoints 
 	Authentication Endpoints : 
•	POST /token :  Authenticates user with username, email, and password, returning an access token. 
Request body : 
{ "username": "string", "email": "string", "password": "string" } 
•	POST /signup: Registers a new user with username, email, and password. Request Body: 
{ "username": "string", "email": "string", "password": "string" } 
 
•	POST /logout: Logs out the current user by invalidating their token. 
 
SMS Metrics Endpoints : 
•	GET /metrics/all 
 
Country Operators Endpoints : 
•	GET /country_operators : Lists all country operators with high-priority flag details. 
•	POST /country_operator : Adds a new country operator. Request body: 
{ "country": "string", "operator": "string", "is_high_priority": bool } 
•	PUT /country_operator/{operator_id}: Updates a country operator by 
ID. 
Request body : 
{ "country": "string", "operator": "string", "is_high_priority": bool } 
•	DELETE /country_operator/{operator_id} : Deletes a country operator by ID. 
 
Session Control Endpoints 
•	POST /start_session/{country}/{operator} :  Starts a new SMS session for a specific country and operator. 
•	POST /stop_session/{country}/{operator} : Stops the SMS session for a specific country and operator. 
