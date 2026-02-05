const express = require('express');
const resultSlipController = require('../controllers/resultSlipController');
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
 *     StudentResultSlip:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Student ID
 *           example: "abc123xyz456"
 *         semester:
 *           type: string
 *           description: Academic semester
 *           example: "1"
 *
 *     BatchResultSlip:
 *       type: object
 *       properties:
 *         courseId:
 *           type: string
 *           description: Course ID
 *           example: "course123"
 *         semester:
 *           type: string
 *           description: Academic semester
 *           example: "1"
 *
 *   responses:
 *     ResultSlipSuccess:
 *       description: Result slip PDF generated successfully
 *       content:
 *         application/pdf:
 *           schema:
 *             type: string
 *             format: binary
 *
 *     BatchResultSlipSuccess:
 *       description: Batch result slips generated and zipped successfully
 *       content:
 *         application/zip:
 *           schema:
 *             type: string
 *             format: binary
 *
 *     ResultSlipFailure:
 *       description: Failed to generate result slip
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: An error occurred while generating the result slip PDF.
 *               error:
 *                 type: string
 *                 description: Error message
 *                 example: "No results found for the student in this semester."
 */

/**
 * @swagger
 * /v1/result-slip/{id}/{semester}:
 *   get:
 *     summary: Generate a student's result slip
 *     description: Generates a PDF result slip for a specific student and semester
 *     operationId: generateResultSlip
 *     tags:
 *       - Result Slips
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *       - in: path
 *         name: semester
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic semester
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ResultSlipSuccess'
 *       404:
 *         $ref: '#/components/responses/ResultSlipFailure'
 *       500:
 *         $ref: '#/components/responses/ResultSlipFailure'
 *
 * /v1/result-slip/batch/{courseId}/{semester}:
 *   get:
 *     summary: Generate result slips for all students in a course
 *     description: Generates PDF result slips for all students in a specific course and semester, returns as zip file
 *     operationId: generateBatchResultSlips
 *     tags:
 *       - Result Slips
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *       - in: path
 *         name: semester
 *         required: true
 *         schema:
 *           type: string
 *         description: Academic semester
 *     responses:
 *       200:
 *         $ref: '#/components/responses/BatchResultSlipSuccess'
 *       404:
 *         $ref: '#/components/responses/ResultSlipFailure'
 *       500:
 *         $ref: '#/components/responses/ResultSlipFailure'
 */

const router = express.Router();

router.get(
  '/:id/:semester',
  authenticate,
  resultSlipController.generateResultSlipPDF,
);
router.get(
  '/batch/:courseId/:semester',
  authenticate,
  resultSlipController.generateBatchResultSlips,
);

module.exports = router;
