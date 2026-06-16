const mongoose = require('mongoose');

const financialTransactionSchema = mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ['Income', 'Expense', 'Transfer'],
      required: true,
    },
    category: {
      type: String, // Salary, Purchase, Service, Utility, etc.
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Card', 'Bank Transfer', 'Cheque', 'Petty Cash'],
      required: true,
    },
    referenceModel: {
      type: String, // Invoice, Expense, PayrollItem, etc.
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    bankAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankAccount',
    },
    description: String,
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled'],
      default: 'Completed',
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

const FinancialTransaction = mongoose.model('FinancialTransaction', financialTransactionSchema);

module.exports = FinancialTransaction;
