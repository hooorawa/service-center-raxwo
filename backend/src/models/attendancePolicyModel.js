const mongoose = require('mongoose');

const attendancePolicySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    workingHours: {
      start: { type: String, default: '08:00' },
      end: { type: String, default: '17:00' },
    },
    gracePeriod: {
      type: Number, // in minutes
      default: 15,
    },
    latePenalty: {
      type: Number, // amount per late instance or hour
      default: 0,
    },
    overtimeRate: {
      type: Number, // multiplier for basic hourly rate
      default: 1.5,
    },
    weekendDays: {
      type: [Number], // 0-6 (Sun-Sat)
      default: [0, 6],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const AttendancePolicy = mongoose.model('AttendancePolicy', attendancePolicySchema);

module.exports = AttendancePolicy;
