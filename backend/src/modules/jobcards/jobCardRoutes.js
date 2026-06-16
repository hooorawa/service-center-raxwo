const express = require('express');
const {
  createJobCard,
  getJobCards,
  getJobCardById,
  updateJobCard,
  deleteJobCard,
} = require('./jobCardController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, createJobCard).get(protect, getJobCards);
router
  .route('/:id')
  .get(protect, getJobCardById)
  .put(protect, updateJobCard)
  .delete(protect, deleteJobCard);

module.exports = router;
