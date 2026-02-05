const Joi = require('joi');

const baseFields = {
  name: Joi.string().required().messages({ 'any.required': 'name is required' }),
  email: Joi.string().email().required().messages({ 'any.required': 'email is required' }),
  role: Joi.string()
    .valid('admin', 'superAdmin', 'hod', 'lecturer', 'student', 'guest', 'guestUser', 'returningGuest')
    .required()
    .messages({ 'any.only': 'role is invalid', 'any.required': 'role is required' }),
  faculty_id: Joi.string().allow(null, ''),
  department: Joi.string().allow(null, ''),
  phone_number: Joi.string()
    .allow(null, '')
    .pattern(/^[0-9]{5,15}$/)
    .messages({ 'string.pattern.base': 'phone_number must be 5-15 digits' }),
  password: Joi.string().min(8),
  passwordConfirm: Joi.string().valid(Joi.ref('password')).messages({
    'any.only': 'passwordConfirm must match password',
  }),
};

const create = Joi.object({
  ...baseFields,
  password: baseFields.password.required().messages({ 'any.required': 'password is required' }),
  passwordConfirm: baseFields.passwordConfirm.required().messages({ 'any.required': 'passwordConfirm is required' }),
}).unknown(false);

const update = Joi.object(
  Object.keys(baseFields).reduce((acc, key) => {
    acc[key] = baseFields[key].optional();
    return acc;
  }, {}),
).unknown(false);

const validateUser = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errors = error.details.map((d) => ({ field: d.context?.key, message: d.message }));
    return res.status(400).json({ status: 'fail', message: 'Validation failed', errors });
  }
  req.body = value;
  return next();
};

module.exports = {
  userSchema: { create, update },
  validateUser,
};
