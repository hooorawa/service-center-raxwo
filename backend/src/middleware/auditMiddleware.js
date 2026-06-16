const AuditLog = require('../models/auditLogModel');

const logAudit = (action, module) => {
  return async (req, res, next) => {
    // We'll log AFTER the response is sent if successful
    const originalSend = res.send;
    res.send = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Log the action
        if (req.admin) {
          AuditLog.create({
            adminId: req.admin._id,
            action,
            module,
            details: {
              method: req.method,
              url: req.originalUrl,
              body: req.body,
            },
            ipAddress: req.ip,
          }).catch((err) => console.error('Audit Log Error:', err));
        }
      }
      originalSend.apply(res, arguments);
    };
    next();
  };
};

module.exports = { logAudit };
