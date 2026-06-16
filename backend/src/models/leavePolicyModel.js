const mongoose = require('mongoose');

const leavePolicySchema = mongoose.Schema(
  {
    leaveType: {
      type: String,
      required: true,
      enum: ['Annual', 'Sick', 'Casual', 'Medical', 'Maternity', 'Paternity', 'Unpaid'],
    },
    annualAllocation: {
      type: Number,
      required: true,
    },
    carryForward: {
      type: Boolean,
      default: false,
    },
    maxCarryForward: {
      type: Number,
      default: 0,
    },
    isPaid: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const LeavePolicy = mongoose.model('LeavePolicy', leavePolicySchema);

module.exports = LeavePolicy;
