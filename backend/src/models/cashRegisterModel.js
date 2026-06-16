const mongoose = require('mongoose');

const cashRegisterSchema = mongoose.Schema(
  {
    registerName: {
      type: String,
      required: true,
      unique: true,
    },
    location: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Open', 'Closed'],
      default: 'Closed',
    },
    openedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    openedAt: {
      type: Date,
    },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    closedAt: {
      type: Date,
    },
    openingBalance: {
      type: Number,
      default: 0,
    },
    currentBalance: {
      type: Number,
      default: 0,
    },
    expectedBalance: {
      type: Number,
      default: 0,
    },
    actualBalance: {
      type: Number,
      default: 0,
    },
    variance: {
      type: Number,
      default: 0,
    },
    branch: {
      type: String, // Added for multi-branch support as requested
      default: 'Main',
    },
  },
  {
    timestamps: true,
  }
);

const CashRegister = mongoose.model('CashRegister', cashRegisterSchema);

module.exports = CashRegister;
