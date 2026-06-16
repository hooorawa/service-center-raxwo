const mongoose = require('mongoose');

const payrollSchema = mongoose.Schema(
  {
    month: {
      type: Number, // 1-12
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    payrollDate: {
      type: Date,
      default: Date.now,
    },
    totalEarnings: {
      type: Number,
      required: true,
      default: 0,
    },
    totalDeductions: {
      type: Number,
      required: true,
      default: 0,
    },
    totalNetSalary: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Draft', 'Processed', 'Paid'],
      default: 'Draft',
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

// Compound index for month/year uniqueness
payrollSchema.index({ month: 1, year: 1 }, { unique: true });

const Payroll = mongoose.model('Payroll', payrollSchema);

module.exports = Payroll;
