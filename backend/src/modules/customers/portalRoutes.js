const express = require('express');
const router = express.Router();
const { sendCustomerOTP, loginCustomer, getMyData } = require('./portalController');
const { protect } = require('../../middleware/authMiddleware');

router.post('/send-otp', sendCustomerOTP);
router.post('/login', loginCustomer);
router.get('/my-data', protect, getMyData);

module.exports = router;
