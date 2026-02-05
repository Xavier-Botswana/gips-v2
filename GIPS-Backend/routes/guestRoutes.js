const express = require('express');
const guestController = require('../controllers/guestController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Guests
 *     description: Operations related to Guests
 * paths:
 *   /v1/guests:
 *     get:
 *       summary: Get all guests
 *       operationId: getAllGuests
 *       tags:
 *         - Guests
 *       responses:
 *         '200':
 *           description: Successful response
 *     post:
 *       summary: Create a new guest
 *       operationId: createGuest
 *       tags:
 *         - Guests
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GuestInput'
 *       responses:
 *         '201':
 *           description: Guest created successfully
 *   /v1/guests/{id}:
 *     get:
 *       summary: Get guest by ID
 *       operationId: getGuest
 *       tags:
 *         - Guests
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the guest to retrieve
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Successful response
 *     delete:
 *       summary: Delete guest by ID
 *       operationId: deleteGuest
 *       tags:
 *         - Guests
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the guest to delete
 *           schema:
 *             type: string
 *       responses:
 *         '204':
 *           description: Guest deleted successfully
 *     patch:
 *       summary: Update guest by ID
 *       operationId: updateGuest
 *       tags:
 *         - Guests
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           description: ID of the guest to update
 *           schema:
 *             type: string
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GuestUpdateInput'
 *       responses:
 *         '200':
 *           description: Guest updated successfully
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GuestInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         user_id:
 *           type: string
 *         date_of_birth:
 *           type: string
 *           format: date-time
 *         national_id:
 *           type: string
 *     GuestUpdateInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         user_id:
 *           type: string
 *         date_of_birth:
 *           type: string
 *           format: date-time
 *         national_id:
 *           type: string
 */

router
  .route('/')
  .get(guestController.getGuests)
  .post(guestController.createGuest);

router
  .route('/:id')
  .get(guestController.getGuest)
  .delete(guestController.deleteGuest)
  .patch(guestController.updateGuest);

module.exports = router;
