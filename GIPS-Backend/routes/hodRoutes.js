const express = require('express');
const hodController = require('../controllers/hodControllers');

const router = express.Router();

router.route('/').get(hodController.getHods);

module.exports = router;
