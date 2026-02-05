const HTTP_STATUS = require('../utils/httpStatus');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.sendSMS = catchAsync(async (req, res, next) => {
  const { body, to } = req.body;

  // Add validation
  if (!body || !to || !Array.isArray(to) || to.length === 0) {
    return next(new AppError('Invalid request. Body and to (array) are required fields', 400));
  }

  const results = await Promise.all(
    to.map((recipient) =>
      client.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: recipient,
      }),
    ),
  );

  return res.status(HTTP_STATUS.OK).json({
    status: 'success',
    message: 'SMS sent successfully',
    data: results.map((message) => ({ sid: message.sid })),
  });
});
