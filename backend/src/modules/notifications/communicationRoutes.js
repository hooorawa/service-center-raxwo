const express = require('express');
const { getSMSLogs, getEmailLogs } = require('./communicationController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/sms', protect, getSMSLogs);
router.get('/email', protect, getEmailLogs);

module.exports = router;
