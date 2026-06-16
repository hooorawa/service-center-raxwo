const express = require('express');
const {
  registerEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
  recordAttendance,
  getAttendance,
  getLeaveRequests,
  updateLeaveStatus,
  getLoans,
  createLoan,
  getAttendancePolicies,
  createAttendancePolicy,
  getLeavePolicies,
  createLeavePolicy,
  getSalaryAdvances,
  createSalaryAdvance,
  updateAdvanceStatus,
} = require('./hrController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, registerEmployee).get(protect, getEmployees);
// Sub-routes MUST come before /:id wildcard to prevent Express swallowing them as params
router.route('/attendance').post(protect, recordAttendance).get(protect, getAttendance);
router.route('/leave').get(protect, getLeaveRequests);
router.route('/leave/:id').put(protect, updateLeaveStatus);
router.route('/loans').get(protect, getLoans).post(protect, createLoan);
router.route('/attendance/policies').get(protect, getAttendancePolicies).post(protect, createAttendancePolicy);
router.route('/leave/policies').get(protect, getLeavePolicies).post(protect, createLeavePolicy);
router.route('/advances').get(protect, getSalaryAdvances).post(protect, createSalaryAdvance);
router.route('/advances/:id').put(protect, updateAdvanceStatus);
// Dynamic param route last
router.route('/:id').put(protect, updateEmployee).delete(protect, deleteEmployee);

module.exports = router;
