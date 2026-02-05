// registrationController.test.js

const request = require('supertest');
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const pb = require('../utils/dbBase');
const registrationController = require('../controllers/registrationController');
const { BASE_URL } = require('../utils/base');

jest.mock('axios');
jest.mock('../utils/dbBase', () => ({
  collection: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up multer middleware
const upload = multer();

// Set up routes
const router = express.Router();

router
  .route('/')
  .get(registrationController.getRegistrations)
  .post(upload.any(), registrationController.createRegistration);

router
  .route('/:id')
  .get(registrationController.getRegistration)
  .patch(registrationController.updateRegistration)
  .delete(registrationController.deleteRegistration);

router.route('/student/:id').get(registrationController.getStudentRegistration);

app.use('/api/v1/registration', router);

// Error handling middleware for the test app
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message,
  });
});

describe('Registration Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/registration', () => {
    it('should fetch all registrations', async () => {
      const mockRegistrations = {
        items: [{ id: '1', name: 'Test Registration' }],
        totalItems: 1,
        totalPages: 1,
        page: 1,
        perPage: 20,
      };

      pb.collection.mockReturnValue({
        getList: jest.fn().mockResolvedValue(mockRegistrations),
      });

      const res = await request(app).get('/api/v1/registration');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        status: 'success',
        results: 1,
        currentPage: 1,
        totalPages: 1,
        totalRecords: 1,
        data: mockRegistrations.items,
      });
      expect(pb.collection).toHaveBeenCalledWith('registration');
      expect(pb.collection().getList).toHaveBeenCalledWith(1, 20, {
        expand: 'semester_id, course_id',
        sort: '-created',
      });
    });

    it('should handle errors when failing to get registrations', async () => {
      const error = new Error('DB Error');
      pb.collection.mockReturnValue({
        getList: jest.fn().mockRejectedValue(error),
      });

      const res = await request(app).get('/api/v1/registration');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'DB Error');
    });
  });

  describe('GET /api/v1/registration/:id', () => {
    it('should fetch a registration by ID', async () => {
      const registrationId = '1';
      const mockRegistration = {
        id: registrationId,
        name: 'Test Registration',
      };

      axios.mockResolvedValue({ data: mockRegistration });

      const res = await request(app).get(
        `/api/v1/registration/${registrationId}`,
      );

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockRegistration);
      expect(axios).toHaveBeenCalledWith({
        method: 'get',
        url: `${BASE_URL}/api/collections/registration/records/${registrationId}`,
      });
    });

    it('should handle errors when failing to get a registration', async () => {
      const registrationId = '1';
      const error = new Error('Axios Error');

      axios.mockRejectedValue(error);

      const res = await request(app).get(
        `/api/v1/registration/${registrationId}`,
      );

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Axios Error');
    });
  });

  describe('POST /api/v1/registration', () => {
    it('should create a new registration', async () => {
      const mockResponse = { id: '2', name: 'New Registration' };

      axios.mockResolvedValue({ data: mockResponse });

      const res = await request(app)
        .post('/api/v1/registration')
        .field('names', 'John Doe')
        .field('surname', 'Doe')
        .field('prog_name', 'Test Program');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id', '2');
      expect(res.body).toHaveProperty('name', 'New Registration');
      expect(axios).toHaveBeenCalled();
    });

    it('should handle errors when failing to create a registration', async () => {
      const error = new Error('Axios Error');

      axios.mockRejectedValue(error);

      const res = await request(app)
        .post('/api/v1/registration')
        .field('names', 'John Doe')
        .field('surname', 'Doe')
        .field('prog_name', 'Test Program');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Axios Error');
    });
  });

  describe('PATCH /api/v1/registration/:id', () => {
    it('should update a registration', async () => {
      const registrationId = '1';
      const mockResponse = { id: registrationId, name: 'Updated Registration' };

      axios.mockResolvedValue({ data: mockResponse });

      const res = await request(app)
        .patch(`/api/v1/registration/${registrationId}`)
        .send({ name: 'Updated Registration' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('name', 'Updated Registration');
      expect(axios).toHaveBeenCalledWith({
        method: 'patch',
        url: `${BASE_URL}/api/collections/registration/records/${registrationId}`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: { name: 'Updated Registration' },
      });
    });

    it('should handle errors when failing to update a registration', async () => {
      const registrationId = '1';
      const error = new Error('Axios Error');

      axios.mockRejectedValue(error);

      const res = await request(app)
        .patch(`/api/v1/registration/${registrationId}`)
        .send({ name: 'Updated Registration' });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Axios Error');
    });
  });

  describe('DELETE /api/v1/registration/:id', () => {
    it('should delete a registration', async () => {
      const registrationId = '1';

      axios.mockResolvedValue({ data: { success: true } });

      const res = await request(app).delete(
        `/api/v1/registration/${registrationId}`,
      );

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ success: true });
      expect(axios).toHaveBeenCalledWith({
        method: 'delete',
        url: `${BASE_URL}/api/collections/registration/records/${registrationId}`,
      });
    });

    it('should handle errors when failing to delete a registration', async () => {
      const registrationId = '1';
      const error = new Error('Axios Error');

      axios.mockRejectedValue(error);

      const res = await request(app).delete(
        `/api/v1/registration/${registrationId}`,
      );

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Axios Error');
    });
  });

  describe('GET /api/v1/registration/student/:id', () => {
    it('should fetch a student registration by ID', async () => {
      const registrationId = '1';
      const mockRegistration = {
        id: registrationId,
        name: 'Test Registration',
      };

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockResolvedValue(mockRegistration),
      });

      const res = await request(app).get(
        `/api/v1/registration/student/${registrationId}`,
      );

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        status: 'success',
        data: mockRegistration,
      });
      expect(pb.collection).toHaveBeenCalledWith('registration');
      expect(pb.collection().getOne).toHaveBeenCalledWith(registrationId, {
        expand: 'student_id',
      });
    });

    it('should handle errors when failing to get student registration', async () => {
      const registrationId = '1';
      const error = new Error('DB Error');

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockRejectedValue(error),
      });

      const res = await request(app).get(
        `/api/v1/registration/student/${registrationId}`,
      );

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'DB Error');
    });
  });
});
