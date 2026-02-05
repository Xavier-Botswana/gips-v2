const HTTP_STATUS = require('../utils/httpStatus');
const pb = require('../utils/dbBase');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { BASE_URL } = require('../utils/base');
const { safeGetFirst, safeGetOne } = require('../utils/dbHelpers');

const ALLOWED_MIME_TYPES = ['application/pdf'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

exports.getAdmissionLetterByCourseId = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  if (!courseId) {
    return next(new AppError('courseId is required', 400));
  }

  const safeCourseId = String(courseId).replace(/"/g, '\\"');

  const letter = await safeGetFirst(pb, 'Admission_Letters', `course_id = "${safeCourseId}"`);

  if (!letter) {
    return next(new AppError('Admission letter template not found', 404));
  }

  const fileUrl = letter.file
    ? `${BASE_URL}/api/files/${letter.collectionId}/${letter.id}/${letter.file}`
    : null;

  return res.status(HTTP_STATUS.OK).json({
    status: 'success',
    data: {
      letter,
      fileUrl,
    },
  });
});

exports.createAdmissionLetter = catchAsync(async (req, res, next) => {
  const { file } = req;
  const { course_id: courseId, courseName } = req.body || {};

  if (!courseId) {
    return next(new AppError('course_id is required', 400));
  }

  if (!file || !file.buffer || !file.mimetype) {
    return next(new AppError('Admission letter PDF file is required', 400));
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return next(new AppError('Only PDF admission letter templates are allowed', 400));
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return next(new AppError('File too large (max 10MB)', 400));
  }

  const blob = new Blob([file.buffer], { type: file.mimetype });

  const created = await pb.collection('Admission_Letters').create({
    course_id: courseId,
    courseName: courseName || '',
    file: blob,
  });

  return res.status(HTTP_STATUS.CREATED).json({ status: 'success', data: created });
});

exports.updateAdmissionLetter = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { file } = req;
  const { course_id: courseId, courseName } = req.body || {};

  const existing = await safeGetOne(pb, 'Admission_Letters', id);
  if (!existing) {
    return next(new AppError('Admission letter template not found', 404));
  }

  const payload = {
    ...existing,
    ...(courseId ? { course_id: courseId } : {}),
    ...(courseName ? { courseName } : {}),
  };

  if (file && file.buffer) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return next(new AppError('Only PDF admission letter templates are allowed', 400));
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return next(new AppError('File too large (max 10MB)', 400));
    }

    const blob = new Blob([file.buffer], { type: file.mimetype });
    payload.file = blob;
  }

  const updated = await pb.collection('Admission_Letters').update(id, payload);
  return res.status(HTTP_STATUS.OK).json({ status: 'success', data: updated });
});
