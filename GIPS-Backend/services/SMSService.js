// services/SMSService.js

const client = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  
  class SMSService {
    async sendSMS(smsData) {
      const { body, to } = smsData;
  
      // Validate the SMS data
      if (!body || !to || !Array.isArray(to) || to.length === 0) {
        throw new Error('Invalid SMS data. "body" and "to" (an array) are required fields');
      }
  
      try {
        const results = await Promise.all(
          to.map((recipient) =>
            client.messages.create({
              body,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: recipient,
            })
          )
        );
  
        return {
          status: 200,
          message: 'SMS sent successfully',
          data: results.map((message) => ({ sid: message.sid })),
        };
      } catch (error) {
        throw new Error(error.message || 'Failed to send SMS');
      }
    }
  }
  
  module.exports = new SMSService();