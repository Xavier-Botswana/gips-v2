const express = require('express');
const facultyController = require('../controllers/facultyController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *  - name: Faculties
 *    description: Operations related to Faculties
 *
 * paths:
 *  /v1/faculties:
 *      get:
 *          summary: Get all faculties
 *          operationId: getAllFaculties
 *          tags:
 *             - Faculties
 *          responses:
 *             '200':
 *              description: Successful response
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Faculty'
 *          '500':
 *              description: Failed to retrieve faculties
 *      post:
 *          summary: Create a new faculty
 *          operationId: createFaculty
 *          tags:
 *             - Faculties
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              name:
 *                                  type: string
 *                                  description: Name of the faculty
 *                              facilitator:
 *                                  type: string
 *                                  description: Faculty facilitator, the ID HOD
 *          responses:
 *             '201':
 *              description: Successfully created faculty
 *             '500':
 *              description: Failed to create faculty
 *
 *      patch:
 *          summary: Update a faculty by ID
 *          operationId: updateFaculty
 *          tags:
 *             - Faculties
 *          parameters:
 *              - in: path
 *                name: id
 *                required: true
 *                schema:
 *                  type: string
 *                description: The faculty ID
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              name:
 *                                  type: string
 *                                  description: Name of the faculty
 *                              facilitator:
 *                                  type: string
 *                                  description: The facilitator ID
 *          responses:
 *             '200':
 *              description: Faculty successfully updated
 *             '500':
 *              description: Failed to update faculty
 *
 *  /v1/faculties/{id}:
 *      get:
 *          summary: Get a faculty by ID
 *          operationId: getFacultyById
 *          tags:
 *             - Faculties
 *          parameters:
 *              - in: path
 *                name: id
 *                required: true
 *                schema:
 *                  type: string
 *                description: The faculty ID
 *          responses:
 *             '200':
 *              description: Successfully retrieved the faculty
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Faculty'
 *             '404':
 *              description: Faculty not found
 *             '500':
 *              description: Failed to retrieve faculty
 */

router.get('/', facultyController.getAllFaculties);
router.post('/', facultyController.createFaculty);
router.patch('/:id', facultyController.updateFaculty);
router.get('/:id', facultyController.getFacultyById);
router.delete('/:id', facultyController.deleteFaculty);

module.exports = router;
