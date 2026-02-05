const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Programming or unknown error
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
};

module.exports = (err, _req, res, _next) => {
  const error = err instanceof AppError ? err : new AppError(err.message || 'Error', err.statusCode || 500);

  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'production') {
    return sendErrorProd(error, res);
  }

  return sendErrorDev(error, res);
};
