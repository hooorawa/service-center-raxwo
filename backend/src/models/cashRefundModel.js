const mongoose = require('mongoose');

const cashRefundSchema = mongoose.Schema(
  {
    registerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CashRegister',
      required: true,
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
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
    refundedBy: {
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

const CashRefund = mongoose.model('CashRefund', cashRefundSchema);

module.exports = CashRefund;
