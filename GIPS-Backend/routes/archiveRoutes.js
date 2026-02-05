const express = require('express');
const multer = require('multer');

const archiveController = require('../controllers/archiveController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

const upload = multer({
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

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
 *     Archive:
 *       type: object
 *       required: ['title', 'fileUrl']
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The unique identifier of the archive
 *         title:
 *           type: string
 *           description: The title of the archive
 *         description:
 *           type: string
 *           description: A description of the archive
 *         fileUrl:
 *           type: string
 *           format: uri
 *           description: The URL of the archived file
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the archive was created
 *
 * tags:
 *   - name: Archives
 *     description: Operations related to managing archives
 *
 * paths:
 *   /v1/archives:
 *     post:
 *       summary: Create a new archive entry
 *       operationId: createArchive
 *       tags:
 *         - Archives
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Archive'
 *       responses:
 *         '201':
 *           description: Archive created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Archive'
 *         '400':
 *           description: Validation error
 *         '401':
 *           description: Unauthorized
 *
 *     get:
 *       summary: Retrieve a paginated list of archives
 *       operationId: getArchives
 *       tags:
 *         - Archives
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: page
 *           in: query
 *           description: Page number for pagination
 *           schema:
 *             type: integer
 *             minimum: 1
 *             default: 1
 *         - name: perPage
 *           in: query
 *           description: Number of items per page
 *           schema:
 *             type: integer
 *             minimum: 1
 *             maximum: 100
 *             default: 20
 *       responses:
 *         '200':
 *           description: A paginated list of archives
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                   results:
 *                     type: integer
 *                   currentPage:
 *                     type: integer
 *                   totalPages:
 *                     type: integer
 *                   totalRecords:
 *                     type: integer
 *                   archives:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Archive'
 *         '401':
 *           description: Unauthorized
 *
 *   /v1/archives/{id}:
 *     get:
 *       summary: Retrieve a specific archive by ID
 *       operationId: getArchiveById
 *       tags:
 *         - Archives
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: The ID of the archive to retrieve
 *           schema:
 *             type: string
 *             format: uuid
 *       responses:
 *         '200':
 *           description: Archive retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Archive'
 *         '404':
 *           description: Archive not found
 *         '401':
 *           description: Unauthorized
 *
 *   /v1/archives/download/{id}:
 *     get:
 *       summary: Download an archive file by ID
 *       operationId: downloadArchive
 *       tags:
 *         - Archives
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: The ID of the archive to download
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: URL for downloading the archive file
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                   fileUrl:
 *                     type: string
 *                     format: uri
 *         '404':
 *           description: Archive not found or file not available
 *         '401':
 *           description: Unauthorized
 *         '500':
 *           description: Failed to retrieve the archive for download
 */

router.post('/', upload.single('file'), archiveController.createArchive);
router.get('/', archiveController.getArchives);
router.get('/download/:id', archiveController.getArchiveFileUrl);
router.get('/:id', archiveController.getArchiveById);

module.exports = router;
