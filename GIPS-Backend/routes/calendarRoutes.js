const express = require('express');

const router = express.Router();
const calendarController = require('../controllers/calendarController');
const authenticate = require('../middlewares/authenticate');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     CalendarEvent:
 *       type: object
 *       required:
 *         - title
 *         - eventType
 *         - start
 *         - end
 *         - organizerId
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the event
 *           example: "Team Meeting"
 *         eventType:
 *           type: string
 *           description: Type of the event
 *           enum: ['lecture', 'exam', 'meeting', 'holiday', 'deadline']
 *           example: "meeting"
 *         start:
 *           type: string
 *           format: date-time
 *           description: Start time of the event
 *           example: "2024-10-10T10:00:00Z"
 *         end:
 *           type: string
 *           format: date-time
 *           description: End time of the event
 *           example: "2024-10-10T12:00:00Z"
 *         location:
 *           type: string
 *           description: Location of the event
 *           example: "Board Room"
 *         organizerId:
 *           type: string
 *           description: ID of the event organizer
 *           example: "org123"
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of participant IDs
 *           example: ["user1", "user2", "user3"]
 *         isRecurring:
 *           type: boolean
 *           description: Whether the event is recurring
 *           example: false
 *         recurrencePattern:
 *           type: object
 *           description: Recurrence pattern of the event (if recurring)
 *         description:
 *           type: string
 *           description: Notes related to the event
 *           example: "Please bring all necessary documents."
 *         textColor:
 *           type: string
 *           description: Hex code for the color of the event block
 *           example: "#f2e3f7"
 *
 *   responses:
 *     EventSuccess:
 *       description: Event successfully processed
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CalendarEvent'
 *     EventListSuccess:
 *       description: Successfully fetched all events
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/CalendarEvent'
 *     EventFailure:
 *       description: Event failed to process
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: "Failed to fetch Calendar Events"
 *               details:
 *                 type: string
 *                 description: Detailed error message
 *                 example: "Error details"
 */

/**
 * @swagger
 * /v1/calendar:
 *   get:
 *     summary: Get all calendar events
 *     description: Fetch all events in the calendar
 *     operationId: getAllEvents
 *     tags:
 *       - Calendar
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         $ref: '#/components/responses/EventListSuccess'
 *       500:
 *         $ref: '#/components/responses/EventFailure'
 *
 *   post:
 *     summary: Create a new calendar event
 *     description: Create a new event in the calendar
 *     operationId: createEvent
 *     tags:
 *       - Calendar
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CalendarEvent'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/EventSuccess'
 *       400:
 *         description: Bad Request - Validation Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Validation error message"
 *       500:
 *         $ref: '#/components/responses/EventFailure'
 *
 * /v1/calendar/{id}:
 *   get:
 *     summary: Get calendar event by ID
 *     description: Fetch a specific calendar event by its ID
 *     operationId: getEventById
 *     tags:
 *       - Calendar
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the event to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         $ref: '#/components/responses/EventSuccess'
 *       404:
 *         description: Calendar event not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Calendar event not found"
 *       500:
 *         $ref: '#/components/responses/EventFailure'
 *
 *   put:
 *     summary: Update calendar event by ID
 *     description: Update details of an existing calendar event by its ID
 *     operationId: updateEvent
 *     tags:
 *       - Calendar
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the event to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CalendarEvent'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/EventSuccess'
 *       400:
 *         description: Bad Request - Validation Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Validation error message"
 *       500:
 *         $ref: '#/components/responses/EventFailure'
 *
 *   delete:
 *     summary: Delete calendar event by ID
 *     description: Remove a calendar event by its ID
 *     operationId: deleteEvent
 *     tags:
 *       - Calendar
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the event to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Event deleted successfully
 *       500:
 *         $ref: '#/components/responses/EventFailure'
 */

router
  .get('/', authenticate, calendarController.getAllEvents)
  .post('/', authenticate, calendarController.createEvent);

router
  .get('/:id', authenticate, calendarController.getEventById)
  .put('/:id', authenticate, calendarController.updateEvent)
  .delete('/:id', authenticate, calendarController.deleteEvent);

module.exports = router;
