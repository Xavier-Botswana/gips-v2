const express = require('express');
const courseController = require('../controllers/courseController');
const authenticate = require('../middlewares/authenticate');
const checkRole = require('../middlewares/roleCheck');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Courses
 *     description: Operations related to Courses
 * paths:
 *   /v1/courses:
 *     get:
 *       summary: Get all courses with pagination
 *       operationId: getAllCourses
 *       tags:
 *         - Courses
 *       parameters:
 *         - name: page
 *           in: query
 *           description: The page number to retrieve
 *           schema:
 *             type: integer
 *             default: 1
 *         - name: perPage
 *           in: query
 *           description: The number of records per page
 *           schema:
 *             type: integer
 *             default: 10
 *       responses:
 *         '200':
 *           description: Successful response
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   totalItems:
 *                     type: integer
 *                   totalPages:
 *                     type: integer
 *                   currentPage:
 *                     type: integer
 *                   perPage:
 *                     type: integer
 *                   courses:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Course'
 *         '500':
 *           description: Failed to retrieve courses
 *     post:
 *       summary: Create a new course
 *       operationId: createCourse
 *       tags:
 *         - Courses
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseInput'
 *       responses:
 *         '201':
 *           description: Course created successfully
 *         '400':
 *           description: Missing required fields
 *         '500':
 *           description: Failed to create course
 *   /v1/courses/{id}:
 *     get:
 *       summary: Get course by ID
 *       operationId: getCourse
 *       tags:
 *         - Courses
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the course to retrieve
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Successful response
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Course'
 *         '404':
 *           description: Course not found
 *         '500':
 *           description: Failed to retrieve course
 *     patch:
 *       summary: Update course by ID
 *       operationId: updateCourse
 *       tags:
 *         - Courses
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the course to update
 *           schema:
 *             type: string
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseUpdateInput'
 *       responses:
 *         '200':
 *           description: Course updated successfully
 *         '500':
 *           description: Failed to update course
 *     delete:
 *       summary: Delete course by ID
 *       operationId: deleteCourse
 *       tags:
 *         - Courses
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the course to delete
 *           schema:
 *             type: string
 *       responses:
 *         '204':
 *           description: Course deleted successfully
 *         '500':
 *           description: Failed to delete course
 *   /api/v1/courses/faculty/{faculty_id}:
 *     get:
 *       summary: Get courses by faculty ID with pagination
 *       operationId: getCoursesByFacultyId
 *       tags:
 *         - Courses
 *       parameters:
 *         - name: faculty_id
 *           in: path
 *           required: true
 *           description: ID of the faculty to retrieve courses for
 *           schema:
 *             type: string
 *         - name: page
 *           in: query
 *           description: The page number to retrieve
 *           schema:
 *             type: integer
 *             default: 1
 *         - name: perPage
 *           in: query
 *           description: The number of records per page
 *           schema:
 *             type: integer
 *             default: 10
 *       responses:
 *         '200':
 *           description: Successful response
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   totalItems:
 *                     type: integer
 *                   totalPages:
 *                     type: integer
 *                   currentPage:
 *                     type: integer
 *                   perPage:
 *                     type: integer
 *                   courses:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Course'
 *         '500':
 *           description: Failed to retrieve courses
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         course_code:
 *           type: string
 *         course_name:
 *           type: string
 *         duration:
 *           type: string
 *         level:
 *           type: string
 *         type:
 *           type: string
 *         faculty:
 *           type: string
 *         location:
 *           type: string
 *         sponsorship_options:
 *           type: string
 *         total_credits:
 *           type: number
 *         facilitator:
 *           type: string
 *     CourseInput:
 *       type: object
 *       properties:
 *         course_code:
 *           type: string
 *           required: true
 *         course_name:
 *           type: string
 *           required: true
 *         duration:
 *           type: string
 *           required: true
 *         level:
 *           type: string
 *           required: true
 *         faculty:
 *           type: string
 *           required: true
 *         total_credits:
 *           type: number
 *           required: true
 *         type:
 *           type: string
 *         location:
 *           type: string
 *         sponsorship_options:
 *           type: string
 *         facilitator:
 *           type: string
 *     CourseUpdateInput:
 *       type: object
 *       properties:
 *         course_name:
 *           type: string
 *         faculty:
 *           type: string
 *         facilitator:
 *           type: string
 */

router
  .route('/')
  .get(courseController.getAllCourses)
  .post(authenticate, checkRole(['admin', 'superAdmin', 'hod']), courseController.createCourse);

router
  .route('/:id')
  .get(courseController.getCourse)
  .patch(authenticate, checkRole(['admin', 'superAdmin', 'hod']), courseController.updateCourse)
  .delete(authenticate, checkRole(['admin', 'superAdmin', 'hod']), courseController.deleteCourse);

router
  .route('/faculty/:faculty_id')
  .get(courseController.getCoursesByFacultyId);

module.exports = router;
