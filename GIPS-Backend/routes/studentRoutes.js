const express = require('express');
const studentController = require('../controllers/studentController');
const authenticate = require('../middlewares/authenticate');
const checkRole = require('../middlewares/roleCheck');
const { validateStudent, studentSchema } = require('../validation/studentSchema');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Students
 *     description: Operations related to Students
 * paths:
 *   /v1/students:
 *     get:
 *       summary: Get all students
 *       operationId: getAllStudents
 *       tags:
 *         - Students
 *       responses:
 *         '200':
 *           description: Successful response
 *     post:
 *       summary: Create a new student
 *       operationId: createStudent
 *       tags:
 *         - Students
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentInput'
 *       responses:
 *         '201':
 *           description: Student created successfully
 *   /v1/students/{id}:
 *     get:
 *       summary: Get student by ID
 *       operationId: getStudent
 *       tags:
 *         - Students
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the student to retrieve
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Successful response
 *     delete:
 *       summary: Delete student by ID
 *       operationId: deleteStudent
 *       tags:
 *         - Students
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the student to delete
 *           schema:
 *             type: string
 *       responses:
 *         '204':
 *           description: Student deleted successfully
 *     patch:
 *       summary: Update student by ID
 *       operationId: updateStudent
 *       tags:
 *         - Students
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the student to update
 *           schema:
 *             type: string
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentUpdateInput'
 *       responses:
 *         '200':
 *           description: Student updated successfully
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     StudentInput:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *         title:
 *           type: string
 *         national_id:
 *           type: string
 *         date_of_birth:
 *           type: string
 *           format: date-time
 *         phone_number:
 *           type: integer
 *         country:
 *           type: string
 *         physical_address:
 *           type: string
 *         next_of_kin_name:
 *           type: string
 *         next_of_kin_number:
 *           type: string
 *         sponsorship:
 *           type: string
 *         tr_number:
 *           type: string
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *     StudentUpdateInput:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *         title:
 *           type: string
 *         national_id:
 *           type: string
 *         date_of_birth:
 *           type: string
 *           format: date-time
 *         phone_number:
 *           type: integer
 *         country:
 *           type: string
 *         physical_address:
 *           type: string
 *         next_of_kin_name:
 *           type: string
 *         next_of_kin_number:
 *           type: string
 *         sponsorship:
 *           type: string
 *         tr_number:
 *           type: string
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 */

router
  .route('/')
  .get(
    authenticate,
    checkRole(['admin', 'superAdmin', 'hod', 'lecturer']),
    studentController.getStudents,
  )
  .post(
    authenticate,
    checkRole(['admin', 'superAdmin', 'hod']),
    validateStudent(studentSchema.create),
    studentController.createStudent,
  );

router.get(
  '/me',
  authenticate,
  checkRole(['admin', 'superAdmin', 'hod', 'lecturer', 'student']),
  studentController.getMyStudent,
);

router.get(
  '/user/:userId',
  authenticate,
  checkRole(['admin', 'superAdmin', 'hod', 'lecturer']),
  studentController.getStudentByUserId,
);

router.get(
  '/all',
  authenticate,
  checkRole(['admin', 'superAdmin', 'hod', 'lecturer']),
  studentController.getAllStudents,
);

router
  .route('/:id')
  .get(
    authenticate,
    checkRole(['admin', 'superAdmin', 'hod', 'lecturer', 'student']),
    studentController.getStudent,
  )
  .delete(
    authenticate,
    checkRole(['admin', 'superAdmin', 'hod']),
    studentController.deleteStudent,
  )
  .patch(
    authenticate,
    checkRole(['admin', 'superAdmin', 'hod']),
    validateStudent(studentSchema.update),
    studentController.updateStudent,
  );

module.exports = router;
