const express = require('express');
const smsController = require('../controllers/smsController');
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
 *     SMSSendInput:
 *       type: object
 *       required:
 *         - body
 *         - to
 *       properties:
 *         body:
 *           type: string
 *           description: The message to send
 *           example: "This is a test from the GIPS Backend"
 *         to:
 *           type: array
 *           description: The list of recipient phone numbers
 *           items:
 *             type: string
 *             example: "+2677xxxxxxx"
 *
 *   responses:
 *     SMSSuccess:
 *       description: SMS sent successfully
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: success
 *               message:
 *                 type: string
 *                 example: SMS sent successfully
 *               data:
 *                 type: object
 *                 properties:
 *                   sid:
 *                     type: string
 *                     description: Twilio Message SID
 *                     example: SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
 *
 *     SMSFailure:
 *       description: Failed to send SMS
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: error
 *               message:
 *                 type: string
 *                 example: Failed to send SMS
 *               error:
 *                 type: string
 *                 description: Error message
 *                 example: "Some error message"
 */

/**
 * @swagger
 * /v1/sms/send:
 *   post:
 *     summary: Send an SMS
 *     description: Sends an SMS using Twilio to a specified phone number(s).
 *     operationId: sendSMS
 *     tags:
 *       - SMS
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SMSSendInput'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/SMSSuccess'
 *       500:
 *         $ref: '#/components/responses/SMSFailure'
 */

const router = express.Router();

router.post('/send', authenticate, smsController.sendSMS);

module.exports = router;
