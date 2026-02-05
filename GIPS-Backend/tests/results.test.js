// resultController.test.js

const request = require('supertest');
const express = require('express');
const pb = require('../utils/dbBase'); // Mocked PocketBase SDK instance
const resultsController = require('../controllers/resultController');
const authenticate = require('../middlewares/authenticate');

jest.mock('../utils/dbBase', () => ({
  collection: jest.fn(),
}));
jest.mock('../middlewares/authenticate');

const app = express();
app.use(express.json());

// Mock middlewares
authenticate.mockImplementation((req, res, next) => next());

// Set up routes
const router = express.Router();

router.use(authenticate);

router
  .get('/', resultsController.getResults)
  .post('/', resultsController.createResult);
router
  .get('/student/:studentId', resultsController.getResultsByStudentId)
  .patch('/:resultId', resultsController.updateResult);
router.get('/year/:yearOfStudy', resultsController.getResultsByYearOfStudy);
router.get('/faculty/:facultyId', resultsController.getResultsByFacultyId);
router.get('/course/:courseId', resultsController.getResultsByCourseId);
router.get('/batch', resultsController.getBatchResults);
router.post('/batch', resultsController.submitBatchResults);

app.use('/api/v1/results', router);

// Error handling middleware for the test app
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message,
  });
});

