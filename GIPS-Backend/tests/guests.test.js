// guestController.test.js

const request = require('supertest');
const express = require('express');
const pb = require('../utils/dbBase'); // Mocked PocketBase SDK instance
const guestController = require('../controllers/guestController');
const authenticate = require('../middlewares/authenticate');

jest.mock('../utils/dbBase', () => ({
  collection: jest.fn(),
}));
jest.mock('../middlewares/authenticate');

const app = express();
app.use(express.json());

// Set up routes
const router = express.Router();

router
  .route('/')
  .get(authenticate, guestController.getGuests)
  .post(authenticate, guestController.createGuest);

router
  .route('/:id')
  .get(authenticate, guestController.getGuest)
  .delete(authenticate, guestController.deleteGuest)
  .patch(authenticate, guestController.updateGuest);

app.use('/api/v1/guests', router);

// Error handling middleware for the test app
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message,
  });
});

describe('Guest Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the authenticate middleware to pass authentication
    authenticate.mockImplementation((req, res, next) => next());
  });

  describe('GET /api/v1/guests', () => {
    it('should return all guests', async () => {
      const mockGuests = {
        items: [
          { id: '1', name: 'Guest 1' },
          { id: '2', name: 'Guest 2' },
        ],
        totalItems: 2,
        totalPages: 1,
        page: 1,
        perPage: 20,
      };

      // Mock pb.collection('guests').getList(...)
      pb.collection.mockReturnValue({
        getList: jest.fn().mockResolvedValue(mockGuests),
      });

      const res = await request(app).get('/api/v1/guests');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        status: 'success',
        results: mockGuests.items.length,
        currentPage: 1,
        totalPages: mockGuests.totalPages,
        totalRecords: mockGuests.totalItems,
        data: mockGuests.items,
      });
      expect(pb.collection).toHaveBeenCalledWith('guests');
      expect(pb.collection().getList).toHaveBeenCalledWith(1, 20, {
        expand: 'user_id',
        sort: '-created',
      });
    });

    it('should handle errors when failing to get guests', async () => {
      const error = new Error('DB Error');

      pb.collection.mockReturnValue({
        getList: jest.fn().mockRejectedValue(error),
      });

      const res = await request(app).get('/api/v1/guests');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'DB Error');
    });
  });

  describe('GET /api/v1/guests/:id', () => {
    it('should return a guest by ID', async () => {
      const guestId = '1';
      const mockGuest = { id: guestId, name: 'Guest 1' };

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockResolvedValue(mockGuest),
      });

      const res = await request(app).get(`/api/v1/guests/${guestId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockGuest);
      expect(pb.collection).toHaveBeenCalledWith('guests');
      expect(pb.collection().getOne).toHaveBeenCalledWith(guestId);
    });

    it('should return 404 if guest not found', async () => {
      const guestId = '999';

      const error = new Error('Not Found');
      error.status = 404;

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockRejectedValue(error),
      });

      const res = await request(app).get(`/api/v1/guests/${guestId}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Guest not found');
    });

    it('should handle errors when failing to get a guest', async () => {
      const guestId = '1';

      const error = new Error('DB Error');

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockRejectedValue(error),
      });

      const res = await request(app).get(`/api/v1/guests/${guestId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'DB Error');
    });
  });

  describe('POST /api/v1/guests', () => {
    it('should create a new guest', async () => {
      const newGuest = {
        name: 'New Guest',
        user_id: 'user123',
        date_of_birth: '1990-01-01T00:00:00Z',
        national_id: 'ID123456',
      };

      const createdGuest = { id: '1', ...newGuest };

      pb.collection.mockReturnValue({
        create: jest.fn().mockResolvedValue(createdGuest),
      });

      const res = await request(app).post('/api/v1/guests').send(newGuest);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(createdGuest);
      expect(pb.collection).toHaveBeenCalledWith('guests');
      expect(pb.collection().create).toHaveBeenCalledWith(newGuest);
    });

    it('should handle errors when failing to create a guest', async () => {
      const newGuest = {
        name: 'New Guest',
        user_id: 'user123',
        date_of_birth: '1990-01-01T00:00:00Z',
        national_id: 'ID123456',
      };

      const error = new Error('DB Error');

      pb.collection.mockReturnValue({
        create: jest.fn().mockRejectedValue(error),
      });

      const res = await request(app).post('/api/v1/guests').send(newGuest);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'DB Error');
    });
  });

  describe('PATCH /api/v1/guests/:id', () => {
    it('should update a guest by ID', async () => {
      const guestId = '1';
      const updatedData = {
        name: 'Updated Guest',
        national_id: 'ID654321',
      };
      const existingGuest = {
        id: guestId,
        name: 'Guest 1',
        user_id: 'user123',
        date_of_birth: '1990-01-01T00:00:00Z',
        national_id: 'ID123456',
      };
      const updatedGuest = { ...existingGuest, ...updatedData };

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockResolvedValue(existingGuest),
        update: jest.fn().mockResolvedValue(updatedGuest),
      });

      const res = await request(app)
        .patch(`/api/v1/guests/${guestId}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedGuest);
      expect(pb.collection).toHaveBeenCalledWith('guests');
      expect(pb.collection().getOne).toHaveBeenCalledWith(guestId);
      expect(pb.collection().update).toHaveBeenCalledWith(guestId, updatedData);
    });

    it('should return 404 if guest not found when updating', async () => {
      const guestId = '999';
      const updatedData = {
        name: 'Updated Guest',
      };

      const error = new Error('Not Found');
      error.status = 404;

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockRejectedValue(error),
      });

      const res = await request(app)
        .patch(`/api/v1/guests/${guestId}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Guest not found');
    });

    it('should handle errors when failing to update a guest', async () => {
      const guestId = '1';
      const updatedData = {
        name: 'Updated Guest',
      };
      const existingGuest = {
        id: guestId,
        name: 'Guest 1',
        user_id: 'user123',
        date_of_birth: '1990-01-01T00:00:00Z',
        national_id: 'ID123456',
      };

      const error = new Error('DB Error');

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockResolvedValue(existingGuest),
        update: jest.fn().mockRejectedValue(error),
      });

      const res = await request(app)
        .patch(`/api/v1/guests/${guestId}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'DB Error');
    });
  });

  describe('DELETE /api/v1/guests/:id', () => {
    it('should delete a guest by ID', async () => {
      const guestId = '1';
      const existingGuest = {
        id: guestId,
        name: 'Guest 1',
        user_id: 'user123',
      };

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockResolvedValue(existingGuest),
        delete: jest.fn().mockResolvedValue(),
      });

      const res = await request(app).delete(`/api/v1/guests/${guestId}`);

      expect(res.statusCode).toEqual(204);
      expect(pb.collection).toHaveBeenCalledWith('guests');
      expect(pb.collection().getOne).toHaveBeenCalledWith(guestId);
      expect(pb.collection().delete).toHaveBeenCalledWith(guestId);
    });

    it('should return 404 if guest not found when deleting', async () => {
      const guestId = '999';

      const error = new Error('Not Found');
      error.status = 404;

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockRejectedValue(error),
      });

      const res = await request(app).delete(`/api/v1/guests/${guestId}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Guest not found');
    });

    it('should handle errors when failing to delete a guest', async () => {
      const guestId = '1';
      const existingGuest = {
        id: guestId,
        name: 'Guest 1',
        user_id: 'user123',
      };

      const error = new Error('DB Error');

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockResolvedValue(existingGuest),
        delete: jest.fn().mockRejectedValue(error),
      });

      const res = await request(app).delete(`/api/v1/guests/${guestId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'DB Error');
    });
  });
});
