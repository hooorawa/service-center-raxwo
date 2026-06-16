const asyncHandler = require('express-async-handler');
const SMSLog = require('../../models/smsLogModel');
const EmailLog = require('../../models/emailLogModel');

// @desc    Get all SMS logs
// @route   GET /api/communication/sms
// @access  Private/Admin
const getSMSLogs = asyncHandler(async (req, res) => {
  const logs = await SMSLog.find({}).sort({ date: -1 });
  res.json(logs);
});

// @desc    Get all Email logs
// @route   GET /api/communication/email
// @access  Private/Admin
const getEmailLogs = asyncHandler(async (req, res) => {
  const logs = await EmailLog.find({}).sort({ date: -1 });
  res.json(logs);
});

// Helper for other modules to log communications
const logSMS = async (data) => {
    try {
        await SMSLog.create(data);
    } catch (err) {
        console.error('Failed to log SMS:', err);
    }
};

const logEmail = async (data) => {
    try {
        await EmailLog.create(data);
    } catch (err) {
        console.error('Failed to log Email:', err);
    }
};

module.exports = {
  getSMSLogs,
  getEmailLogs,
  logSMS,
  logEmail
};
