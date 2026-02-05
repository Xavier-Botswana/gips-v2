const Joi = require('joi');

exports.calendarEventSchema = Joi.object({
  title: Joi.string().required(),
  eventType: Joi.string()
    .valid('lecture', 'exam', 'meeting', 'holiday', 'deadline')
    .required(),
  start: Joi.date().required(),
  end: Joi.date().required(),
  location: Joi.string().optional(),
  organizerId: Joi.string().required(),
  participants: Joi.string()
    .valid('All', 'All Staff', 'Academics', 'Admissions', 'Students')
    .required(),
  isRecurring: Joi.boolean().optional(),
  recurrencePattern: Joi.object().optional(),
  description: Joi.string().optional(),
  textColor: Joi.string().required(),
});

exports.resultSchema = Joi.object({
  studentId: Joi.string().required(),
  courseId: Joi.string().required(),
  facultyId: Joi.string().required(),
  yearOfStudy: Joi.number().required(),
  semester: Joi.string().valid('1', '2').required(),
  moduleId: Joi.string().required(),
  assignmentMark: Joi.number().min(0).max(100).required(),
  midSemesterMark: Joi.number().min(0).max(100).required(),
  supplementaryMark: Joi.number().min(0).max(100).optional(),
  examMark: Joi.number().min(0).max(100).required(),
  moduleMark: Joi.number().min(0).max(100).optional(),
  nonCreditAssessments: Joi.number().optional(),
  lecturerId: Joi.string().required(),
  batchId: Joi.string().optional(),
});

exports.notificationSchema = Joi.object({
  communicationTopic: Joi.string().required(),
  messageDescription: Joi.string().required(),
  communicationChannel: Joi.string().required(),
  audience: Joi.string().required(),
  date: Joi.date().required(),
});

exports.updateNotificationSchema = Joi.object({
  communicationTopic: Joi.string().optional(),
  messageDescription: Joi.string().optional(),
  communicationChannel: Joi.string().optional(),
  audience: Joi.string().optional(),
  date: Joi.date().optional(),
});

exports.courseSchema = Joi.object({
  course_code: Joi.string().required(),
  course_name: Joi.string().required(),
  duration: Joi.string().required(),
  level: Joi.string().required(),
  type: Joi.string()
    .valid('Diploma', 'Advanced Diploma', 'Bachelor Degree')
    .optional(),
  faculty: Joi.string().required(),
  centre_location: Joi.string()
    .valid('Gaborone', 'Francistown', 'Maun', 'All')
    .optional(),
  sponsorship_options: Joi.string()
    .valid(
      'Government Regular',
      'Government Reinstatement',
      'Private Sponsorship',
      'All',
    )
    .optional(),
  total_credits: Joi.number().required(),
  facilitator: Joi.string().optional(),
});
