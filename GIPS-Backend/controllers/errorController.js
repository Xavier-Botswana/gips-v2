const AppError = require('../utils/appError');
const HTTP_STATUS = require('../utils/httpStatus');

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
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    message: 'Something went wrong',
  });
};

module.exports = (err, _req, res, _next) => {
  const error = err instanceof AppError ? err : new AppError(err.message || 'Error', err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR);

  error.statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'production') {
    return sendErrorProd(error, res);
  }

  return sendErrorDev(error, res);
};
