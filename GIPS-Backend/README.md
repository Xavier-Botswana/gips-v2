# GIPS Backend

## Overview

The **GIPS Backend** is a Node.js-based application designed to handle backend operations for the GIPS system. This system includes functionalities for managing users, sending notifications (e.g., SMS and emails), and handling requests from a frontend application. The backend is built using the Express.js framework and integrates various services like PocketBase and Twilio.

## Features

- **Express.js**: Core framework for building the REST API.
- **PocketBase SDK**: Integration with PocketBase for database operations.
- **JWT Authentication**: Secure authentication using JSON Web Tokens.
- **Twilio API Integration**: Used for sending SMS notifications.
- **Nodemailer**: Email handling for notifications and other communications.
- **Swagger Documentation**: Automatically generated API documentation.
- **PDF Generation**: Handling of PDF files using `pdf-lib`.
- **Jest**: Unit and integration tests for the application.
- **Multer**: File upload middleware for handling multipart/form-data.
- **Environment Management**: `.env` files handled by `dotenv`.
- **New Relic**: Application performance monitoring.

## Prerequisites

- **Node.js**: `>=10.0.0`
- **NPM**: `>=6.x`
- **PocketBase**: For backend data storage
- **Twilio Account**: For SMS service
- **Email SMTP server**: For sending emails

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-repo/GIPS-backend.git
   ```

2. **Install dependencies**:

   ```bash
   cd GIPS-backend
   npm install
   ```

3. **Set up environment variables**:

   Create a `.env` file in the root of the project with the following variables:

   ```bash
   PORT=3000
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   EMAIL_HOST=smtp.your-email-provider.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@domain.com
   EMAIL_PASS=your_email_password
   JWT_SECRET=your_jwt_secret
   ```

4. **Run the development server**:

   ```bash
   npm start
   ```

   For production, use:

   ```bash
   npm run start:prod
   ```

## API Documentation

The project uses **Swagger UI** for API documentation. Once the server is running, you can access the API docs at:

```
http://localhost:3000/api-docs
```

## Running Tests

The project uses **Jest** for testing, and **Supertest** for testing HTTP requests.

To run the tests, simply execute:

```bash
npm test
```

## Folder Structure

```bash
├── controllers        # API route handlers
├── middlewares        # Express middlewares
├── routes             # Route definitions
├── utils              # Utility functions
├── mocks              # Mock data for testing
├── tests              # Jest test cases
├── app.js             # Main app file
├── server.js          # Server entry point
├── Dockerfile         # Docker setup for containerization
├── deploy_script.sh   # Deployment script
└── README.md          # Project documentation
```

## Key Dependencies

- **Express.js**: HTTP server for routing and handling requests.
- **PocketBase**: Used for backend data storage and authentication.
- **Twilio**: SMS notifications service.
- **Joi**: Schema validation for incoming API requests.
- **Swagger**: Auto-generates API documentation.
- **Nodemailer**: Email sending service.
- **JWT**: For token-based authentication.

## Deployment

To deploy the backend, ensure the environment variables are correctly set in the target environment. You can use Docker for easy deployment.

1. **Build Docker image**:

   ```bash
   docker build -t gips-backend .
   ```

2. **Run the container**:

   ```bash
   docker run -p 3000:3000 --env-file .env gips-backend
   ```
