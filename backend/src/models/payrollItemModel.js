const mongoose = require('mongoose');

const payrollItemSchema = mongoose.Schema(
  {
    payroll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payroll',
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    basicSalary: {
      type: Number,
      required: true,
    },
    earnings: {
      allowances: { type: Number, default: 0 },
      overtime: { type: Number, default: 0 },
      bonuses: { type: Number, default: 0 },
      incentives: { type: Number, default: 0 },
      others: { type: Number, default: 0 },
    },
    deductions: {
      loans: { type: Number, default: 0 },
      advances: { type: Number, default: 0 },
      lateAttendance: { type: Number, default: 0 },
      noPayLeave: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      epfEmployee: { type: Number, default: 0 },
      others: { type: Number, default: 0 },
    },
    employerContributions: {
      epfEmployer: { type: Number, default: 0 },
      etfEmployer: { type: Number, default: 0 },
    },
    totalEarnings: {
      type: Number,
      required: true,
    },
    totalDeductions: {
      type: Number,
      required: true,
    },
    netSalary: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },
    paymentDate: Date,
    paymentMethod: String,
  },
  {
    timestamps: true,
  }
);

const PayrollItem = mongoose.model('PayrollItem', payrollItemSchema);

module.exports = PayrollItem;
