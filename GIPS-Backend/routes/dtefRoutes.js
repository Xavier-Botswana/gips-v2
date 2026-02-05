const express = require('express');
const authenticate = require('../middlewares/authenticate');
const checkRole = require('../middlewares/roleCheck');
const dtefController = require('../controllers/dtefController');

const router = express.Router();

router.post(
  '/registrations',
  authenticate,
  checkRole(['admin', 'superAdmin', 'hod']),
  dtefController.sendRegistration,
);

module.exports = router;
