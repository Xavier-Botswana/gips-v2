const express = require('express');
const lecturerController = require('../controllers/lecturerController');
const logActivity = require('../middlewares/logger');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Lecturers
 *     description: Operations related to Lecturers
 * paths:
 *   /v1/lecturers:
 *     get:
 *       summary: Get all lecturers
 *       operationId: getAllLecturers
 *       tags:
 *         - Lecturers
 *       responses:
 *         '200':
 *           description: Successful response
 *     post:
 *       summary: Create a new lecturer
 *       operationId: createLecturer
 *       tags:
 *         - Lecturers
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LecturerInput'
 *       responses:
 *         '201':
 *           description: Lecturer created successfully
 *   /v1/lecturers/{id}:
 *     get:
 *       summary: Get lecturer by ID
 *       operationId: getLecturer
 *       tags:
 *         - Lecturers
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the lecturer to retrieve
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Successful response
 *     delete:
 *       summary: Delete lecturer by ID
 *       operationId: deleteLecturer
 *       tags:
 *         - Lecturers
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the lecturer to delete
 *           schema:
 *             type: string
 *       responses:
 *         '204':
 *           description: Lecturer deleted successfully
 *     patch:
 *       summary: Update lecturer by ID
 *       operationId: updateLecturer
 *       tags:
 *         - Lecturers
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the lecturer to update
 *           schema:
 *             type: string
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LecturerUpdateInput'
 *       responses:
 *         '200':
 *           description: Lecturer updated successfully
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LecturerInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         faculty_id:
 *           type: string
 *     LecturerUpdateInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         faculty_id:
 *           type: string
 */

router.use(authenticate);

router
  .route('/')
  .get(logActivity('viewed all lecturers'), lecturerController.getLecturers)
  .post(logActivity('created new lecturer'), lecturerController.createLecturer);

router.get(
  '/user/:userId',
  logActivity('viewed lecturer by user_id'),
  lecturerController.getLecturerByUserId,
);

router.get(
  '/:id',
  logActivity('viewed lecturer details'),
  lecturerController.getLecturer,
);
router.delete(
  '/:id',
  logActivity('deleted lecturer'),
  lecturerController.deleteLecturer,
);
router.patch(
  '/:id',
  logActivity('updated lecturer details'),
  lecturerController.updateLecturer,
);

module.exports = router;
