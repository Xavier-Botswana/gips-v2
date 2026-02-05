const Joi = require('joi');
const HTTP_STATUS = require('../utils/httpStatus');

const moduleSchema = {
  create: Joi.object({
    module_name: Joi.string().required().trim().messages({
      'string.empty': 'Module name is required',
      'any.required': 'Module name is required',
    }),

    module_code: Joi.string().required().trim().messages({
      'string.empty': 'Module code is required',
      'any.required': 'Module code is required',
    }),

    parent_course: Joi.string().required().messages({
      'string.empty': 'Parent course is required',
      'any.required': 'Parent course is required',
    }),

    year_level: Joi.number().required().min(1).max(4).messages({
      'number.base': 'Year level must be a number',
      'number.min': 'Year level must be between 1 and 4',
      'number.max': 'Year level must be between 1 and 4',
      'any.required': 'Year level is required',
    }),

    faculty: Joi.string().required().messages({
      'string.empty': 'Faculty is required',
      'any.required': 'Faculty is required',
    }),

    semester: Joi.string().required().messages({
      'string.empty': 'Semester is required',
      'any.required': 'Semester is required',
    }),

    location: Joi.string().allow(null, ''),

    assignment_weight: Joi.number().required().min(0).max(100).messages({
      'number.base': 'Assignment weight must be a number',
      'number.min': 'Assignment weight must be between 0 and 100',
      'number.max': 'Assignment weight must be between 0 and 100',
      'any.required': 'Assignment weight is required',
    }),

    supplement_weight: Joi.number().allow(null).min(0).max(100).messages({
      'number.min': 'Supplement weight must be between 0 and 100',
      'number.max': 'Supplement weight must be between 0 and 100',
    }),

    mid_semester_weight: Joi.number().required().min(0).max(100).messages({
      'number.base': 'Mid semester weight must be a number',
      'number.min': 'Mid semester weight must be between 0 and 100',
      'number.max': 'Mid semester weight must be between 0 and 100',
      'any.required': 'Mid semester weight is required',
    }),

    exam_weight: Joi.number().required().min(0).max(100).messages({
      'number.base': 'Exam weight must be a number',
      'number.min': 'Exam weight must be between 0 and 100',
      'number.max': 'Exam weight must be between 0 and 100',
      'any.required': 'Exam weight is required',
    }),

    credits: Joi.number().required().min(0).messages({
      'number.base': 'Credits must be a number',
      'number.min': 'Credits cannot be negative',
      'any.required': 'Credits are required',
    }),

    facilitator: Joi.string().allow(null, ''),

    prerequisites: Joi.array().items(Joi.string()).allow(null).messages({
      'array.base': 'Prerequisites must be an array of module IDs',
    }),

    is_prerequisite: Joi.boolean().default(false).messages({
      'boolean.base': 'Is prerequisite must be a boolean value',
    }),

    minimum_pass_grade: Joi.number().min(0).max(100).allow(null).messages({
      'number.min': 'Minimum pass grade must be between 0 and 100',
      'number.max': 'Minimum pass grade must be between 0 and 100',
    }),
  }).custom((value, helpers) => {
    const totalWeight =
      Number(value.assignment_weight) +
      Number(value.mid_semester_weight) +
      Number(value.exam_weight);

    if (totalWeight !== 100) {
      return helpers.message(
        `Assignment, mid-semester, and exam weights must sum to 100% (current total: ${totalWeight}%)`,
      );
    }
    return value;
  }, 'validate assessment weights'),

  update: Joi.object({
    module_name: Joi.string().trim(),
    module_code: Joi.string().trim(),
    parent_course: Joi.string(),
    year_level: Joi.number().min(1).max(4),
    faculty: Joi.string(),
    semester: Joi.string(),
    location: Joi.string().allow(null, ''),
    assignment_weight: Joi.number().min(0).max(100),
    supplement_weight: Joi.number().min(0).max(100).allow(null),
    mid_semester_weight: Joi.number().min(0).max(100),
    exam_weight: Joi.number().min(0).max(100),
    credits: Joi.number().min(0),
    facilitator: Joi.string().allow(null, ''),
    prerequisites: Joi.array().items(Joi.string()).allow(null),
    is_prerequisite: Joi.boolean(),
    minimum_pass_grade: Joi.number().min(0).max(100).allow(null),
  }).custom((value, helpers) => {
    // Only validate weights if any weight field is being updated
    const weightFields = [
      'assignment_weight',
      'mid_semester_weight',
      'exam_weight',
    ];
    const isUpdatingWeights = weightFields.some(
      (field) => value[field] !== undefined,
    );

    if (isUpdatingWeights) {
      const totalWeight =
        Number(value.assignment_weight || 0) +
        Number(value.mid_semester_weight || 0) +
        Number(value.exam_weight || 0);

      if (totalWeight !== 100) {
        return helpers.message(
          `Assignment, mid-semester, and exam weights must sum to 100% (current total: ${totalWeight}%)`,
        );
      }
    }
    return value;
  }, 'validate assessment weights'),

  assignLecturer: Joi.object({
    module_id: Joi.string().required().messages({
      'string.empty': 'Module ID is required',
      'any.required': 'Module ID is required',
    }),

    lecturer_id: Joi.string().required().messages({
      'string.empty': 'Lecturer ID is required',
      'any.required': 'Lecturer ID is required',
    }),

    level: Joi.string().allow(null, ''),
  }),
};

const validateModule = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.context.key,
      message: detail.message,
    }));

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

module.exports = {
  moduleSchema,
  validateModule,
};
