const mongoose = require('mongoose');

const quotationSchema = mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    jobCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobCard',
    },
    items: [
      {
        description: String,
        quantity: Number,
        unitPrice: Number,
        total: Number,
      },
    ],
    laborCharges: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Approved', 'Rejected'],
      default: 'Draft',
    },
    expiryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Quotation = mongoose.model('Quotation', quotationSchema);

module.exports = Quotation;
