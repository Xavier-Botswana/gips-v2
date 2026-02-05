// studentController.test.js

const request = require('supertest');
const express = require('express');
const axios = require('axios');
const pb = require('../utils/dbBase');
const studentController = require('../controllers/studentController');
const { BASE_URL } = require('../utils/base');

jest.mock('axios');
jest.mock('../utils/dbBase', () => ({
  collection: jest.fn(),
}));

const app = express();
app.use(express.json());

// Set up routes
const router = express.Router();

router
  .route('/')
  .get(studentController.getStudents)
  .post(studentController.createStudent);

router
  .route('/:id')
  .get(studentController.getStudent)
  .delete(studentController.deleteStudent)
  .patch(studentController.updateStudent);

app.use('/api/v1/students', router);

// Error handling middleware for the test app
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message,
  });
});

describe('Student Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/students', () => {
    it('should return a list of students', async () => {
      const mockStudents = {
        items: [
          { id: '123', first_name: 'John', last_name: 'Doe' },
          { id: '124', first_name: 'Jane', last_name: 'Doe' },
        ],
        totalItems: 2,
        totalPages: 1,
        page: 1,
        perPage: 20,
      };

      pb.collection.mockReturnValue({
        getList: jest.fn().mockResolvedValue(mockStudents),
      });

      const response = await request(app).get('/api/v1/students');
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        results: 2,
        currentPage: 1,
        totalPages: 1,
        totalRecords: 2,
        data: mockStudents.items,
      });
      expect(pb.collection).toHaveBeenCalledWith('students');
      expect(pb.collection().getList).toHaveBeenCalledWith(1, 20, {
        expand: 'course_id,semester_id',
        sort: '-created',
      });
    });

    it('should handle errors when fetching students', async () => {
      const error = new Error('DB Error');
      pb.collection.mockReturnValue({
        getList: jest.fn().mockRejectedValue(error),
      });

      const response = await request(app).get('/api/v1/students');
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'DB Error');
    });
  });

  describe('POST /api/v1/students', () => {
    it('should create a student', async () => {
      const studentData = {
        first_name: 'John',
        last_name: 'Doe',
        user_id: 'user123',
        national_id: '123456',
      };

      const mockResponse = { id: '123', ...studentData };

      axios.mockResolvedValue({ data: mockResponse });

      const response = await request(app)
        .post('/api/v1/students')
        .send(studentData);
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(axios).toHaveBeenCalledWith({
        method: 'post',
        url: `${BASE_URL}/api/collections/students/records`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: studentData,
      });
    });

    it('should handle errors when creating a student', async () => {
      const studentData = { first_name: 'John', last_name: 'Doe' };
      const error = new Error('Axios Error');

      axios.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/v1/students')
        .send(studentData);
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'Axios Error');
    });
  });

  describe('GET /api/v1/students/:id', () => {
    it('should fetch a student by ID', async () => {
      const studentId = '123';
      const mockStudent = { id: '123', first_name: 'John', last_name: 'Doe' };

      axios.mockResolvedValue({ data: mockStudent });

      const response = await request(app).get(`/api/v1/students/${studentId}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockStudent);
      expect(axios).toHaveBeenCalledWith({
        method: 'get',
        url: `${BASE_URL}/api/collections/students/records/${studentId}`,
      });
    });

    it('should handle errors when fetching a student by ID', async () => {
      const studentId = '123';
      const error = new Error('Axios Error');

      axios.mockRejectedValue(error);

      const response = await request(app).get(`/api/v1/students/${studentId}`);
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'Axios Error');
    });
  });

  describe('PATCH /api/v1/students/:id', () => {
    it('should update a student', async () => {
      const studentId = '123';
      const updatedData = { first_name: 'John Updated', last_name: 'Doe' };
      const mockResponse = { id: '123', ...updatedData };

      axios.mockResolvedValue({ data: mockResponse });

      const response = await request(app)
        .patch(`/api/v1/students/${studentId}`)
        .send(updatedData);
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(axios).toHaveBeenCalledWith({
        method: 'post',
        url: `${BASE_URL}/api/collections/students/records/${studentId}`,
        data: updatedData,
      });
    });

    it('should handle errors when updating a student', async () => {
      const studentId = '123';
      const updatedData = { first_name: 'John Updated', last_name: 'Doe' };
      const error = new Error('Axios Error');

      axios.mockRejectedValue(error);

      const response = await request(app)
        .patch(`/api/v1/students/${studentId}`)
        .send(updatedData);
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'Axios Error');
    });
  });

  describe('DELETE /api/v1/students/:id', () => {
    it('should delete a student', async () => {
      const studentId = '123';

      axios.mockResolvedValue({ data: {} });

      const response = await request(app).delete(
        `/api/v1/students/${studentId}`,
      );
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({});
      expect(axios).toHaveBeenCalledWith({
        method: 'delete',
        url: `${BASE_URL}/api/collections/students/records/${studentId}`,
      });
    });

    it('should handle errors when deleting a student', async () => {
      const studentId = '123';
      const error = new Error('Axios Error');

      axios.mockRejectedValue(error);

      const response = await request(app).delete(
        `/api/v1/students/${studentId}`,
      );
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'Axios Error');
    });
  });
});
