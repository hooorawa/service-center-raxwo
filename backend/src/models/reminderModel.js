const mongoose = require('mongoose');

const serviceReminderSchema = mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    reminderType: {
      type: String, // e.g., 'Oil Change', 'Annual Service'
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    dueMileage: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['Pending', 'Sent', 'Completed'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

const ServiceReminder = mongoose.model('ServiceReminder', serviceReminderSchema);

module.exports = ServiceReminder;
