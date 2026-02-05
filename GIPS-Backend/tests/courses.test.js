const request = require('supertest');
const express = require('express');
const pb = require('../utils/dbBase'); // Mocked PocketBase SDK instance
const courseController = require('../controllers/courseController');

jest.mock('../utils/dbBase');

const app = express();
app.use(express.json());

// Set up routes
const router = express.Router();

router
  .route('/')
  .get(courseController.getAllCourses)
  .post(courseController.createCourse);

router
  .route('/:id')
  .get(courseController.getCourse)
  .patch(courseController.updateCourse)
  .delete(courseController.deleteCourse);

router
  .route('/faculty/:faculty_id')
  .get(courseController.getCoursesByFacultyId);

app.use('/api/v1/courses', router);

// Error handling middleware for the test app
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message,
  });
});

describe('Course Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/courses', () => {
    it('should return all courses', async () => {
      const mockCourses = {
        items: [
          { id: '1', course_name: 'Course 1' },
          { id: '2', course_name: 'Course 2' },
        ],
      };

      pb.collection.mockReturnValue({
        getFullList: jest.fn().mockResolvedValue(mockCourses),
      });

      const res = await request(app).get('/api/v1/courses');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        message: 'Courses retrieved successfully',
        courses: mockCourses,
      });
      expect(pb.collection).toHaveBeenCalledWith('courses');
      expect(pb.collection().getFullList).toHaveBeenCalledWith({
        expand: 'faculty',
      });
    });

    it('should handle errors when failing to get courses', async () => {
      pb.collection.mockReturnValue({
        getList: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      const res = await request(app).get('/api/v1/courses');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Failed to retrieve courses');
    });
  });

  describe('POST /api/v1/courses', () => {
    it('should create a new course', async () => {
      const newCourse = {
        course_code: 'CS101',
        course_name: 'Introduction to Computer Science',
        duration: '4 years',
        level: 'Undergraduate',
        faculty: 'Faculty of Science',
        total_credits: 120,
        type: 'Bachelor Degree',
        centre_location: 'Gaborone',
        sponsorship_options: 'All',
        facilitator: 'Dr. Smith',
      };

      const createdCourse = { id: '1', ...newCourse };

      pb.collection.mockReturnValue({
        create: jest.fn().mockResolvedValue(createdCourse),
      });

      const res = await request(app).post('/api/v1/courses').send(newCourse);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual({
        message: 'Course created successfully',
        course: createdCourse,
      });
      expect(pb.collection).toHaveBeenCalledWith('courses');
      expect(pb.collection().create).toHaveBeenCalledWith(newCourse);
    });

    it('should handle validation errors when creating a course', async () => {
      const invalidCourse = {
        // Missing required fields
        course_code: '',
        course_name: '',
        duration: '',
        level: '',
        faculty: '',
        total_credits: null,
      };

      const res = await request(app)
        .post('/api/v1/courses')
        .send(invalidCourse);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message'); // Validation error message
    });

    it('should handle errors when failing to create a course', async () => {
      const newCourse = {
        course_code: 'CS101',
        course_name: 'Introduction to Computer Science',
        duration: '4 years',
        level: 'Undergraduate',
        faculty: 'Faculty of Science',
        total_credits: 120,
      };

      pb.collection.mockReturnValue({
        create: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      const res = await request(app).post('/api/v1/courses').send(newCourse);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Failed to create course');
    });
  });

  describe('GET /api/v1/courses/:id', () => {
    it('should return a course by ID', async () => {
      const courseId = '1';
      const mockCourse = {
        id: courseId,
        course_code: 'CS101',
        course_name: 'Introduction to Computer Science',
        duration: '4 years',
        level: 'Undergraduate',
        faculty: 'Faculty of Science',
        total_credits: 120,
      };

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockResolvedValue(mockCourse),
      });

      const res = await request(app).get(`/api/v1/courses/${courseId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockCourse);
      expect(pb.collection).toHaveBeenCalledWith('courses');
      expect(pb.collection().getOne).toHaveBeenCalledWith(courseId, {
        expand: 'faculty',
      });
    });

    it('should return 404 if course not found', async () => {
      const courseId = '999';

      const error = new Error('Not Found');
      error.status = 404;

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockRejectedValue(error),
      });

      const res = await request(app).get(`/api/v1/courses/${courseId}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Course not found');
    });

    it('should handle errors when failing to get a course', async () => {
      const courseId = '1';

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      const res = await request(app).get(`/api/v1/courses/${courseId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Failed to retrieve course');
    });
  });

  describe('PATCH /api/v1/courses/:id', () => {
    it('should handle validation errors when updating a course', async () => {
      const courseId = '1';
      const invalidData = {
        course_code: '', // Invalid value
        total_credits: -10, // Invalid value
      };

      const res = await request(app)
        .patch(`/api/v1/courses/${courseId}`)
        .send(invalidData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message'); // Validation error message
    });
  });

  describe('DELETE /api/v1/courses/:id', () => {
    it('should delete a course by ID', async () => {
      const courseId = '1';
      const existingCourse = {
        id: courseId,
        course_code: 'CS101',
        course_name: 'Introduction to Computer Science',
      };

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockResolvedValue(existingCourse),
        delete: jest.fn().mockResolvedValue(),
      });

      const res = await request(app).delete(`/api/v1/courses/${courseId}`);

      expect(res.statusCode).toEqual(204);
      expect(pb.collection).toHaveBeenCalledWith('courses');
      expect(pb.collection().getOne).toHaveBeenCalledWith(courseId);
      expect(pb.collection().delete).toHaveBeenCalledWith(courseId);
    });

    it('should return 404 if course not found when deleting', async () => {
      const courseId = '999';

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app).delete(`/api/v1/courses/${courseId}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Course not found');
    });

    it('should handle errors when failing to delete a course', async () => {
      const courseId = '1';
      const existingCourse = {
        id: courseId,
        course_code: 'CS101',
        course_name: 'Introduction to Computer Science',
      };

      pb.collection.mockReturnValue({
        getOne: jest.fn().mockResolvedValue(existingCourse),
        delete: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      const res = await request(app).delete(`/api/v1/courses/${courseId}`);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Failed to delete course');
    });
  });

  describe('GET /api/v1/courses/faculty/:faculty_id', () => {
    it('should return courses by faculty ID', async () => {
      const facultyId = 'faculty123';
      const mockCourses = {
        totalItems: 2,
        totalPages: 1,
        page: 1,
        perPage: 10,
        items: [
          { id: '1', course_name: 'Course 1', faculty: facultyId },
          { id: '2', course_name: 'Course 2', faculty: facultyId },
        ],
      };

      pb.collection.mockReturnValue({
        getList: jest.fn().mockResolvedValue(mockCourses),
      });

      const res = await request(app).get(
        `/api/v1/courses/faculty/${facultyId}`,
      );

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        message: 'Courses retrieved successfully',
        totalItems: mockCourses.totalItems,
        totalPages: mockCourses.totalPages,
        currentPage: mockCourses.page,
        perPage: mockCourses.perPage,
        courses: mockCourses.items,
      });
      expect(pb.collection).toHaveBeenCalledWith('courses');
      expect(pb.collection().getList).toHaveBeenCalledWith(1, 10, {
        filter: `faculty = "${facultyId}"`,
      });
    });

    it('should handle errors when failing to get courses by faculty ID', async () => {
      const facultyId = 'faculty123';

      pb.collection.mockReturnValue({
        getList: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      const res = await request(app).get(
        `/api/v1/courses/faculty/${facultyId}`,
      );

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Failed to retrieve courses');
    });
  });
});
