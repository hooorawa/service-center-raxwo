const mongoose = require('mongoose');

const salaryAdvanceSchema = mongoose.Schema(
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
    requestDate: {
      type: Date,
      default: Date.now,
    },
    reason: String,
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Recovered'],
      default: 'Pending',
    },
    recoveryMonth: Number, // 1-12
    recoveryYear: Number,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

const SalaryAdvance = mongoose.model('SalaryAdvance', salaryAdvanceSchema);

module.exports = SalaryAdvance;
