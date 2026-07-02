const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
      default: 'System',
    },
    action: {
      type: String,
      required: true,
    },
    module: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    }
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
