const appLogger = require('./utils/appLogger');

process.on('uncaughtException', (err) => {
  appLogger.error('UNCAUGHT EXCEPTION! Shutting down...', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

// dotenv.config({ path: './config.env' });
const app = require('./app');
const { validateEnvOnStartup } = require('./utils/envValidator');
const { validateDatabaseOnStartup } = require('./utils/dbHealth');

const port = 8000;

// Start server with validation
const startServer = async () => {
  // Step 1: Validate environment variables
  // This will exit if required variables are missing or invalid
  validateEnvOnStartup();
  
  // Step 2: Validate database connection
  // This will exit if database is not available
  await validateDatabaseOnStartup();
  
  // Step 3: Start HTTP server only after all validations pass
  const server = app.listen(port, () => {
    appLogger.info(`App running on port ${port}`);
    appLogger.info(`API Documentation: http://localhost:${port}/api-docs`);
    appLogger.info(`Health Check: http://localhost:${port}/health`);
    appLogger.info('Server started successfully');
  });

  process.on('unhandledRejection', (err) => {
    appLogger.error('UNHANDLED REJECTION! Shutting down...', {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });

    server.close(() => {
      process.exit(1);
    });
  });
};

// Start the server
startServer();
