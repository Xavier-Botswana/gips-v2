const Joi = require('joi');

const baseFields = {
  guest_id: Joi.string().required().messages({
    'any.required': 'guest_id is required',
    'string.empty': 'guest_id is required',
  }),
  study_mode: Joi.string().valid('full_time', 'part_time', 'distance').messages({
    'any.only': 'study_mode must be full_time, part_time, or distance',
  }),
  semester: Joi.number().integer().min(1).max(6).messages({
    'number.base': 'semester must be a number',
    'number.min': 'semester must be at least 1',
    'number.max': 'semester must not exceed 6',
  }),
  tel_number: Joi.string()
    .pattern(/^[0-9]{5,15}$/)
    .messages({ 'string.pattern.base': 'tel_number must be 5-15 digits' }),
  country: Joi.string(),
  option_one: Joi.string().required().messages({
    'any.required': 'option_one is required',
    'string.empty': 'option_one is required',
  }),
  option_two: Joi.string().allow(null, ''),
  option_three: Joi.string().allow(null, ''),
  next_of_kin_name: Joi.string().allow(null, ''),
  next_of_kin_number: Joi.string()
    .allow(null, '')
    .pattern(/^[0-9]{5,15}$/)
    .messages({ 'string.pattern.base': 'next_of_kin_number must be 5-15 digits' }),
  accommodation: Joi.boolean().default(false),
  sponsorship: Joi.string().allow(null, ''),
  status: Joi.string().valid('pending', 'submitted', 'review', 'accepted', 'rejected').allow(null, ''),
};

const create = Joi.object({
  ...baseFields,
}).unknown(false);

const update = Joi.object({
  ...Object.keys(baseFields).reduce((acc, key) => {
    acc[key] = baseFields[key].optional();
    return acc;
  }, {}),
}).unknown(false);

const validateApplication = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = error.details.map((d) => ({ field: d.context?.key, message: d.message }));
    return res.status(400).json({ status: 'fail', message: 'Validation failed', errors: details });
  }
  req.body = value;
  return next();
};

module.exports = {
  applicationSchema: { create, update },
  validateApplication,
};
