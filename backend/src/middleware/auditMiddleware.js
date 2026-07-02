const AuditLog = require('../models/auditLogModel');

const logActivity = async (user, action, module, description, ipAddress = '', metadata = null) => {
  try {
    await AuditLog.create({
      user,
      action,
      module,
      description,
      ipAddress,
      metadata
    });
  } catch (error) {
    console.error('Audit Log Failed:', error.message);
  }
};

const auditMiddleware = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (body) {
    res.send = originalSend;
    
    // Log mutating operations (POST, PUT, DELETE) that completed successfully (2xx)
    if (res.statusCode >= 200 && res.statusCode < 300 && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
      // Exclude auth routes to avoid logging raw passwords
      if (!req.originalUrl.includes('/api/auth')) {
        const user = req.user ? req.user.email || req.user.name : 'System';
        const action = req.method === 'POST' ? 'CREATE' : req.method === 'PUT' ? 'UPDATE' : 'DELETE';
        const pathParts = req.originalUrl.split('/');
        const moduleName = pathParts[2] ? pathParts[2].toUpperCase() : 'SYSTEM';
        
        const description = `${action} request on endpoint: ${req.originalUrl}`;

        // Don't await logging in the response cycle
        logActivity(
          user, 
          action, 
          moduleName, 
          description, 
          req.ip || req.headers['x-forwarded-for'] || '', 
          {
            query: req.query,
            params: req.params,
            body: req.method !== 'DELETE' ? { ...req.body, password: undefined } : undefined
          }
        );
      }
    }

    return originalSend.apply(this, arguments);
  };

  next();
};

module.exports = {
  logActivity,
  auditMiddleware
};
