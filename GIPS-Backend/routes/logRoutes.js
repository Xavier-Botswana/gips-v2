const express = require('express');
const logController = require('../controllers/logController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Log:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier of the log entry
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date and time of the log entry
 *         email:
 *           type: string
 *           description: The email associated with the activity
 *         activity:
 *           type: string
 *           description: A description of the activity logged
 *
 * tags:
 *   - name: Logs
 *     description: Operations related to system logs
 *
 * paths:
 *   /v1/logs:
 *     get:
 *       summary: Retrieve paginated log entries
 *       operationId: getLogs
 *       tags:
 *         - Logs
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: page
 *           in: query
 *           description: The page number for pagination
 *           schema:
 *             type: integer
 *         - name: perPage
 *           in: query
 *           description: The number of items per page
 *           schema:
 *             type: integer
 *       responses:
 *         '200':
 *           description: A paginated list of log entries
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     description: The status of the request
 *                   results:
 *                     type: integer
 *                     description: The number of log entries returned
 *                   currentPage:
 *                     type: integer
 *                     description: The current page number
 *                   totalPages:
 *                     type: integer
 *                     description: The total number of pages
 *                   totalRecords:
 *                     type: integer
 *                     description: The total number of log entries
 *                   logs:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Log'
 *         '401':
 *           description: Unauthorized, authentication required
 *         '500':
 *           description: Failed to retrieve log entries
 */

router.use(authenticate);

router.get('/logs', logController.getLogs);

module.exports = router;
