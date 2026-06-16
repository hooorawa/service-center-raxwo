const express = require('express');
const {
  createRegister,
  getRegisters,
  openRegister,
  closeRegister,
  addAdjustment,
  getRegisterTransactions,
} = require('./cashController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.route('/registers').get(protect, getRegisters).post(protect, createRegister);
router.route('/registers/:id/open').post(protect, openRegister);
router.route('/registers/:id/close').post(protect, closeRegister);
router.route('/registers/:id/adjust').post(protect, addAdjustment);
router.route('/registers/:id/transactions').get(protect, getRegisterTransactions);

module.exports = router;
