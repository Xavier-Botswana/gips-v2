const catchAsync = require('../utils/catchAsync');
// const emailService = require('../services/EmailService');
const emailService = require('../services/NewEmailService');

exports.sendNotification = catchAsync(async (req, res) => {
  const emailResponse = await emailService.sendEmail(req.body);
  res.status(emailResponse.status).json(emailResponse.message);
});
