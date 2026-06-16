const express = require('express');
const {
  bookAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment,
} = require('./appointmentController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, bookAppointment).get(protect, getAppointments);
router
  .route('/:id')
  .put(protect, updateAppointment)
  .delete(protect, deleteAppointment);

module.exports = router;
