const request = require('supertest');
const express = require('express');
const facultyRoutes = require('../routes/facultyRoutes');
const pb = require('../utils/dbBase');

const app = express();
app.use(express.json());
app.use('/api/v1/faculties', facultyRoutes);

jest.mock('../utils/dbBase');

describe('Faculty Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/faculties', () => {
    it('should return all faculties with status 200', async () => {
      pb.collection.mockReturnValue({
        getFullList: jest.fn().mockResolvedValue([
          { name: 'Science', facilitator: '1rmk7el3wdl56y9' },
          { name: 'Arts', facilitator: '1rmk7el3wdl56y9' },
        ]),
      });

      const res = await request(app).get('/api/v1/faculties');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        { name: 'Science', facilitator: '1rmk7el3wdl56y9' },
        { name: 'Arts', facilitator: '1rmk7el3wdl56y9' },
      ]);
    });

    it('should return status 500 when there is an error', async () => {
      pb.collection.mockReturnValue({
        getFullList: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      const res = await request(app).get('/api/v1/faculties');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        message: 'Failed to retrieve faculties',
        error: expect.anything(),
      });
    });
  });

  describe('POST /api/v1/faculties', () => {
    it('should create a faculty and return status 201', async () => {
      const newFaculty = {
        name: 'Engineering',
        facilitator: '1rmk7el3wdl56y9',
      };

      pb.collection.mockReturnValue({
        create: jest.fn().mockResolvedValue(newFaculty),
      });

      const res = await request(app).post('/api/v1/faculties').send(newFaculty);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(newFaculty);
    });

    it('should return status 500 when there is an error', async () => {
      pb.collection.mockReturnValue({
        create: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      const res = await request(app)
        .post('/api/v1/faculties')
        .send({ name: 'Engineering', facilitator: '1rmk7el3wdl56y9' });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        message: 'Failed to create faculty',
        error: expect.anything(),
      });
    });
  });

  describe('PATCH /api/v1/faculties/:id', () => {
    it('should update a faculty and return status 200', async () => {
      const facultyId = '1rmk7el3wdl56y9';
      const existingFaculty = {
        name: 'Engineering',
        facilitator: '1rmk7el3wdl56y9',
      };
      const updateData = { name: 'Updated Engineering' };

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockResolvedValue(existingFaculty),
        update: jest.fn().mockResolvedValue({
          ...existingFaculty,
          ...updateData,
        }),
      });

      const res = await request(app)
        .patch(`/api/v1/faculties/${facultyId}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ...existingFaculty,
        ...updateData,
      });
    });

    it('should return status 500 when there is an error', async () => {
      const facultyId = '1rmk7el3wdl56y9';
      const updateData = { name: 'Updated Engineering' };

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockResolvedValue({
          name: 'Engineering',
          facilitator: '1rmk7el3wdl56y9',
        }),
        update: jest
          .fn()
          .mockRejectedValue(new Error('Failed to update faculty')),
      });

      const res = await request(app)
        .patch(`/api/v1/faculties/${facultyId}`)
        .send(updateData);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        message: 'Failed to update faculty',
        error: expect.anything(),
      });
    });
  });

  describe('GET /api/v1/faculties/:id', () => {
    it('should return a faculty by ID with status 200', async () => {
      const facultyId = '1rmk7el3wdl56y9';
      const mockFaculty = {
        id: facultyId,
        name: 'Engineering',
        facilitator: { id: '1rmk7el3wdl56y9', name: 'John Doe' },
      };

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockResolvedValue(mockFaculty),
      });

      const res = await request(app).get(`/api/v1/faculties/${facultyId}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockFaculty);
    });

    it('should return status 404 if faculty is not found', async () => {
      const facultyId = 'nonexistentId';

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app).get(`/api/v1/faculties/${facultyId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Faculty not found');
    });

    it('should return status 500 when there is a server error', async () => {
      const facultyId = '1rmk7el3wdl56y9';

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      const res = await request(app).get(`/api/v1/faculties/${facultyId}`);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        message: 'Failed to retrieve faculty',
        error: expect.anything(),
      });
    });
  });
});
