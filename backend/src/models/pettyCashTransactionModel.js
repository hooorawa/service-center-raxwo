const mongoose = require('mongoose');

const pettyCashTransactionSchema = mongoose.Schema(
  {
    fund: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PettyCashFund',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ['Top-up', 'Expense'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: String,
    description: String,
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
      default: 'Completed',
    },
  },
  {
    timestamps: true,
  }
);

const PettyCashTransaction = mongoose.model('PettyCashTransaction', pettyCashTransactionSchema);

module.exports = PettyCashTransaction;
