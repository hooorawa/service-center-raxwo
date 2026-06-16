const asyncHandler = require('express-async-handler');
const Customer = require('../../models/customerModel');
const generateToken = require('../../utils/generateToken');
const nodemailer = require('nodemailer');

// @desc    Send OTP to customer email
// @route   POST /api/portal/send-otp
// @access  Public
const sendCustomerOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const customer = await Customer.findOne({ email });

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found with this email');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  customer.otp = otp;
  customer.otpExpire = Date.now() + 10 * 60 * 1000; // 10 mins
  await customer.save();

  // Send Email (Reuse logic from authController if possible, but keep it simple here)
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customer.email,
    subject: 'Customer Portal Login OTP',
    text: `Your OTP for the Service Center Customer Portal is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500);
    throw new Error('Email delivery failed');
  }
});

// @desc    Verify OTP and Login
// @route   POST /api/portal/login
// @access  Public
const loginCustomer = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const customer = await Customer.findOne({ 
    email, 
    otp, 
    otpExpire: { $gt: Date.now() } 
  });

  if (customer) {
    customer.otp = undefined;
    customer.otpExpire = undefined;
    customer.isRegistered = true;
    await customer.save();

    res.json({
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      token: generateToken(customer._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid or expired OTP');
  }
});

const Appointment = require('../../models/appointmentModel');
const Vehicle = require('../../models/vehicleModel');

// @desc    Get logged in customer data
// @route   GET /api/portal/my-data
// @access  Private/Customer
const getMyData = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.user._id);
  
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  const vehicles = await Vehicle.find({ customer: customer._id });
  const appointments = await Appointment.find({ customer: customer._id }).populate('vehicle');

  res.json({
    customer,
    vehicles,
    appointments,
  });
});

module.exports = {
  sendCustomerOTP,
  loginCustomer,
  getMyData,
};