describe('Results API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the authenticate middleware to pass authentication
    authenticate.mockImplementation((req, res, next) => next());
  });

  describe('GET /api/v1/results', () => {
    it('should retrieve all results', async () => {
      const mockResults = {
        items: [{ id: '1', studentId: 'student_1' }],
        totalItems: 1,
        totalPages: 1,
        page: 1,
        perPage: 20,
      };

      pb.collection.mockReturnValue({
        getList: jest.fn().mockResolvedValue(mockResults),
      });

      const res = await request(app).get('/api/v1/results');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: 'success',
        results: 1,
        currentPage: 1,
        totalPages: 1,
        totalRecords: 1,
        data: mockResults.items,
      });
      expect(pb.collection).toHaveBeenCalledWith('results');
      expect(pb.collection().getList).toHaveBeenCalledWith(1, 20, {
        expand: 'studentId,moduleId,courseId,facultyId',
        sort: '-created',
      });
    });

    it('should return 500 if there is a server error', async () => {
      const error = new Error('DB error');
      pb.collection.mockReturnValue({
        getList: jest.fn().mockRejectedValue(error),
      });

      const res = await request(app).get('/api/v1/results');

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('DB error');
    });
  });

  describe('GET /api/v1/results/student/:userId', () => {
    it('should retrieve results for a specific student', async () => {
      const userId = 'user_1'; // Assuming this is the user ID passed in the route
      const mockStudent = { id: 'student_1', user_id: userId };
      const mockResults = [
        { id: '1', studentId: mockStudent.id, moduleId: 'module_1' },
      ];

      const studentsGetFullList = jest.fn().mockResolvedValue([mockStudent]);
      const resultsGetFullList = jest.fn().mockResolvedValue(mockResults);

      // Set up mocks for the students and results collections
      pb.collection.mockImplementation((collectionName) => {
        switch (collectionName) {
          case 'students':
            return {
              getFullList: studentsGetFullList,
            };
          case 'results':
            return {
              getFullList: resultsGetFullList,
            };
          default:
            return {
              getFullList: jest.fn().mockResolvedValue([]),
              getOne: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue({}),
              update: jest.fn().mockResolvedValue({}),
              filter: jest.fn().mockReturnThis(),
            };
        }
      });

      const res = await request(app).get(`/api/v1/results/student/${userId}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        data: {
          results: mockResults,
          student: mockStudent,
        },
      });
      expect(pb.collection).toHaveBeenCalledWith('students');
      expect(pb.collection).toHaveBeenCalledWith('results');
    });

    it('should return 404 if student is not found', async () => {
      const userId = 'user_1';
      pb.collection.mockImplementation((collectionName) => {
        if (collectionName === 'students') {
          return {
            getFullList: jest.fn().mockResolvedValue([]), // No student found
          };
        }
      });

      const res = await request(app).get(`/api/v1/results/student/${userId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Student not found');
    });

    it('should return 500 if there is an error fetching results', async () => {
      const userId = 'user_1';
      const error = new Error('DB error');

      pb.collection.mockImplementation((collectionName) => {
        if (collectionName === 'students') {
          return {
            getFullList: jest
              .fn()
              .mockResolvedValue([{ id: 'student_1', user_id: userId }]), // Mock student found
          };
        } else if (collectionName === 'results') {
          return {
            getFullList: jest.fn().mockRejectedValue(error), // Mock an error when fetching results
          };
        }
      });

      const res = await request(app).get(`/api/v1/results/student/${userId}`);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Failed to retrieve results');
    });
  });

  describe('POST /api/v1/results', () => {
    const newResult = {
      studentId: 'student_1',
      courseId: 'course_1',
      facultyId: 'faculty_1',
      yearOfStudy: 3,
      semester: 'Spring',
      moduleId: 'module_1',
      assignmentMark: 85,
      midSemesterMark: 78,
      examMark: 70,
      lecturerId: 'lecturer_1',
    };

    it('should create a new result', async () => {
      const mockExistingResult = [];
      const createdResult = { id: 'result_1', ...newResult };

      pb.collection.mockReturnValue({
        getFullList: jest.fn().mockResolvedValue(mockExistingResult),
        create: jest.fn().mockResolvedValue(createdResult),
      });

      const res = await request(app).post('/api/v1/results').send(newResult);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        message: 'Result created successfully',
        result: createdResult,
      });
      expect(pb.collection).toHaveBeenCalledWith('results');
      expect(pb.collection().create).toHaveBeenCalledWith({
        ...newResult,
        supplementaryMark: null,
        moduleMark: null,
        nonCreditAssessments: null,
        status: 'pending',
        batchId: null,
      });
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidResult = { studentId: 'student_1' };

      const res = await request(app)
        .post('/api/v1/results')
        .send(invalidResult);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Missing required fields');
    });

    it('should return 400 if result already exists', async () => {
      const mockExistingResult = [{ id: 'result_1', ...newResult }];

      pb.collection.mockReturnValue({
        getFullList: jest.fn().mockResolvedValue(mockExistingResult),
      });

      const res = await request(app).post('/api/v1/results').send(newResult);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        'Result already exists for this module in the current semester. You can only update existing results or add supplementary marks.',
      );
    });

    it('should return 500 if there is a server error', async () => {
      const error = new Error('DB error');

      pb.collection.mockReturnValue({
        getFullList: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockRejectedValue(error),
      });

      const res = await request(app).post('/api/v1/results').send(newResult);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Failed to create result');
    });
  });

  describe('PATCH /api/v1/results/:resultId', () => {
    it('should update a result successfully', async () => {
      const resultId = 'result_1';
      const existingResult = { id: resultId, assignmentMark: 85 };
      const updatedData = { assignmentMark: 90 };
      const updatedResult = { ...existingResult, ...updatedData };

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockResolvedValue(existingResult),
        update: jest.fn().mockResolvedValue(updatedResult),
      });

      const res = await request(app)
        .patch(`/api/v1/results/${resultId}`)
        .send(updatedData);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: 'Result updated successfully',
        updatedResult,
      });
      expect(pb.collection).toHaveBeenCalledWith('results');
      expect(pb.collection().getOne).toHaveBeenCalledWith(resultId);
      expect(pb.collection().update).toHaveBeenCalledWith(
        resultId,
        updatedData,
      );
    });

    it('should return 404 if result not found', async () => {
      const resultId = 'result_1';

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app)
        .patch(`/api/v1/results/${resultId}`)
        .send({ assignmentMark: 90 });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Result not found');
    });

    it('should return 500 if there is a server error', async () => {
      const resultId = 'result_1';
      const error = new Error('DB error');

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockRejectedValue(error),
      });

      const res = await request(app)
        .patch(`/api/v1/results/${resultId}`)
        .send({ assignmentMark: 90 });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Failed to update result');
    });
  });

  describe('POST /api/v1/results/batch', () => {
    const batchData = {
      lecturerId: 'lecturer_1',
      facultyId: 'faculty_1',
      courseId: 'course_1',
      results: ['result_1', 'result_2'],
      year_level: 1,
      semesterId: 'semester_1',
    };

    const mockLecturer = {
      id: 'lecturer_1',
      name: 'John Doe',
      faculty: 'Engineering',
    };

    it('should submit batch results successfully', async () => {
      const mockBatch = {
        id: 'batch_1',
        ...batchData,
        status: 'pending',
      };

      pb.collection.mockImplementation((collectionName) => {
        if (collectionName === 'lecturers') {
          return {
            getOne: jest.fn().mockResolvedValue(mockLecturer),
          };
        } else if (collectionName === 'batch_results') {
          return {
            create: jest.fn().mockResolvedValue(mockBatch),
          };
        } else if (collectionName === 'results') {
          return {
            update: jest.fn().mockResolvedValue(),
          };
        }
      });

      const res = await request(app)
        .post('/api/v1/results/batch')
        .send(batchData);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        message: 'Batch results submitted successfully for review',
        batch: mockBatch,
      });
      expect(pb.collection).toHaveBeenCalledWith('lecturers');
      expect(pb.collection).toHaveBeenCalledWith('batch_results');
      expect(pb.collection).toHaveBeenCalledWith('results');
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidBatchData = { lecturerId: 'lecturer_1' };

      const res = await request(app)
        .post('/api/v1/results/batch')
        .send(invalidBatchData);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        'Missing required fields or no results provided.',
      );
    });

    it('should return 404 if lecturer not found', async () => {
      pb.collection.mockImplementation((collectionName) => {
        if (collectionName === 'lecturers') {
          return {
            getOne: jest.fn().mockResolvedValue(null),
          };
        }
      });

      const res = await request(app)
        .post('/api/v1/results/batch')
        .send(batchData);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Lecturer not found');
    });

    it('should return 500 if there is a server error', async () => {
      const error = new Error('DB error');

      pb.collection.mockImplementation((collectionName) => {
        if (collectionName === 'lecturers') {
          return {
            getOne: jest.fn().mockResolvedValue(mockLecturer),
          };
        } else if (collectionName === 'batch_results') {
          return {
            create: jest.fn().mockRejectedValue(error),
          };
        }
      });

      const res = await request(app)
        .post('/api/v1/results/batch')
        .send(batchData);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Failed to submit batch results');
    });
  });

  describe('GET /api/v1/results/year/:yearOfStudy', () => {
    it('should return results for a specific year of study', async () => {
      const yearOfStudy = 3;
      const mockResults = [
        { id: '1', yearOfStudy: yearOfStudy, studentId: 'student_1' },
      ];

      pb.collection.mockReturnValue({
        getFullList: jest.fn().mockResolvedValue(mockResults),
      });

      const res = await request(app).get(`/api/v1/results/year/${yearOfStudy}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockResults);
      expect(pb.collection).toHaveBeenCalledWith('results');
      expect(pb.collection().getFullList).toHaveBeenCalledWith({
        filter: `yearOfStudy = ${yearOfStudy}`,
        expand: 'studentId, moduleId, courseId, facultyId',
      });
    });

    it('should return 500 if there is an error', async () => {
      const yearOfStudy = 3;
      const error = new Error('DB error');

      pb.collection.mockReturnValue({
        getFullList: jest.fn().mockRejectedValue(error),
      });

      const res = await request(app).get(`/api/v1/results/year/${yearOfStudy}`);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Failed to retrieve results');
    });
  });

  describe('GET /api/v1/results/faculty/:facultyId', () => {
    it('should return results for a specific faculty', async () => {
      const facultyId = 'faculty_1';
      const mockResults = [
        { id: '1', facultyId: facultyId, studentId: 'student_1' },
      ];

      pb.collection.mockReturnValue({
        getFullList: jest.fn().mockResolvedValue(mockResults),
      });

      const res = await request(app).get(
        `/api/v1/results/faculty/${facultyId}`,
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockResults);
      expect(pb.collection).toHaveBeenCalledWith('results');
      expect(pb.collection().getFullList).toHaveBeenCalledWith({
        filter: `facultyId = "${facultyId}"`,
        expand: 'studentId, moduleId, courseId',
      });
    });

    it('should return 500 if there is an error', async () => {
      const facultyId = 'faculty_1';
      const error = new Error('DB error');

      pb.collection.mockReturnValue({
        getFullList: jest.fn().mockRejectedValue(error),
      });

      const res = await request(app).get(
        `/api/v1/results/faculty/${facultyId}`,
      );

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Failed to retrieve results');
    });
  });

  describe('GET /api/v1/results/course/:courseId', () => {
    it('should return results for a specific course', async () => {
      const courseId = 'course_1';
      const mockResults = [
        { id: '1', courseId: courseId, studentId: 'student_1' },
      ];

      pb.collection.mockReturnValue({
        getFullList: jest.fn().mockResolvedValue(mockResults),
      });

      const res = await request(app).get(`/api/v1/results/course/${courseId}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockResults);
      expect(pb.collection).toHaveBeenCalledWith('results');
      expect(pb.collection().getFullList).toHaveBeenCalledWith({
        filter: `courseId = "${courseId}"`,
        expand: 'studentId, moduleId, facultyId',
      });
    });

    it('should return 500 if there is an error', async () => {
      const courseId = 'course_1';
      const error = new Error('DB error');

      pb.collection.mockReturnValue({
        getFullList: jest.fn().mockRejectedValue(error),
      });

      const res = await request(app).get(`/api/v1/results/course/${courseId}`);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Failed to retrieve results');
    });
  });
});
