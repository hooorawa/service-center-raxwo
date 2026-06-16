const mongoose = require('mongoose');

const employeeLoanSchema = mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
    },
    installmentAmount: {
      type: Number,
      required: true,
    },
    totalPaid: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Paid', 'Rejected'],
      default: 'Pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

const EmployeeLoan = mongoose.model('EmployeeLoan', employeeLoanSchema);

module.exports = EmployeeLoan;
