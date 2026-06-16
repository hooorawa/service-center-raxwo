const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
  {
    type: {
      type: String, // 'Alert', 'Info', 'Warning'
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    module: {
      type: String, // 'Inventory', 'Insurance', 'Service'
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
