const express = require('express');
const router = express.Router();
const {
  getInspectionByJobCard,
  upsertInspection,
  approveInspection,
} = require('./inspectionController');
const { protect } = require('../../middleware/authMiddleware');

router.route('/').post(protect, upsertInspection);
router.route('/jobcard/:id').get(protect, getInspectionByJobCard);
router.route('/:id/approve').put(protect, approveInspection);

module.exports = router;
