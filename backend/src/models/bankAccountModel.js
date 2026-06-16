const mongoose = require('mongoose');

const bankAccountSchema = mongoose.Schema(
  {
    bankName: {
      type: String,
      required: true,
    },
    branch: String,
    accountNumber: {
      type: String,
      required: true,
      unique: true,
    },
    accountType: {
      type: String,
      enum: ['Savings', 'Current', 'Fixed Deposit'],
      default: 'Current',
    },
    openingBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    currentBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const BankAccount = mongoose.model('BankAccount', bankAccountSchema);

module.exports = BankAccount;
