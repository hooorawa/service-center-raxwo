const mongoose = require('mongoose');

const customerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
    },
    history: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobCard',
      },
    ],
    password: { type: String },
    otp: { type: String },
    otpExpire: { type: Date },
    isRegistered: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);


const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
