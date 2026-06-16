const mongoose = require('mongoose');

const cashReceiptSchema = mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CashTransaction',
      required: true,
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
    },
    pdfUrl: String,
    status: {
      type: String,
      enum: ['Generated', 'Sent', 'Printed'],
      default: 'Generated',
    },
  },
  {
    timestamps: true,
  }
);

const CashReceipt = mongoose.model('CashReceipt', cashReceiptSchema);

module.exports = CashReceipt;
