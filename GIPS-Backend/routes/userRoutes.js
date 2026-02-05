const express = require('express');
const authenticate = require('../middlewares/authenticate');
const checkRole = require('../middlewares/roleCheck');
const logActivity = require('../middlewares/logger');
//swagger ui config
/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Operations related to Users
 * paths:
 *   /v1/users:
 *     get:
 *       summary: Get all users
 *       operationId: getAllUsers
 *       tags:
 *         - Users
 *       responses:
 *         '200':
 *           description: Successful response
 *     post:
 *       summary: Create a new user
 *       operationId: createUser
 *       tags:
 *         - Users
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       responses:
 *         '201':
 *           description: User created successfully
 *   /v1/users/login:
 *     post:
 *       summary: Authenticate with password
 *       operationId: authenticateWithPassword
 *       tags:
 *         - Users
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginInput'
 *       responses:
 *         '200':
 *           description: Authentication successful
 *   /v1/users/request-password-reset:
 *     post:
 *       summary: Request password reset
 *       operationId: requestPasswordReset
 *       tags:
 *         - Users
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForgotPasswordInput'
 *       responses:
 *         '200':
 *           description: Password reset request successful
 *   /v1/users/confirm-password-request:
 *     post:
 *       summary: Confirm password reset
 *       operationId: confirmPasswordReset
 *       tags:
 *         - Users
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResetPasswordInput'
 *       responses:
 *         '200':
 *           description: Password reset confirmed
 *   /v1/users/request-email-change:
 *     post:
 *       summary: Request email change
 *       operationId: requestEmailChange
 *       tags:
 *         - Users
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmailChangeInput'
 *       responses:
 *         '200':
 *           description: Email change request successful
 *   /v1/users/confirm-email-change:
 *     post:
 *       summary: Confirm email change
 *       operationId: confirmEmailChange
 *       tags:
 *         - Users
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmailChangeConfirmationInput'
 *       responses:
 *         '200':
 *           description: Email change confirmed
 *   /v1/users/{id}:
 *     get:
 *       summary: Get user by ID
 *       operationId: getUser
 *       tags:
 *         - Users
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the user to retrieve
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Successful response
 *     patch:
 *       summary: Update user by ID
 *       operationId: updateUser
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the user to update
 *           schema:
 *             type: string
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserUpdateInput'
 *       responses:
 *         '200':
 *           description: User updated successfully
 *     delete:
 *       summary: Delete user by ID
 *       operationId: deleteUser
 *       tags:
 *         - Users
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the user to delete
 *           schema:
 *             type: string
 *       responses:
 *         '204':
 *           description: User deleted successfully
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         emailVisibility:
 *           type: boolean
 *         password:
 *           type: string
 *         passwordConfirm:
 *           type: string
 *         name:
 *           type: string
 *         role:
 *           type: string
 *     LoginInput:
 *       type: object
 *       properties:
 *         identity:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *     ForgotPasswordInput:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *     UserUpdateInput:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *         emailVisibility:
 *           type: boolean
 *         password:
 *           type: string
 *         passwordConfirm:
 *           type: string
 *         oldPassword:
 *           type: string
 *         name:
 *           type: string
 *         role:
 *           type: string
 *     ResetPasswordInput:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *         password:
 *           type: string
 *         passwordConfirm:
 *           type: string
 *     EmailChangeInput:
 *       type: object
 *       properties:
 *         newEmail:
 *           type: string
 *           format: email
 *     EmailChangeConfirmationInput:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *         password:
 *           type: string
 */

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const logActivity = require('../middlewares/logger');
const { validateUser, userSchema } = require('../validation/userSchema');

const router = express.Router();

// Public/auth endpoints
router.post('/login', authController.authenticateWithPassword);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/confirm-password-reset', authController.confirmPasswordReset);
router.post(
  '/request-email-change',
  authenticate,
  logActivity('requested email change'),
  authController.requestEmailChange,
);
router.post(
  '/confirm-email-change',
  authController.confirmEmailChange,
);

// Protected user management
router.use(authenticate, checkRole(['admin', 'superAdmin', 'hod']));

router.get('/me', logActivity('retrieved self'), userController.getMe);

router
  .route('/')
  .get(logActivity('retrieved users'), userController.getAllUsers)
  .post(
    validateUser(userSchema.create),
    logActivity('created user'),
    userController.createUser,
  );

router.get('/:id', logActivity('retrieved user data'), userController.getUser);
router.patch(
  '/:id',
  validateUser(userSchema.update),
  logActivity('updated user data'),
  userController.updateUser,
);
router.delete('/:id', logActivity('deleted user'), userController.deleteUser);

module.exports = router;
