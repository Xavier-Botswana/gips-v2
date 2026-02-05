const express = require('express');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();
const resultsController = require('../controllers/resultController');
const hodController = require('../controllers/hodControllers');

/**
 * @swagger
 * tags:
 *   - name: Results
 *     description: Operations related to Results
 * paths:
 *   /v1/results:
 *     get:
 *       summary: Get all results
 *       operationId: getAllResults
 *       tags:
 *         - Results
 *       responses:
 *         '200':
 *           description: Successful response
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Result'
 *     post:
 *       summary: Create a new result
 *       operationId: createResult
 *       tags:
 *         - Results
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResultInput'
 *       responses:
 *         '201':
 *           description: Result created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Result'
 *   /v1/results/{resultId}:
 *     patch:
 *       summary: Update a student's result
 *       operationId: updateResult
 *       tags:
 *         - Results
 *       parameters:
 *         - name: resultId
 *           in: path
 *           required: true
 *           description: ID of the result to update
 *           schema:
 *             type: string
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResultInput'
 *       responses:
 *         '200':
 *           description: Result updated successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Result'
 *         '404':
 *           description: Result not found
 *         '500':
 *           description: Failed to update the result
 *   /v1/results/batch:
 *     post:
 *       summary: Submit a batch of results for review
 *       operationId: submitBatchResults
 *       tags:
 *         - Results
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BatchResultInput'
 *       responses:
 *         '201':
 *           description: Batch submitted successfully
 *   /v1/results/{userId}:
 *     get:
 *       summary: Get results by student ID
 *       operationId: getResultsByStudentId
 *       tags:
 *         - Results
 *       parameters:
 *         - name: userId
 *           in: path
 *           required: true
 *           description: ID of the user to retrieve results for
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Successful response
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   data:
 *                     type: object
 *                     properties:
 *                       results:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Result'
 *                       student:
 *                         $ref: '#/components/schemas/Student'
 *         '404':
 *           description: Student not found
 *         '500':
 *           description: Failed to retrieve results
 *   /v1/results/year/{yearOfStudy}:
 *     get:
 *       summary: Get results by year of study
 *       operationId: getResultsByYearOfStudy
 *       tags:
 *         - Results
 *       parameters:
 *         - name: yearOfStudy
 *           in: path
 *           required: true
 *           description: Year of study to retrieve results for
 *           schema:
 *             type: integer
 *       responses:
 *         '200':
 *           description: Successful response
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Result'
 *   /v1/results/faculty/{facultyId}:
 *     get:
 *       summary: Get results by faculty ID
 *       operationId: getResultsByFacultyId
 *       tags:
 *         - Results
 *       parameters:
 *         - name: facultyId
 *           in: path
 *           required: true
 *           description: ID of the faculty to retrieve results for
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Successful response
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Result'
 *   /v1/results/course/{courseId}:
 *     get:
 *       summary: Get results by course ID
 *       operationId: getResultsByCourseId
 *       tags:
 *         - Results
 *       parameters:
 *         - name: courseId
 *           in: path
 *           required: true
 *           description: ID of the course to retrieve results for
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Successful response
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Result'
 *
 * components:
 *   schemas:
 *     Result:
 *       type: object
 *       properties:
 *         studentId:
 *           type: string
 *         courseId:
 *           type: string
 *         facultyId:
 *           type: string
 *         yearOfStudy:
 *           type: integer
 *         semester:
 *           type: string
 *           description: The semester the student is in
 *         moduleId:
 *           type: string
 *         assignmentMark:
 *           type: number
 *           description: The coursework or assignment mark
 *         midSemesterMark:
 *           type: number
 *           description: The mid-semester assessment mark
 *         supplementaryMark:
 *           type: number
 *           description: The mark for a supplementary exam, if applicable
 *         examMark:
 *           type: number
 *           description: The final examination mark or weight
 *         moduleMark:
 *           type: number
 *           description: The overall mark for the module, often calculated
 *         nonCreditAssessments:
 *           type: number
 *           description: The mark for non-credit-bearing assessments, if applicable
 *         lecturerId:
 *           type: string
 *         status:
 *           type: string
 *           description: The result's status (pending, approved, rejected)
 *         reviewMessage:
 *           type: string
 *           description: Optional message left by the reviewer, such as an HOD
 *         batchId:
 *           type: string
 *           description: Optional ID of the batch this result belongs to, if any
 *     ResultInput:
 *       type: object
 *       properties:
 *         studentId:
 *           type: string
 *         courseId:
 *           type: string
 *         facultyId:
 *           type: string
 *         yearOfStudy:
 *           type: integer
 *         semester:
 *           type: string
 *           description: The semester the student is in
 *         moduleId:
 *           type: string
 *         assignmentMark:
 *           type: number
 *           description: The coursework or assignment mark
 *         midSemesterMark:
 *           type: number
 *           description: The mid-semester assessment mark
 *         supplementaryMark:
 *           type: number
 *           description: The mark for a supplementary exam, if applicable
 *         examMark:
 *           type: number
 *           description: The final examination mark or weight
 *         moduleMark:
 *           type: number
 *           description: The overall mark for the module, often calculated
 *         nonCreditAssessments:
 *           type: number
 *           description: The mark for non-credit-bearing assessments, if applicable
 *         lecturerId:
 *           type: string
 *         status:
 *           type: string
 *           description: The result's status (pending, approved, rejected)
 *         reviewMessage:
 *           type: string
 *           description: Optional message left by the reviewer, such as an HOD
 *         batchId:
 *           type: string
 *           description: Optional ID of the batch this result belongs to, if any
 *     BatchResultInput:
 *       type: object
 *       properties:
 *         lecturerId:
 *           type: string
 *           description: The ID of the lecturer submitting the batch
 *         facultyId:
 *           type: string
 *         courseId:
 *           type: string
 *         results:
 *           type: array
 *           items:
 *             type: string
 *           description: List of result IDs that are part of this batch
 *     Student:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         user_id:
 *           type: string
 *         name:
 *           type: string
 *           description: The name of the student
 */

router.use(authenticate);

router
  .get('/', resultsController.getResults)
  .post('/', resultsController.createResult);

router.get('/batch', resultsController.getBatchResults);
router.get('/batch/id/:batchId', resultsController.getBatchResultById);
router.get('/batch/:moduleId', resultsController.getBatchResultsByModuleId);
router.get('/supplement', resultsController.getSupplementaryResults);
router.post('/batch', resultsController.NewSubmitBatchResults);
// router.post('/batch', resultsController.submitBatchResults);
router.patch('/batch/:batchId', hodController.reviewBatchResults);
router.get('/me', resultsController.getMyResults);
router.post('/recompute', resultsController.recomputeProgression);
router
  .get('/:userId', resultsController.getResultsByStudentId)
  .patch('/:resultId', resultsController.updateResult);
router.get('/year/:yearOfStudy', resultsController.getResultsByYearOfStudy);
router.get('/faculty/:facultyId', resultsController.getResultsByFacultyId);
router.get('/course/:courseId', resultsController.getResultsByCourseId);

module.exports = router;
