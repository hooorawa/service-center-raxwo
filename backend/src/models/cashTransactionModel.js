const mongoose = require('mongoose');

const cashTransactionSchema = mongoose.Schema(
  {
    transactionNumber: {
      type: String,
      required: true,
      unique: true,
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentType: {
      type: String,
      enum: ['Cash', 'Split-Cash'], // Primarily for identifying cash portion in split payments
      default: 'Cash',
    },
    transactionType: {
      type: String,
      enum: [
        'Customer Payment',
        'Refund',
        'Cash In',
        'Cash Out',
        'Adjustment',
        'Opening Balance',
        'Closing Balance'
      ],
      required: true,
    },
    registerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CashRegister',
      required: true,
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const CashTransaction = mongoose.model('CashTransaction', cashTransactionSchema);

module.exports = CashTransaction;
