const express = require('express');
const {
  getDashboardStats,
  getRevenueChart,
} = require('./dashboardController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/revenue-chart', protect, getRevenueChart);

module.exports = router;
