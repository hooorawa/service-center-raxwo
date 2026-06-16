const express = require('express');
const {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
} = require('./warehouseController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getWarehouses).post(protect, createWarehouse);
router.route('/:id').put(protect, updateWarehouse);

module.exports = router;
