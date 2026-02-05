const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const xssClean = require('xss-clean');
const swaggerUI = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
require('dotenv').config();

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const HTTP_STATUS = require('./utils/httpStatus');
const {
  globalLimiter,
  authLimiter,
  passwordResetLimiter,
  registrationLimiter,
  applicationLimiter,
  emailLimiter,
  expensiveLimiter,
} = require('./middlewares/rateLimiter');
const {
  globalTimeout,
  routeTimeout,
  handleTimeout,
} = require('./middlewares/timeout');
const { sanitizeRequest } = require('./utils/sanitize');
const { getDatabaseHealth } = require('./utils/dbHealth');
const userRouter = require('./routes/userRoutes');
const guestRouter = require('./routes/guestRoutes');
const applicationRouter = require('./routes/applicationRoutes');
const lecturerRouter = require('./routes/lecturerRoutes');
const studentRouter = require('./routes/studentRoutes');
const emailRouter = require('./routes/emailRoutes');
const registrationRouter = require('./routes/registrationRoutes');
const moduleRouter = require('./routes/moduleRoutes');
const courseRouter = require('./routes/courseRoutes');
const semesterRouter = require('./routes/semesterRoutes');
const semesterRegistrationRouter = require('./routes/semesterRegistrationRoutes');
const superAdminRouter = require('./routes/superAdminRoutes');
const resultsRouter = require('./routes/resultsRoutes');
const analyticsRouter = require('./routes/analyticsRoutes');
const facultyRouter = require('./routes/facultyRoutes');
const notificationRouter = require('./routes/notificationRoutes');
const smsRouter = require('./routes/smsRoutes');
const calendarRouter = require('./routes/calendarRoutes');
const logRouter = require('./routes/logRoutes');
const transcriptRoutes = require('./routes/transcriptRoutes');
const archiveRoutes = require('./routes/archiveRoutes');
const resultSlipRoutes = require('./routes/resultSlipRoutes');
const hodRoutes = require('./routes/hodRoutes');
const dtefRouter = require('./routes/dtefRoutes');
const admissionLetterRouter = require('./routes/admissionLetterRoutes');

const app = express();
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GIPS API Documentation',
      version: '1.0.0',
      description: 'API Documentation for GIPS Backend',
    },
    servers: [
      {
        url: 'http://localhost:8000/',
        description: 'Local development server',
      },
      {
        url: 'https://gips-uat.testenvironment.tech/api',
        description: 'UAT server',
      },
      {
        url: 'https://applications.gips.ac.bw/api',
        description: 'Production server',
      },
    ],
  },
  apis: ['routes/*.js'],
};
const specs = swaggerJSDoc(options);

const allowedOrigins = [
  'https://applications.gips.ac.bw',
  'https://gips-uat.testenvironment.tech',
  'http://localhost:3000',
  'http://localhost:8000',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// XSS Protection - sanitize all user inputs
app.use(xssClean());
app.use(sanitizeRequest());

// Global rate limiting - applied to all routes
app.use(globalLimiter);

// Global request timeout - applied to all routes
app.use(globalTimeout);

// Health check endpoint (no rate limit, short timeout)
app.get('/health', async (req, res) => {
  const detailed = req.query.detailed === 'true';
  
  // Check database health
  const dbHealth = await getDatabaseHealth();
  
  const healthStatus = {
    status: dbHealth.connected ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {
      api: {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
      database: detailed ? dbHealth : {
        status: dbHealth.status,
        connected: dbHealth.connected,
        responseTime: dbHealth.responseTime,
      },
    },
  };
  
  // Return 503 if database is down
  const statusCode = dbHealth.connected ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

// Apply specific rate limiters to sensitive endpoints
// Authentication endpoints - strict limits
app.use('/v1/users/login', authLimiter);

// Password reset endpoints - very strict limits
app.use('/v1/users/request-password-reset', passwordResetLimiter);
app.use('/v1/users/confirm-password-reset', passwordResetLimiter);

//BASE API ENDPOINTS FOR RESOURCES
app.use('/v1/users', userRouter);
app.use('/v1/superadmin', superAdminRouter);
app.use('/v1/applications', applicationRouter);
app.use('/v1/guests', guestRouter);
app.use('/v1/emails', emailLimiter, emailRouter);
app.use('/v1/students', studentRouter);
app.use('/v1/lecturers', lecturerRouter);
app.use('/v1/registration', registrationRouter);
app.use('/v1/modules', moduleRouter);
app.use('/v1/courses', courseRouter);
app.use('/v1/semesters', semesterRouter);
app.use('/v1/register', semesterRegistrationRouter);
app.use('/v1/results', resultsRouter);
app.use('/v1/analytics', expensiveLimiter, routeTimeout('analytics'), analyticsRouter);
app.use('/v1/faculties', facultyRouter);
app.use('/v1/notifications', notificationRouter);
app.use('/v1/calendar', calendarRouter);
app.use('/v1/sms', smsRouter);
app.use('/v1/', logRouter);
app.use('/v1/transcripts', expensiveLimiter, routeTimeout('transcripts'), transcriptRoutes);
app.use('/v1/archives', expensiveLimiter, routeTimeout('archives'), archiveRoutes);
app.use('/v1/result-slip', expensiveLimiter, routeTimeout('result-slip'), resultSlipRoutes);
app.use('/v1/hod', hodRoutes);
app.use('/v1/dtef', routeTimeout('dtef'), dtefRouter);
app.use('/v1/admission-letters', admissionLetterRouter);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, HTTP_STATUS.NOT_FOUND));
});

// Handle timeout errors
app.use(handleTimeout);

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
