const express = require('express');
const notificationController = require('../controllers/notificationController');
const authenticate = require('../middlewares/authenticate');
const logActivity = require('../middlewares/logger');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         communicationTopic:
 *           type: string
 *         messageDescription:
 *           type: string
 *         communicationChannel:
 *           type: string
 *         audience:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         isRead:
 *           type: boolean
 *     NotificationInput:
 *       type: object
 *       properties:
 *         communicationTopic:
 *           type: string
 *         messageDescription:
 *           type: string
 *         communicationChannel:
 *           type: string
 *         audience:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *     NotificationUpdateInput:
 *       type: object
 *       properties:
 *         isRead:
 *           type: boolean
 *         denseView:
 *           type: boolean
 *
 * security:
 *   - bearerAuth: []
 *
 * tags:
 *   - name: Notifications
 *     description: Operations related to Notifications
 * paths:
 *   /v1/notifications:
 *     get:
 *       summary: Get all notifications
 *       operationId: getAllNotifications
 *       tags:
 *         - Notifications
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         '200':
 *           description: Successful response
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                   results:
 *                     type: integer
 *                   data:
 *                     type: object
 *                     properties:
 *                       notifications:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Notification'
 *     post:
 *       summary: Create a new notification
 *       operationId: createNotification
 *       tags:
 *         - Notifications
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationInput'
 *       responses:
 *         '201':
 *           description: Notification created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Notification'
 *   /v1/notifications/{id}:
 *     delete:
 *       summary: Delete a notification by ID
 *       operationId: deleteNotification
 *       tags:
 *         - Notifications
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the notification to delete
 *           schema:
 *             type: string
 *       responses:
 *         '204':
 *           description: Notification deleted successfully
 *     patch:
 *       summary: Update a notification by ID
 *       operationId: updateNotification
 *       tags:
 *         - Notifications
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the notification to update
 *           schema:
 *             type: string
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationUpdateInput'
 *       responses:
 *         '200':
 *           description: Notification updated successfully
 */

const router = express.Router();

router
  .get(
    '/',
    authenticate,
    logActivity('accessed notifications'),
    notificationController.getNotifications,
  )
  // .post(
  //   '/',
  //   authenticate,
  //   logActivity('created a notification'),
  //   notificationController.createNotification,
  // );
  .post(
    '/',
    authenticate,
    logActivity('created a notification'),
    notificationController.newCreateNotification,
  );
  

router.delete(
  '/:id',
  authenticate,
  logActivity('deleted a notification'),
  notificationController.deleteNotification,
);

module.exports = router;
