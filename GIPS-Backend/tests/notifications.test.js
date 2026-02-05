const request = require('supertest');
const express = require('express');
const pb = require('../utils/dbBase'); // Mocked PocketBase SDK instance
const notificationController = require('../controllers/notificationController');
const authenticate = require('../middlewares/authenticate');
const logActivity = require('../middlewares/logger');
const { sendNotification } = require('../controllers/emailController');
const { sendSMS } = require('../controllers/smsController');

jest.mock('../utils/dbBase');
jest.mock('../middlewares/authenticate');
jest.mock('../middlewares/logger');
jest.mock('../controllers/emailController');
jest.mock('../controllers/smsController');

const app = express();
app.use(express.json());

// Mock middlewares
authenticate.mockImplementation((req, res, next) => next());
logActivity.mockImplementation(() => (req, res, next) => next());

// Set up routes
const router = express.Router();

router
  .get(
    '/',
    authenticate,
    logActivity('accessed notifications'),
    notificationController.getNotifications,
  )
  .post(
    '/',
    authenticate,
    logActivity('created a notification'),
    notificationController.createNotification,
  );

router.delete(
  '/:id',
  authenticate,
  logActivity('deleted a notification'),
  notificationController.deleteNotification,
);
router.patch(
  '/:id',
  authenticate,
  logActivity('updated a notification'),
  notificationController.updateNotification,
);

app.use('/api/v1/notifications', router);

// Error handling middleware for the test app
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message,
  });
});

describe('Notification Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/notifications', () => {
    it('should return all notifications', async () => {
      const mockNotifications = {
        items: [
          { id: '1', communicationTopic: 'Topic 1' },
          { id: '2', communicationTopic: 'Topic 2' },
        ],
        totalItems: 2,
        totalPages: 1,
        page: 1,
      };

      pb.collection.mockReturnValue({
        getList: jest.fn().mockResolvedValue(mockNotifications),
      });

      const res = await request(app).get('/api/v1/notifications');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        status: 'success',
        results: mockNotifications.items.length,
        currentPage: mockNotifications.page,
        totalPages: mockNotifications.totalPages,
        totalRecords: mockNotifications.totalItems,
        notifications: mockNotifications.items,
      });
      expect(pb.collection).toHaveBeenCalledWith('notifications');
      expect(pb.collection().getList).toHaveBeenCalledWith(1, 20, {
        sort: '-created',
      });
    });

    it('should handle errors when failing to get notifications', async () => {
      pb.collection.mockReturnValue({
        getList: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      const res = await request(app).get('/api/v1/notifications');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'DB Error');
    });
  });
  describe('POST /api/v1/notifications', () => {
    let newNotificationData;

    beforeEach(() => {
      newNotificationData = {
        communicationTopic: 'New Event',
        messageDescription: 'Details about the event',
        communicationChannel: 'Email',
        audience: 'Students',
        date: '2024-11-05',
      };
    });

    it('should create a new notification and send emails when communicationChannel is Email', async () => {
      pb.collection.mockImplementation(() => ({
        create: jest
          .fn()
          .mockResolvedValue({ id: '123', ...newNotificationData }),
        getFullList: jest
          .fn()
          .mockResolvedValue([{ email: 'test@example.com' }]),
      }));
      sendNotification.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/v1/notifications')
        .send(newNotificationData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        status: 'success',
        notification: {
          notification: { id: '123', ...newNotificationData },
        },
      });
      expect(sendNotification).toHaveBeenCalled();
    });

    it('should create a new notification and send SMS when communicationChannel is SMS', async () => {
      newNotificationData.communicationChannel = 'SMS';
      pb.collection.mockImplementation(() => ({
        create: jest
          .fn()
          .mockResolvedValue({ id: '456', ...newNotificationData }),
        getFullList: jest
          .fn()
          .mockResolvedValue([{ phoneNumber: '+1234567890' }]),
      }));
      sendSMS.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/v1/notifications')
        .send(newNotificationData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        status: 'success',
        notification: {
          notification: { id: '456', ...newNotificationData },
        },
      });
      expect(sendSMS).toHaveBeenCalled();
    });
  });

  describe('PATCH /api/v1/notifications/:id', () => {
    it('should update a notification by ID', async () => {
      const notificationId = '1';
      const updateData = {
        communicationTopic: 'Updated Topic',
        messageDescription: 'Updated message',
      };

      const updatedNotification = {
        id: notificationId,
        ...updateData,
      };

      pb.collection.mockReturnValue({
        update: jest.fn().mockResolvedValue(updatedNotification),
      });

      const res = await request(app)
        .patch(`/api/v1/notifications/${notificationId}`)
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        status: 'success',
        notification: {
          notification: updatedNotification,
        },
      });
      expect(pb.collection).toHaveBeenCalledWith('notifications');
      expect(pb.collection().update).toHaveBeenCalledWith(
        notificationId,
        updateData,
      );
    });

    it('should handle validation errors when updating a notification', async () => {
      const notificationId = '1';
      const invalidUpdateData = {
        communicationTopic: '',
      };

      const res = await request(app)
        .patch(`/api/v1/notifications/${notificationId}`)
        .send(invalidUpdateData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('status', 'fail');
      expect(res.body).toHaveProperty('message');
    });

    it('should handle errors when failing to update a notification', async () => {
      const notificationId = '1';
      const updateData = {
        communicationTopic: 'Updated Topic',
        messageDescription: 'Updated message',
      };

      pb.collection.mockReturnValue({
        update: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      const res = await request(app)
        .patch(`/api/v1/notifications/${notificationId}`)
        .send(updateData);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty(
        'message',
        'Failed to update notification',
      );
    });
  });

  describe('DELETE /api/v1/notifications/:id', () => {
    it('should delete a notification by ID', async () => {
      const notificationId = '1';

      pb.collection.mockReturnValue({
        delete: jest.fn().mockResolvedValue(),
      });

      const res = await request(app).delete(
        `/api/v1/notifications/${notificationId}`,
      );

      expect(res.statusCode).toEqual(204);
      expect(res.body).toEqual({});
      expect(pb.collection).toHaveBeenCalledWith('notifications');
      expect(pb.collection().delete).toHaveBeenCalledWith(notificationId);
    });

    it('should handle errors when failing to delete a notification', async () => {
      const notificationId = '1';

      pb.collection.mockReturnValue({
        delete: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      const res = await request(app).delete(
        `/api/v1/notifications/${notificationId}`,
      );

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty(
        'message',
        'Failed to delete notification',
      );
    });
  });
});
