const express = require('express');
const semesterRegistrationController = require('../controllers/semesterRegistrationController');

const router = express.Router();

router
  .route('/:studyYear/semester/:semesterId/course/:courseId')
  .get(semesterRegistrationController.getAvailableModules);

module.exports = router;
