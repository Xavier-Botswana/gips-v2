const express = require('express');

const router = express.Router();
const superAdminController = require('../controllers/superAdminController');

// Academic Year Management Routes
router.post('/startAcademicYear', superAdminController.startAcademicYear);
router.post('/startSemester', superAdminController.startSemester);

// System Logs Routes
router.get('/viewSystemLogs', superAdminController.viewSystemLogs);

module.exports = router;
