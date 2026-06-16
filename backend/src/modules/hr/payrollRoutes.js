const express = require('express');
const {
  processPayroll,
  getPayrollItems,
  getPayrollHistory,
} = require('./payrollController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getPayrollHistory);
router.route('/process').post(protect, processPayroll);
router.route('/:id').get(protect, getPayrollItems);

module.exports = router;
