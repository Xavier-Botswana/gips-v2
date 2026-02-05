const express = require('express');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.use(authenticate);
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Transcript:
 *       type: object
 *       properties:
 *         firstname:
 *           type: string
 *           description: The first name of the student
 *         lastname:
 *           type: string
 *           description: The last name of the student
 *         date_of_birth:
 *           type: string
 *           format: date
 *           description: The date of birth of the student
 *         tr_number:
 *           type: string
 *           description: The student TR number
 *         course_name:
 *           type: string
 *           description: The name of the course the student is enrolled in
 *         study_mode:
 *           type: string
 *           description: The mode of study (e.g., full-time, part-time)
 *
 * tags:
 *   - name: Transcripts
 *     description: Operations related to generating student transcripts
 *
 * paths:
 *   /v1/transcripts/{id}:
 *     get:
 *       summary: Generate and download a transcript as a PDF for a student
 *       operationId: generateTranscriptPDF
 *       tags:
 *         - Transcripts
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: The student ID for which to generate the transcript
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: The transcript PDF is generated and downloaded
 *           content:
 *             application/pdf:
 *               schema:
 *                 type: string
 *                 format: binary
 *         '404':
 *           description: No results found for the student
 *         '500':
 *           description: An error occurred while generating the transcript PDF
 */

const transcriptController = require('../controllers/transcriptController');

router.get('/:id', transcriptController.generateTranscriptPDF);

module.exports = router;
