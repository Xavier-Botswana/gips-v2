// applicationController.test.js

const request = require('supertest');
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const pb = require('../utils/dbBase'); // Mocked PocketBase SDK instance
const applicationController = require('../controllers/applicationController');

jest.mock('axios');
jest.mock('../utils/dbBase', () => ({
  collection: jest.fn().mockReturnThis(),
  getList: jest.fn(),
  getOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
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
  .get(applicationController.getApplications)
  .post(upload.any(), applicationController.createApplication);

router
  .route('/:id')
  .get(applicationController.getApplication)
  .delete(applicationController.deleteApplication)
  .patch(applicationController.updateApplication);

app.use('/api/v1/applications', router);

// Error handling middleware for the test app
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message,
  });
});

describe('Application Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/applications', () => {
    it('should return all applications', async () => {
      const mockApplications = {
        items: [
          { id: '1', name: 'App1' },
          { id: '2', name: 'App2' },
        ],
        totalItems: 2,
        totalPages: 1,
        page: 1,
        perPage: 20,
      };

      pb.getList.mockResolvedValue(mockApplications);

      const res = await request(app).get('/api/v1/applications');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        status: 'success',
        results: 2,
        currentPage: 1,
        totalPages: 1,
        totalRecords: 2,
        data: mockApplications.items,
      });
      expect(pb.collection).toHaveBeenCalledWith('applications');
      expect(pb.getList).toHaveBeenCalledWith(1, 20, {
        expand: 'option_one,guest_id,semester_id',
        sort: '-created',
      });
    });

    it('should handle errors when failing to get applications', async () => {
      const error = new Error('DB Error');
      pb.getList.mockRejectedValue(error);

      const res = await request(app).get('/api/v1/applications');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'DB Error');
    });
  });

  describe('GET /api/v1/applications/:id', () => {
    it('should return the application with the given id', async () => {
      const mockApplication = { id: '1', name: 'App1' };

      pb.getOne.mockResolvedValue(mockApplication);

      const res = await request(app).get('/api/v1/applications/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockApplication);
      expect(pb.collection).toHaveBeenCalledWith('applications');
      expect(pb.getOne).toHaveBeenCalledWith('1');
    });

    it('should return 404 if application not found', async () => {
      const error = new Error('Not found');
      error.status = 404;
      pb.getOne.mockRejectedValue(error);

      const res = await request(app).get('/api/v1/applications/999');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Application not found');
    });
  });

  describe('POST /api/v1/applications', () => {
    it('should create a new application', async () => {
      const mockResponse = {
        data: { id: '1', guest_id: 'guest123' },
      };

      axios.mockResolvedValue(mockResponse);

      const res = await request(app)
        .post('/api/v1/applications')
        .field('guest_id', 'guest123')
        .field('study_mode', 'full-time')
        .attach('document', Buffer.from('file content'), 'document.pdf');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockResponse.data);
      expect(axios).toHaveBeenCalled();
    });

    it('should handle errors when failing to create application', async () => {
      const error = new Error('Axios Error');
      axios.mockRejectedValue(error);

      const res = await request(app)
        .post('/api/v1/applications')
        .field('guest_id', 'guest123')
        .field('study_mode', 'full-time');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Axios Error');
    });
  });

  describe('PATCH /api/v1/applications/:id', () => {
    it('should update the application with the given id', async () => {
      const applicationId = '1';
      const existingApplication = { id: applicationId, name: 'App1' };
      const updatedData = { name: 'Updated App1' };
      const updatedApplication = { id: applicationId, name: 'Updated App1' };

      pb.getOne.mockResolvedValue(existingApplication);
      pb.update.mockResolvedValue(updatedApplication);

      const res = await request(app)
        .patch(`/api/v1/applications/${applicationId}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        message: 'Application updated successfully',
        updatedApplication,
      });

      expect(pb.collection).toHaveBeenCalledWith('applications');
      expect(pb.getOne).toHaveBeenCalledWith(applicationId);
      expect(pb.update).toHaveBeenCalledWith(applicationId, updatedData);
    });

    it('should handle errors when failing to update application', async () => {
      const applicationId = '1';
      const existingApplication = { id: applicationId, name: 'App1' };
      const error = new Error('DB Error');

      pb.getOne.mockResolvedValue(existingApplication);
      pb.update.mockRejectedValue(error);

      const res = await request(app)
        .patch(`/api/v1/applications/${applicationId}`)
        .send({ name: 'Updated App1' });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty(
        'message',
        'Failed to update application',
      );
    });
  });

  describe('DELETE /api/v1/applications/:id', () => {
    it('should delete the application with the given id', async () => {
      const applicationId = '1';
      const existingApplication = { id: applicationId, name: 'App1' };

      pb.getOne.mockResolvedValue(existingApplication);
      pb.delete.mockResolvedValue();

      const res = await request(app).delete(
        `/api/v1/applications/${applicationId}`,
      );

      expect(res.statusCode).toEqual(204);
      expect(pb.collection).toHaveBeenCalledWith('applications');
      expect(pb.getOne).toHaveBeenCalledWith(applicationId);
      expect(pb.delete).toHaveBeenCalledWith(applicationId);
    });

    it('should handle errors when failing to delete application', async () => {
      const applicationId = '1';
      const existingApplication = { id: applicationId, name: 'App1' };
      const error = new Error('DB Error');

      pb.getOne.mockResolvedValue(existingApplication);
      pb.delete.mockRejectedValue(error);

      const res = await request(app).delete(
        `/api/v1/applications/${applicationId}`,
      );

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty(
        'message',
        'Failed to delete application',
      );
    });
  });
});
