const mongoose = require('mongoose');

const expenseSchema = mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ['Operational', 'Utility', 'Maintenance', 'Others'],
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Card', 'Bank Transfer'],
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
