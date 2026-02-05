const pb = require('../utils/dbBase');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const HTTP_STATUS = require('../utils/httpStatus');

exports.authenticateWithPassword = catchAsync(async (req, res, next) => {
  const { identity, password } = req.body;

  const authData = await pb
    .collection('users')
    .authWithPassword(identity, password)
    .catch(() => {
      throw new AppError('Authentication failed', HTTP_STATUS.UNAUTHORIZED);
    });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    token: authData.token,
    user: authData.record,
  });
});

exports.requestPasswordReset = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  await pb.collection('users').requestPasswordReset(email).catch(() => {
    throw new AppError('Password reset request failed', HTTP_STATUS.BAD_REQUEST);
  });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    message: 'Password reset request sent',
  });
});

exports.confirmPasswordReset = catchAsync(async (req, res, next) => {
  const { token, password, passwordConfirm } = req.body;

  await pb
    .collection('users')
    .confirmPasswordReset(token, password, passwordConfirm)
    .catch(() => {
      throw new AppError('Password reset confirmation failed', HTTP_STATUS.BAD_REQUEST);
    });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    message: 'Password reset successful',
  });
});

exports.requestEmailChange = catchAsync(async (req, res, next) => {
  const { newEmail } = req.body;

  await pb.collection('users').requestEmailChange(newEmail).catch(() => {
    throw new AppError('Email change request failed', HTTP_STATUS.BAD_REQUEST);
  });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    message: 'Email change request sent',
  });
});

exports.confirmEmailChange = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;

  await pb.collection('users').confirmEmailChange(token, password).catch(() => {
    throw new AppError('Email change confirmation failed', HTTP_STATUS.BAD_REQUEST);
  });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    message: 'Email change confirmed',
  });
});
