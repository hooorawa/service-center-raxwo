const asyncHandler = require('express-async-handler');
const Admin = require('../../models/adminModel');
const generateToken = require('../../utils/generateToken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// @desc    Auth admin & get token
// @route   POST /api/auth/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });

  if (admin && (await admin.matchPassword(password))) {
    const token = generateToken(admin._id);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Logout admin & clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutAdmin = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Forgot password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const admin = await Admin.findOne({ email });

  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  admin.otp = otp;
  admin.otpExpire = Date.now() + 10 * 60 * 1000; // 10 mins
  await admin.save();

  // Send Email
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: admin.email,
    subject: 'Password Recovery OTP',
    text: `Your OTP for password recovery is: ${otp}. It expires in 10 minutes.`,
  };

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n========================================\n[DEV ONLY] Admin Password Reset OTP for ${email} is: ${otp}\n========================================\n`);
    }
    await transporter.sendMail(mailOptions);
    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV ONLY] Email sending failed, but letting user proceed in dev. OTP is logged above.`);
      res.json({ message: 'OTP sent to email (Dev Mode Bypass)' });
    } else {
      console.error(error);
      res.status(500);
      throw new Error('Email could not be sent');
    }
  }
});

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { otp, newPassword } = req.body;

  const admin = await Admin.findOne({
    otp,
    otpExpire: { $gt: Date.now() },
  });

  if (!admin) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  admin.password = newPassword;
  admin.otp = undefined;
  admin.otpExpire = undefined;
  await admin.save();

  res.json({ message: 'Password reset successful' });
});

module.exports = {
  loginAdmin,
  logoutAdmin,
  forgotPassword,
  resetPassword,
};
