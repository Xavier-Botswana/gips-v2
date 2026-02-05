// middlewares/loggerMiddleware.js
const Logger = require('../utils/logger');

const loggerMiddleware = (req, res, next) => {
  // Store the original end method
  const originalEnd = res.end;

  // Override the end method to log the response
  res.end = function (chunk, encoding) {
    // Check if a user is authenticated
    if (req.user) {
      const logData = {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        timestamp: new Date().toISOString(),
      };

      // Log the request
      Logger.log('API_REQUEST', req.user, logData);
    }

    // Call the original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

module.exports = loggerMiddleware;
