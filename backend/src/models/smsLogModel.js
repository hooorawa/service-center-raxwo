const mongoose = require('mongoose');

const smsLogSchema = mongoose.Schema(
  {
    recipient: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    event: {
      type: String, // Appointment, Invoice, ServiceComplete, etc.
    },
    status: {
      type: String,
      enum: ['Pending', 'Sent', 'Failed'],
      default: 'Sent',
    },
    deliveryStatus: String,
    date: {
      type: Date,
      default: Date.now,
    },
    referenceId: mongoose.Schema.Types.ObjectId, // Link to Invoice, Appointment, etc.
  },
  {
    timestamps: true,
  }
);

const SMSLog = mongoose.model('SMSLog', smsLogSchema);

module.exports = SMSLog;
