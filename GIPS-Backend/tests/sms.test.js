// smsController.test.js

// Mock environment variables before importing the controller
process.env.TWILIO_ACCOUNT_SID = 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
process.env.TWILIO_AUTH_TOKEN = 'your_auth_token';
process.env.TWILIO_PHONE_NUMBER = '+11234567890';

// Mock the 'twilio' module before importing the controller
const mockMessagesCreate = jest.fn();

jest.mock('twilio', () => {
  return jest.fn(() => ({
    messages: {
      create: mockMessagesCreate,
    },
  }));
});

const request = require('supertest');
const express = require('express');
const smsController = require('../controllers/smsController');
const authenticate = require('../middlewares/authenticate');

jest.mock('../middlewares/authenticate');

const app = express();
app.use(express.json());

// Mock middlewares
authenticate.mockImplementation((req, res, next) => next());

// Set up routes
app.post('/api/v1/sms/send', authenticate, smsController.sendSMS);

describe('SMS Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/sms/send', () => {
    it('should successfully send SMS when valid data is provided', async () => {
      const smsData = {
        body: 'This is a test message',
        to: ['+1234567890'],
      };

      mockMessagesCreate.mockResolvedValue({ sid: 'test_sid_123' });

      const res = await request(app)
        .post('/api/v1/sms/send')
        .send(smsData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        status: 'success',
        message: 'SMS sent successfully',
        data: [{ sid: 'test_sid_123' }],
      });
      expect(mockMessagesCreate).toHaveBeenCalledTimes(1);
      expect(mockMessagesCreate).toHaveBeenCalledWith({
        body: smsData.body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: smsData.to[0],
      });
    });

    it('should handle errors when failing to send SMS', async () => {
      const smsData = {
        body: 'This is a test message',
        to: ['+1234567890'],
      };

      const errorMessage = 'Twilio Error';
      mockMessagesCreate.mockRejectedValue(new Error(errorMessage));

      const res = await request(app)
        .post('/api/v1/sms/send')
        .send(smsData);

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        status: 'error',
        message: 'Failed to send SMS',
        error: errorMessage,
      });
      expect(mockMessagesCreate).toHaveBeenCalledTimes(1);
    });

    it('should handle validation errors when required fields are missing', async () => {
      const smsData = {
        // Missing 'body' and 'to' fields
      };

      const res = await request(app)
        .post('/api/v1/sms/send')
        .send(smsData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        status: 'error',
        message: 'Invalid request. Body and to (array) are required fields',
      });
      expect(mockMessagesCreate).not.toHaveBeenCalled();
    });
  });
});

afterAll(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});
