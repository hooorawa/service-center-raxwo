const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema(
  {
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Card', 'Bank Transfer', 'Online'],
      required: true,
    },
    transactionId: {
      type: String,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Completed', 'Refunded', 'Failed'],
      default: 'Completed',
    },
    isRefunded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
