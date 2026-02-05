const express = require('express');
const multer = require('multer');

const router = express.Router();
const registrationController = require('../controllers/registrationController');
const authenticate = require('../middlewares/authenticate');
const checkRole = require('../middlewares/roleCheck');

/**
 * @swagger
 * tags:
 *   - name: Registrations
 *     description: Operations related to Registrations
 * paths:
 *   /v1/registration:
 *     get:
 *       summary: Get all registrations
 *       operationId: getAllRegistrations
 *       tags:
 *         - Registrations
 *       responses:
 *         '200':
 *           description: Successful response
 *     post:
 *       summary: Create a new registration
 *       operationId: createRegistration
 *       tags:
 *         - Registrations
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistrationInput'
 *       responses:
 *         '201':
 *           description: Registration created successfully
 *   /v1/registration/{id}:
 *     get:
 *       summary: Get registration by ID
 *       operationId: getRegistration
 *       tags:
 *         - Registrations
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the registration to retrieve
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Successful response
 *     delete:
 *       summary: Delete registration by ID
 *       operationId: deleteRegistration
 *       tags:
 *         - Registrations
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the registration to delete
 *           schema:
 *             type: string
 *       responses:
 *         '204':
 *           description: Registration deleted successfully
 *     patch:
 *       summary: Update registration by ID
 *       operationId: updateRegistration
 *       tags:
 *         - Registrations
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the registration to update
 *           schema:
 *             type: string
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistrationUpdateInput'
 *       responses:
 *         '200':
 *           description: Registration updated successfully
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RegistrationInput:
 *       type: object
 *       properties:
 *         names:
 *           type: string
 *         surname:
 *           type: string
 *         prog_name:
 *           type: string
 *         prog_code:
 *           type: string
 *         inst:
 *           type: string
 *         campus:
 *           type: string
 *         accomo:
 *           type: string
 *         study_year:
 *           type: integer
 *         study_semester:
 *           type: integer
 *         sem_start_date:
 *           type: string
 *           format: date-time
 *         sem_end_date:
 *           type: string
 *           format: date-time
 *         modules:
 *           type: string
 *         reg_status:
 *           type: boolean
 *     RegistrationUpdateInput:
 *       type: object
 *       properties:
 *         names:
 *           type: string
 *         surname:
 *           type: string
 *         prog_name:
 *           type: string
 *         prog_code:
 *           type: string
 *         inst:
 *           type: string
 *         campus:
 *           type: string
 *         accomo:
 *           type: string
 *         study_year:
 *           type: integer
 *         study_semester:
 *           type: integer
 *         sem_start_date:
 *           type: string
 *           format: date-time
 *         sem_end_date:
 *           type: string
 *           format: date-time
 *         modules:
 *           type: string
 *         reg_status:
 *           type: boolean
 */

const upload = multer();

// Public create (auth required), but list/detail/update/delete restricted to staff
router
  .route('/')
  .get(authenticate, checkRole(['admin', 'superAdmin', 'hod', 'lecturer']), registrationController.getRegistrations)
  .post(authenticate, upload.any(), registrationController.createRegistration);

router.get('/mine', authenticate, registrationController.getMyRegistrations);

router.get(
  '/by-tr/:trNumber',
  authenticate,
  checkRole(['admin', 'superAdmin', 'hod', 'lecturer', 'student']),
  registrationController.getRegistrationsByTrNumber,
);

router.post(
  '/:id/approve',
  authenticate,
  checkRole(['admin', 'superAdmin', 'hod', 'lecturer']),
  registrationController.approveRegistration,
);

router.patch(
  '/:id/mine',
  authenticate,
  checkRole(['student', 'guest', 'guestUser', 'returningGuest']),
  upload.any(),
  registrationController.updateMyRegistration,
);

router.get(
  '/:id/file/:field',
  authenticate,
  checkRole(['admin', 'superAdmin', 'hod', 'lecturer', 'student', 'guest', 'guestUser', 'returningGuest']),
  registrationController.getRegistrationFileUrl,
);

router
  .route('/:id')
  .get(authenticate, checkRole(['admin', 'superAdmin', 'hod', 'lecturer']), registrationController.getRegistration)
  .patch(authenticate, checkRole(['admin', 'superAdmin', 'hod', 'lecturer']), registrationController.updateRegistration)
  .delete(authenticate, checkRole(['admin', 'superAdmin', 'hod', 'lecturer']), registrationController.deleteRegistration);

router.route('/student/:id').get(authenticate, checkRole(['admin', 'superAdmin', 'hod', 'lecturer']), registrationController.getStudentRegistration);

module.exports = router;
