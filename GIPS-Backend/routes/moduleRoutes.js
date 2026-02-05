const express = require('express');
const moduleController = require('../controllers/moduleController');
const logActivity = require('../middlewares/logger');
const authenticate = require('../middlewares/authenticate');
const checkRole = require('../middlewares/roleCheck');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Modules
 *     description: Operations related to Modules
 * paths:
 *   /v1/modules:
 *     get:
 *       summary: Get all modules
 *       operationId: getAllModules
 *       tags:
 *         - Modules
 *       responses:
 *         '200':
 *           description: Successful response
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Module'
 *         '500':
 *           description: Failed to retrieve modules
 *     post:
 *       summary: Create a new module
 *       operationId: createModule
 *       tags:
 *         - Modules
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModuleInput'
 *       responses:
 *         '201':
 *           description: Module created successfully
 *         '400':
 *           description: Missing required fields
 *         '500':
 *           description: Failed to create module
 *   /v1/modules/{id}:
 *     get:
 *       summary: Get module by ID
 *       operationId: getModule
 *       tags:
 *         - Modules
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the module to retrieve
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Successful response
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Module'
 *         '404':
 *           description: Module not found
 *         '500':
 *           description: Failed to retrieve module
 *     patch:
 *       summary: Update module by ID
 *       operationId: updateModule
 *       tags:
 *         - Modules
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the module to update
 *           schema:
 *             type: string
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModuleUpdateInput'
 *       responses:
 *         '200':
 *           description: Module updated successfully
 *         '500':
 *           description: Failed to update module
 *     delete:
 *       summary: Delete module by ID
 *       operationId: deleteModule
 *       tags:
 *         - Modules
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the module to delete
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Module deleted successfully
 *         '500':
 *           description: Failed to delete module
 *
 *   /v1/modules/course/{course_id}:
 *     get:
 *       summary: Get modules by course ID
 *       operationId: getModulesByCourseId
 *       tags:
 *         - Modules
 *       parameters:
 *         - name: course_id
 *           in: path
 *           required: true
 *           description: ID of the course to retrieve modules for
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
 *                   modules:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Module'
 *         '500':
 *           description: Failed to retrieve modules
 *   /v1/modules/lecturer:
 *     post:
 *       summary: Assign a lecturer to a module
 *       operationId: assignLecturerToModule
 *       tags:
 *         - Modules
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 module_id:
 *                   type: string
 *                   description: The ID of the module
 *                 lecturer_id:
 *                   type: string
 *                   description: The ID of the lecturer
 *                 level:
 *                   type: string
 *                   description: The ID of the level
 *               required:
 *                 - module_id
 *                 - lecturer_id
 *       responses:
 *         '200':
 *           description: Lecturer assigned to module successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: Lecturer assigned to module successfully
 *                   response:
 *                     type: object
 *                     properties:
 *                       module_id:
 *                         type: string
 *                       lecturer_id:
 *                         type: string
 *                       level:
 *                         type: string
 *         '400':
 *           description: Missing required fields
 *         '404':
 *           description: Module not found
 *         '500':
 *           description: Failed to assign lecturer to module
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Module:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         moduleName:
 *           type: string
 *         moduleCode:
 *           type: string
 *         parentCourse:
 *           type: string
 *         yearLevel:
 *           type: integer
 *         facultyId:
 *           type: string
 *         semester:
 *           type: string
 *         location:
 *           type: string
 *         assignmentWeight:
 *           type: number
 *         supplementWeight:
 *           type: number
 *         midSemesterWeight:
 *           type: number
 *         examMark:
 *           type: number
 *         credits:
 *           type: integer
 *         facilitator:
 *           type: string
 *     ModuleInput:
 *       type: object
 *       properties:
 *         moduleName:
 *           type: string
 *           required: true
 *         moduleCode:
 *           type: string
 *           required: true
 *         parentCourse:
 *           type: string
 *           required: true
 *         yearLevel:
 *           type: integer
 *           required: true
 *         facultyId:
 *           type: string
 *           required: true
 *         semester:
 *           type: string
 *           required: true
 *         assignmentWeight:
 *           type: number
 *           required: true
 *         supplementWeight:
 *           type: number
 *         midSemesterWeight:
 *           type: number
 *           required: true
 *         examMark:
 *           type: number
 *           required: true
 *         credits:
 *           type: integer
 *           required: true
 *         facilitator:
 *           type: string
 *     ModuleUpdateInput:
 *       type: object
 *       properties:
 *         moduleName:
 *           type: string
 *         courseId:
 *           type: string
 *         description:
 *           type: string
 */

router.use(authenticate);

router
  .route('/')
  .get(logActivity('viewed all modules'), moduleController.getAllModules)
  .post(
    logActivity('created a module'),
    checkRole(['admin', 'superAdmin', 'hod']),
    moduleController.createModule,
  );

router
  .route('/:id')
  .get(logActivity('viewed module details'), moduleController.getModule)
  .patch(
    logActivity('updated module details'),
    checkRole(['admin', 'superAdmin', 'hod']),
    moduleController.updateModule,
  )
  .delete(
    logActivity('deleted a module'),
    checkRole(['admin', 'superAdmin', 'hod']),
    moduleController.deleteModule,
  );

router.get('/:id/prerequisites', moduleController.getModulePrerequisites);

router.route('/course/:course_id').get(moduleController.getModulesByCourseId);

router.route('/lecturer').post(moduleController.assignLecturerToModule);
router.route('/lecturers').get(moduleController.getModuleLecturers);

router.post(
  '/lecturers/assign-by-name',
  checkRole(['admin', 'superAdmin', 'hod']),
  moduleController.assignModulesToLecturerByName,
);

router.get(
  '/lecturers/by-name',
  checkRole(['admin', 'superAdmin', 'hod']),
  moduleController.getModuleLecturerAssignmentsByName,
);

router.delete(
  '/lecturers/:id',
  checkRole(['admin', 'superAdmin', 'hod']),
  moduleController.deleteModuleLecturerAssignment,
);

module.exports = router;
