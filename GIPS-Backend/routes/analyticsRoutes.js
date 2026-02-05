const express = require('express');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Analytics endpoints with caching
router.get('/by-faculty', analyticsController.getAnalyticsByFaculty);
router.get('/by-program', analyticsController.getAnalyticsByProgram);
router.get('/by-module', analyticsController.getAnalyticsByModule);
router.get('/by-year-of-study', analyticsController.getAnalyticsByYearOfStudy);
router.get(
  '/department-performance',
  analyticsController.getDepartmentPerformanceReport,
);

// Cache management endpoints (admin only)
router.get('/cache/stats', analyticsController.getCacheStats);
router.post('/cache/invalidate', analyticsController.invalidateCache);
router.post('/cache/invalidate-pattern', analyticsController.invalidateCacheByPattern);

module.exports = router;
