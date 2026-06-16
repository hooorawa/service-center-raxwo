const mongoose = require('mongoose');

const emailLogSchema = mongoose.Schema(
  {
    recipient: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String, // HTML or plain text
      required: true,
    },
    event: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Pending', 'Sent', 'Failed'],
      default: 'Sent',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    referenceId: mongoose.Schema.Types.ObjectId,
  },
  {
    timestamps: true,
  }
);

const EmailLog = mongoose.model('EmailLog', emailLogSchema);

module.exports = EmailLog;
