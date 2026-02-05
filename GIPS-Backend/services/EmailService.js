const nodemailer = require('nodemailer');
const AppError = require('../utils/appError');
const appLogger = require('../utils/appLogger');

class EmailService {
  constructor() {
    this.transport = nodemailer.createTransport({
      host: 'mail.gips.ac.bw',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GIPS_SMTP_USER,
        pass: process.env.GIPS_SMTP_PASSWORD,
      },
    });

    // Optional: Verify transporter configuration on startup
    const isDev = process.env.NODE_ENV === 'development';
    this.transport.verify((error, success) => {
      if (error) {
        // Always log email errors as they are critical
        appLogger.error('Error configuring email transporter', { error: error.message });
      } else if (isDev) {
        // Only log success in development
        appLogger.info('Email transporter is configured and ready');
      }
    });
  }

  async sendEmail(mailOptions) {
    // Set a default "from" address if none is provided
    mailOptions.from = mailOptions.from || 'enquiries@gips.ac.bw';

    try {
      const info = await this.transport.sendMail(mailOptions);
      return {
        status: 200,
        message: 'Email successfully sent',
        info, // You can optionally return the full info from the transporter
      };
    } catch (error) {
      // Use error.response if available, otherwise fall back to error.message
      const errorMessage = error.response || error.message || 'Unknown error';
      // Use error.responseCode if available, otherwise default to 500
      const statusCode = error.responseCode || 500;
      throw new AppError(errorMessage, statusCode);
    }
  }
}

module.exports = new EmailService();

// const nodemailer = require('nodemailer');
// const AppError = require('../utils/appError');

// class EmailService {
//   constructor() {
//     this.transport = nodemailer.createTransport({
//       host: 'mail.gips.ac.bw',
//       port: 465,
//       secure: true,
//       auth: {
//         user: process.env.GIPS_SMTP_USER,
//         pass: process.env.GIPS_SMTP_PASSWORD,
//       },
//     });
//   }

//   async sendEmail(mailOptions) {
//     mailOptions.from = mailOptions.from || 'enquiries@gips.ac.bw';

//     return new Promise((resolve, reject) => {
//       this.transport.sendMail(mailOptions, (error) => {
//         if (error) {
//           reject(new AppError(`${error.response}`, error.responseCode));
//         } else {
//           resolve({
//             status: 200,
//             message: 'email successfully sent',
//           });
//         }
//       });
//     });
//   }
// }

// module.exports = new EmailService();
