const pb = require('../utils/dbBase');
const appLogger = require('../utils/appLogger');

const logActivity = (activity) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = async function (body) {
      originalSend.call(this, body);

      const now = new Date();
      const logData = {
        name: '',
        email: '',
        activity: activity,
        date: now.toISOString(),
      };

      // console.log('Request User:', req.user);

      try {
        // If we have userId, fetch user details from PocketBase
        if (req.user?.id) {
          const user = await pb.collection('users').getOne(req.user.id);
          logData.name = user.name;
          logData.email_address = user.email;
        }

        await pb.collection('system_logs').create(logData);
      } catch (error) {
        // Silently fail - don't break the request if logging fails
        // In production, this should be sent to a proper error tracking service
        if (process.env.NODE_ENV === 'development') {
          appLogger.warn('Error storing activity log', { error: error.message });
        }
      }
    };

    next();
  };
};

module.exports = logActivity;
