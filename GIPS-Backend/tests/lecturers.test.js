// lecturerController.test.js

const request = require('supertest');
const express = require('express');
const axios = require('axios');
const pb = require('../utils/dbBase');
const lecturerController = require('../controllers/lecturerController');
const authenticate = require('../middlewares/authenticate');
const logActivity = require('../middlewares/logger');
const { BASE_URL } = require('../utils/base');

jest.mock('axios');
jest.mock('../utils/dbBase', () => ({
  collection: jest.fn(),
}));
jest.mock('../middlewares/authenticate');
jest.mock('../middlewares/logger');

const app = express();
app.use(express.json());

// Mock middlewares
authenticate.mockImplementation((req, res, next) => next());
logActivity.mockImplementation(() => (req, res, next) => next());

// Set up routes
const router = express.Router();

router.use(authenticate);

router
  .route('/')
  .get(logActivity('viewed all lecturers'), lecturerController.getLecturers)
  .post(logActivity('created new lecturer'), lecturerController.createLecturer);

router
  .route('/:id')
  .get(logActivity('viewed lecturer details'), lecturerController.getLecturer)
  .patch(
    logActivity('updated lecturer details'),
    lecturerController.updateLecturer,
  )
  .delete(logActivity('deleted lecturer'), lecturerController.deleteLecturer);

app.use('/api/v1/lecturers', router);

// Error handling middleware for the test app
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message,
  });
});

describe('Lecturer Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the authenticate middleware to pass authentication
    authenticate.mockImplementation((req, res, next) => next());
    // Mock the logActivity middleware
    logActivity.mockImplementation(() => (req, res, next) => next());
  });

  describe('GET /api/v1/lecturers', () => {
    it('should return all lecturers', async () => {
      const mockLecturers = {
        items: [
          { id: '1', name: 'Lecturer 1' },
          { id: '2', name: 'Lecturer 2' },
        ],
        totalItems: 2,
        totalPages: 1,
        page: 1,
        perPage: 20,
      };

      pb.collection.mockReturnValue({
        getList: jest.fn().mockResolvedValue(mockLecturers),
      });

      const res = await request(app).get('/api/v1/lecturers');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        status: 'success',
        results: mockLecturers.items.length,
        currentPage: 1,
        totalPages: mockLecturers.totalPages,
        totalRecords: mockLecturers.totalItems,
        data: mockLecturers.items,
      });
      expect(pb.collection).toHaveBeenCalledWith('lecturers');
      expect(pb.collection().getList).toHaveBeenCalledWith(1, 20, {
        expand: 'parent_course',
        sort: '-created',
      });
    });

    it('should handle errors when failing to get lecturers', async () => {
      const error = new Error('DB Error');

      pb.collection.mockReturnValue({
        getList: jest.fn().mockRejectedValue(error),
      });

      const res = await request(app).get('/api/v1/lecturers');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'DB Error');
    });
  });

  describe('GET /api/v1/lecturers/:id', () => {
    it('should return a lecturer by ID', async () => {
      const lecturerId = '1';
      const mockLecturer = { id: lecturerId, name: 'Lecturer 1' };

      axios.mockResolvedValue({
        data: mockLecturer,
      });

      const res = await request(app).get(`/api/v1/lecturers/${lecturerId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockLecturer);
      expect(axios).toHaveBeenCalledWith({
        method: 'get',
        url: `${BASE_URL}/api/collections/lecturers/records/${lecturerId}`,
      });
    });

    it('should handle errors when failing to get a lecturer', async () => {
      const lecturerId = '999';

      const error = new Error('Axios Error');
      axios.mockRejectedValue(error);

      const res = await request(app).get(`/api/v1/lecturers/${lecturerId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Axios Error');
    });
  });

  describe('POST /api/v1/lecturers', () => {
    it('should create a new lecturer', async () => {
      const newLecturer = {
        name: 'New Lecturer',
        facultyId: 'faculty123',
      };

      const createdLecturer = {
        id: '1',
        name: 'New Lecturer',
        facultyId: 'faculty123',
      };

      axios.mockResolvedValue({
        data: createdLecturer,
      });

      const res = await request(app)
        .post('/api/v1/lecturers')
        .send(newLecturer);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(createdLecturer);
      expect(axios).toHaveBeenCalledWith({
        method: 'post',
        url: `${BASE_URL}/api/collections/lecturers/records`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          name: newLecturer.name,
          faculty_id: newLecturer.facultyId,
        },
      });
    });

    it('should handle errors when failing to create a lecturer', async () => {
      const newLecturer = {
        name: 'New Lecturer',
        facultyId: 'faculty123',
      };

      const error = new Error('Axios Error');
      axios.mockRejectedValue(error);

      const res = await request(app)
        .post('/api/v1/lecturers')
        .send(newLecturer);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Axios Error');
    });
  });

  describe('PATCH /api/v1/lecturers/:id', () => {
    it('should update a lecturer by ID', async () => {
      const lecturerId = '1';
      const updatedData = {
        name: 'Updated Lecturer',
        facultyId: 'faculty456',
      };

      const updatedLecturer = { id: lecturerId, ...updatedData };

      axios.mockResolvedValue({
        data: updatedLecturer,
      });

      const res = await request(app)
        .patch(`/api/v1/lecturers/${lecturerId}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(updatedLecturer);
      expect(axios).toHaveBeenCalledWith({
        method: 'patch',
        url: `${BASE_URL}/api/collections/lecturers/records/${lecturerId}`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: updatedData,
      });
    });

    it('should handle errors when failing to update a lecturer', async () => {
      const lecturerId = '1';
      const updatedData = {
        name: 'Updated Lecturer',
        facultyId: 'faculty456',
      };

      const error = new Error('Axios Error');
      axios.mockRejectedValue(error);

      const res = await request(app)
        .patch(`/api/v1/lecturers/${lecturerId}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Axios Error');
    });
  });

  describe('DELETE /api/v1/lecturers/:id', () => {
    it('should delete a lecturer by ID', async () => {
      const lecturerId = '1';

      axios.mockResolvedValue({
        data: {},
      });

      const res = await request(app).delete(`/api/v1/lecturers/${lecturerId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({});
      expect(axios).toHaveBeenCalledWith({
        method: 'delete',
        url: `${BASE_URL}/api/collections/lecturers/records/${lecturerId}`,
      });
    });

    it('should handle errors when failing to delete a lecturer', async () => {
      const lecturerId = '1';

      const error = new Error('Axios Error');
      axios.mockRejectedValue(error);

      const res = await request(app).delete(`/api/v1/lecturers/${lecturerId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Axios Error');
    });
  });
});
