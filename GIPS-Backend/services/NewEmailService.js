const nodemailer = require('nodemailer');
const AppError = require('../utils/appError');

class EmailService {
  constructor() {
    this.transport = nodemailer.createTransport({
      host: 'mail.gips.ac.bw',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GIPS_SMTP_USERNAME,
        pass: process.env.GIPS_SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(mailOptions) {
    // Ensure a default "from" address if none is provided
    mailOptions.from = mailOptions.from || 'enquiries@gips.ac.bw';

    return new Promise((resolve, reject) => {
      this.transport.sendMail(mailOptions, (error, info) => {
        if (error) {
          return reject(new AppError(`${error.response}`, error.responseCode));
        }
        resolve({
          status: 200,
          message: 'Email successfully sent',
        });
      });
    });
  }
}

module.exports = new EmailService();
