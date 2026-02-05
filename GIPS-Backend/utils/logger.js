// utils/logger.js
const pb = require('./dbBase');
const appLogger = require('./appLogger');

class Logger {
  static async log(activity, user, metadata = {}) {
    try {
      const logEntry = {
        email: user.email,
        userId: user.id,
        activity,
        metadata: JSON.stringify(metadata),
        created: new Date().toISOString(),
      };

      return await pb.collection('system_logs').create(logEntry);
    } catch (error) {
      // Silently fail in production - logging should not break the application
      if (process.env.NODE_ENV === 'development') {
        appLogger.warn('Logging failed', { error: error.message });
      }
    }
  }

  // Log different types of activities with specific methods
  static async logLogin(user) {
    return this.log('USER_LOGIN', user);
  }

  static async logLogout(user) {
    return this.log('USER_LOGOUT', user);
  }

  static async logResourceAction(user, action, resourceType, resourceId) {
    return this.log(
      `${resourceType.toUpperCase()}_${action.toUpperCase()}`,
      user,
      {
        resourceType,
        resourceId,
      },
    );
  }
}

module.exports = Logger;
