const Joi = require('joi');

const baseFields = {
  user_id: Joi.string().required().messages({ 'any.required': 'user_id is required' }),
  title: Joi.string().allow(null, ''),
  national_id: Joi.string().allow(null, ''),
  date_of_birth: Joi.date().iso().allow(null, ''),
  phone_number: Joi.string()
    .pattern(/^[0-9]{5,15}$/)
    .messages({ 'string.pattern.base': 'phone_number must be 5-15 digits' }),
  country: Joi.string().allow(null, ''),
  physical_address: Joi.string().allow(null, ''),
  next_of_kin_name: Joi.string().allow(null, ''),
  next_of_kin_number: Joi.string()
    .allow(null, '')
    .pattern(/^[0-9]{5,15}$/)
    .messages({ 'string.pattern.base': 'next_of_kin_number must be 5-15 digits' }),
  sponsorship: Joi.string().allow(null, ''),
  tr_number: Joi.string().allow(null, ''),
  first_name: Joi.string().required().messages({ 'any.required': 'first_name is required' }),
  last_name: Joi.string().required().messages({ 'any.required': 'last_name is required' }),
  course_id: Joi.string().allow(null, ''),
  semester_id: Joi.string().allow(null, ''),
};

const create = Joi.object({
  ...baseFields,
}).unknown(false);

const update = Joi.object(
  Object.keys(baseFields).reduce((acc, key) => {
    acc[key] = baseFields[key].optional();
    return acc;
  }, {}),
).unknown(false);

const validateStudent = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errors = error.details.map((d) => ({ field: d.context?.key, message: d.message }));
    return res.status(400).json({ status: 'fail', message: 'Validation failed', errors });
  }
  req.body = value;
  return next();
};

module.exports = {
  studentSchema: { create, update },
  validateStudent,
};
