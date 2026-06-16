const mongoose = require('mongoose');

const cashAdjustmentSchema = mongoose.Schema(
  {
    registerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CashRegister',
      required: true,
    },
    type: {
      type: String,
      enum: ['Add', 'Remove'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    adjustedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CashTransaction',
    },
  },
  {
    timestamps: true,
  }
);

const CashAdjustment = mongoose.model('CashAdjustment', cashAdjustmentSchema);

module.exports = CashAdjustment;
