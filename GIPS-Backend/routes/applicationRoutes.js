const express = require('express');
const multer = require('multer');

const applicationController = require('../controllers/applicationController');
const authenticate = require('../middlewares/authenticate');
const checkRole = require('../middlewares/roleCheck');

const router = express.Router();

const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
});

/**
 * @swagger
 * tags:
 *   - name: Applications
 *     description: Operations related to Applications
 * paths:
 *   /v1/applications:
 *     get:
 *       summary: Get all applications
 *       operationId: getAllApplications
 *       tags:
 *         - Applications
 *       responses:
 *         '200':
 *           description: Successful response
 *     post:
 *       summary: Create a new application
 *       operationId: createApplication
 *       tags:
 *         - Applications
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationInput'
 *       responses:
 *         '201':
 *           description: Application created successfully
 *   /v1/applications/{id}:
 *     get:
 *       summary: Get application by ID
 *       operationId: getApplication
 *       tags:
 *         - Applications
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the application to retrieve
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Successful response
 *     delete:
 *       summary: Delete application by ID
 *       operationId: deleteApplication
 *       tags:
 *         - Applications
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the application to delete
 *           schema:
 *             type: string
 *       responses:
 *         '204':
 *           description: Application deleted successfully
 *     patch:
 *       summary: Update application by ID
 *       operationId: updateApplication
 *       tags:
 *         - Applications
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the application to update
 *           schema:
 *             type: string
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationUpdateInput'
 *       responses:
 *         '200':
 *           description: Application updated successfully
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ApplicationInput:
 *       type: object
 *       properties:
 *         guest_id:
 *           type: string
 *         study_mode:
 *           type: string
 *         semester:
 *           type: integer
 *         tel_number:
 *           type: integer
 *         country:
 *           type: string
 *         option_one:
 *           type: string
 *         option_two:
 *           type: string
 *         option_three:
 *           type: string
 *         next_of_kin_name:
 *           type: string
 *         next_of_kin_number:
 *           type: integer
 *         accommodation:
 *           type: boolean
 *         sponsorship:
 *           type: string
 *         status:
 *           type: string
 *     ApplicationUpdateInput:
 *       type: object
 *       properties:
 *         guest_id:
 *           type: string
 *         study_mode:
 *           type: string
 *         semester:
 *           type: integer
 *         tel_number:
 *           type: integer
 *         country:
 *           type: string
 *         option_one:
 *           type: string
 *         option_two:
 *           type: string
 *         option_three:
 *           type: string
 *         next_of_kin_name:
 *           type: string
 *         next_of_kin_number:
 *           type: integer
 *         accommodation:
 *           type: boolean
 *         sponsorship:
 *           type: string
 *         status:
 *           type: string
 */

router
  .route('/')
  .get(
    authenticate,
    checkRole(['admin', 'superAdmin', 'hod']),
    applicationController.getApplications,
  )
  .post(
    authenticate,
    checkRole(['guest', 'guestUser', 'returningGuest', 'admin', 'superAdmin', 'hod']),
    upload.any(),
    applicationController.validateCreate,
    applicationController.createApplication,
  );

router.get(
  '/mine',
  authenticate,
  checkRole(['guest', 'guestUser', 'returningGuest', 'student']),
  applicationController.getMyApplications,
);

router.get(
  '/:id/details',
  authenticate,
  checkRole(['admin', 'superAdmin', 'hod', 'guest', 'guestUser', 'returningGuest']),
  applicationController.getApplicationDetails,
);

router.patch(
  '/:id/mine/files',
  authenticate,
  checkRole(['guest', 'guestUser', 'returningGuest']),
  upload.any(),
  applicationController.updateMyApplicationFiles,
);

router.get(
  '/user/:userId',
  authenticate,
  checkRole(['admin', 'superAdmin', 'hod']),
  applicationController.getApplicationsByUserId,
);

router.patch(
  '/:id/files',
  authenticate,
  checkRole(['admin', 'superAdmin', 'hod']),
  upload.any(),
  applicationController.updateApplicationFiles,
);

router.get(
  '/:id/file/:field',
  authenticate,
  checkRole(['admin', 'superAdmin', 'hod', 'guest', 'guestUser', 'returningGuest']),
  applicationController.getApplicationFileUrl,
);

router
  .route('/:id')
  .get(
    authenticate,
  checkRole(['admin', 'superAdmin', 'hod', 'guest', 'guestUser', 'returningGuest', 'student']),

    applicationController.getApplication,
  )
  .delete(
    authenticate,
    checkRole(['admin', 'superAdmin', 'hod']),
    applicationController.deleteApplication,
  )
  .patch(
    authenticate,
    checkRole(['admin', 'superAdmin', 'hod']),
    applicationController.validateUpdate,
    applicationController.updateApplication,
  );

module.exports = router;
