const request = require('supertest');
const express = require('express');
const pb = require('../utils/dbBase'); // Mocked PocketBase SDK instance
const logController = require('../controllers/logController');

jest.mock('../utils/dbBase');

const app = express();
app.use(express.json());

// Set up routes
const router = express.Router();

router.get('/logs', logController.getLogs);

app.use('/api/v1', router);

// Error handling middleware for the test app
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message,
  });
});

describe('Log Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/logs', () => {
    it('should return all logs with pagination and filters', async () => {
      const mockLogs = {
        status: 'success',
        items: [
          { id: '1', activity: 'Login', date: '2023-10-01' },
          { id: '2', activity: 'Logout', date: '2023-10-02' },
        ],
        page: 1,
        perPage: 10,
        totalItems: 2,
        totalPages: 1,
      };

      pb.collection.mockReturnValue({
        getList: jest.fn().mockResolvedValue(mockLogs),
      });

      const res = await request(app).get('/api/v1/logs');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        status: 'success',
        results: mockLogs.items.length,
        currentPage: mockLogs.page,
        totalPages: mockLogs.totalPages,
        totalRecords: mockLogs.totalItems,
        logs: mockLogs.items,
      });
      expect(pb.collection).toHaveBeenCalledWith('system_logs');
      expect(pb.collection().getList).toHaveBeenCalledWith(1, 10, {
        sort: '-created',
      });
    });

    it('should handle errors when failing to get logs', async () => {
      pb.collection.mockReturnValue({
        getList: jest
          .fn()
          .mockRejectedValue(new Error('Failed to retrieve log entries')),
      });

      const res = await request(app).get('/api/v1/logs');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty(
        'message',
        'Failed to retrieve log entries',
      );
    });
  });
});
