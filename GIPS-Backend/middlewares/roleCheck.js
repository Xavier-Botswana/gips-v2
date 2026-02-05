const HTTP_STATUS = require('../utils/httpStatus');

const checkRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res
      .status(HTTP_STATUS.FORBIDDEN)
      .json({ message: 'Forbidden: You do not have the required role' });
  }
  next();
};

module.exports = checkRole;
