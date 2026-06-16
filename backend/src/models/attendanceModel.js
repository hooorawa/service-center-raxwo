const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkIn: {
      type: String,
    },
    checkOut: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Half Day'],
      default: 'Present',
    },
    overtimeHours: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
