const express = require('express');
const {
  loginAdmin,
  logoutAdmin,
  forgotPassword,
  resetPassword,
} = require('./authController');

const router = express.Router();

router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
