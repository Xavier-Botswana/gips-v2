const request = require('supertest');
const express = require('express');
const pb = require('../utils/dbBase'); // Mocked PocketBase SDK instance
const calendarController = require('../controllers/calendarController');
const authenticate = require('../middlewares/authenticate');

jest.mock('../utils/dbBase');
jest.mock('../middlewares/authenticate');

const app = express();
app.use(express.json());

// Set up routes
const router = express.Router();

router
  .get('/', authenticate, calendarController.getAllEvents)
  .post('/', authenticate, calendarController.createEvent);

router
  .get('/:id', authenticate, calendarController.getEventById)
  .put('/:id', authenticate, calendarController.updateEvent)
  .delete('/:id', authenticate, calendarController.deleteEvent);

app.use('/api/v1/calendar', router);

// Error handling middleware for the test app
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message,
  });
});

describe('Calendar Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the authenticate middleware to pass authentication
    authenticate.mockImplementation((req, res, next) => next());
  });

  describe('GET /api/v1/calendar', () => {
    it('should return all calendar events', async () => {
      const mockEvents = [
        { id: '1', title: 'Event 1' },
        { id: '2', title: 'Event 2' },
      ];

      pb.collection.mockReturnValue({
        getFullList: jest.fn().mockResolvedValue(mockEvents),
      });

      const res = await request(app).get('/api/v1/calendar');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockEvents);
      expect(pb.collection).toHaveBeenCalledWith('Calendar_Events');
      expect(pb.collection().getFullList).toHaveBeenCalled();
    });

    it('should handle errors when failing to get calendar events', async () => {
      pb.collection.mockReturnValue({
        getFullList: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      const res = await request(app).get('/api/v1/calendar');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'DB Error');
    });
  });

  describe('POST /api/v1/calendar', () => {
    it('should create a new calendar event', async () => {
      const newEvent = {
        title: 'New Event',
        eventType: 'meeting',
        start: '2024-10-10T10:00:00Z',
        end: '2024-10-10T12:00:00Z',
        organizerId: 'org123',
        participants: 'All Staff', // Added required field
        textColor: '#FFFFFF', // Added required field
      };

      const createdEvent = { id: '1', ...newEvent };

      pb.collection.mockReturnValue({
        create: jest.fn().mockResolvedValue(createdEvent),
      });

      const res = await request(app).post('/api/v1/calendar').send(newEvent);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(createdEvent);
      expect(pb.collection).toHaveBeenCalledWith('Calendar_Events');
      expect(pb.collection().create).toHaveBeenCalledWith(newEvent);
    });

    it('should handle validation errors when creating an event', async () => {
      const invalidEvent = {
        title: '', // title is required and should not be empty
        eventType: 'invalid_type', // invalid eventType
        start: 'invalid_date', // invalid date format
        end: '2024-10-10T12:00:00Z',
        organizerId: 'org123',
        participants: 'Invalid_Participant', // invalid participants
        textColor: '#FFFFFF',
      };

      const res = await request(app)
        .post('/api/v1/calendar')
        .send(invalidEvent);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message'); // The validation error message
    });

    it('should handle errors when failing to create an event', async () => {
      const newEvent = {
        title: 'New Event',
        eventType: 'meeting',
        start: '2024-10-10T10:00:00Z',
        end: '2024-10-10T12:00:00Z',
        organizerId: 'org123',
        participants: 'All Staff',
        textColor: '#FFFFFF',
      };

      pb.collection.mockReturnValue({
        create: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      const res = await request(app).post('/api/v1/calendar').send(newEvent);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'DB Error');
    });
  });

  describe('GET /api/v1/calendar/:id', () => {
    it('should return a calendar event by ID', async () => {
      const eventId = '1';
      const mockEvent = {
        id: eventId,
        title: 'Event 1',
        eventType: 'meeting',
        start: '2024-10-10T10:00:00Z',
        end: '2024-10-10T12:00:00Z',
        organizerId: 'org123',
        participants: 'All Staff',
        textColor: '#FFFFFF',
      };

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockResolvedValue(mockEvent),
      });

      const res = await request(app).get(`/api/v1/calendar/${eventId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockEvent);
      expect(pb.collection).toHaveBeenCalledWith('Calendar_Events');
      expect(pb.collection().getOne).toHaveBeenCalledWith(eventId);
    });

    it('should return 404 if event not found', async () => {
      const eventId = '999';

      const error = new Error('Not Found');
      error.status = 404;

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockRejectedValue(error),
      });

      const res = await request(app).get(`/api/v1/calendar/${eventId}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Calendar Event not found');
    });

    it('should handle errors when failing to get an event', async () => {
      const eventId = '1';

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      const res = await request(app).get(`/api/v1/calendar/${eventId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'DB Error');
    });
  });

  describe('PUT /api/v1/calendar/:id', () => {
    it('should update a calendar event by ID', async () => {
      const eventId = '1';
      const updatedData = {
        title: 'Updated Event',
        eventType: 'lecture',
        start: '2024-10-10T08:00:00Z',
        end: '2024-10-10T10:00:00Z',
        organizerId: 'org123',
        participants: 'Students',
        textColor: '#000000',
      };
      const updatedEvent = { id: eventId, ...updatedData };

      pb.collection.mockReturnValue({
        update: jest.fn().mockResolvedValue(updatedEvent),
      });

      const res = await request(app)
        .put(`/api/v1/calendar/${eventId}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedEvent);
      expect(pb.collection).toHaveBeenCalledWith('Calendar_Events');
    });

    it('should handle validation errors when updating an event', async () => {
      const eventId = '1';
      const invalidData = {
        title: '', // Title cannot be empty
        eventType: 'invalid_type', // Invalid event type
        participants: 'Invalid_Participant', // Invalid participants
      };

      const res = await request(app)
        .put(`/api/v1/calendar/${eventId}`)
        .send(invalidData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message'); // Validation error message
    });

    it('should handle errors when failing to update an event', async () => {
      const eventId = '1';
      const updatedData = {
        title: 'Updated Event',
        eventType: 'lecture',
        start: '2024-10-10T08:00:00Z',
        end: '2024-10-10T10:00:00Z',
        organizerId: 'org123',
        participants: 'Students',
        textColor: '#000000',
      };

      pb.collection.mockReturnValue({
        update: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      const res = await request(app)
        .put(`/api/v1/calendar/${eventId}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'DB Error');
    });
  });

  describe('DELETE /api/v1/calendar/:id', () => {
    it('should delete a calendar event by ID', async () => {
      const eventId = '1';

      pb.collection.mockReturnValue({
        delete: jest.fn().mockResolvedValue(),
      });

      const res = await request(app).delete(`/api/v1/calendar/${eventId}`);

      expect(res.statusCode).toEqual(204);
      expect(pb.collection).toHaveBeenCalledWith('Calendar_Events');
      expect(pb.collection().delete).toHaveBeenCalledWith(eventId);
    });

    it('should handle errors when failing to delete an event', async () => {
      const eventId = '1';

      pb.collection.mockReturnValue({
        delete: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      const res = await request(app).delete(`/api/v1/calendar/${eventId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'DB Error');
    });
  });
});
