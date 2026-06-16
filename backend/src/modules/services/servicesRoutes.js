const express = require('express');
const {
  getServices,
  createService,
  updateService,
  deleteService,
} = require('./servicesController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getServices).post(protect, createService);
router.route('/:id').put(protect, updateService).delete(protect, deleteService);

module.exports = router;
