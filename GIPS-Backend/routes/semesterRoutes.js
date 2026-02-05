const express = require('express');
const semesterController = require('../controllers/semesterController');
const authenticate = require('../middlewares/authenticate');
const checkRole = require('../middlewares/roleCheck');

const router = express.Router();

router.post(
  '/rollover',
  authenticate,
  checkRole(['superAdmin', 'admin']),
  semesterController.rolloverSemester,
);

router
  .route('/')
  .get(semesterController.getAllSemesters)
  .post(semesterController.createSemester);

router
  .route('/:id')
  .get(semesterController.getSemester)
  .patch(semesterController.updateSemester);

module.exports = router;
