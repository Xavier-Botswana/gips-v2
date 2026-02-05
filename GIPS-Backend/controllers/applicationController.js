const { Blob } = require('buffer');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const ApplicationService = require('../services/ApplicationService');
const pb = require('../utils/dbBase');
const { BASE_URL } = require('../utils/base');
const { applicationSchema, validateApplication } = require('../validation/applicationSchema');
const { safeGetOne, withDbErrorHandling } = require('../utils/dbHelpers');
const HTTP_STATUS = require('../utils/httpStatus');

const ALLOWED_FIELDS = [
  'guest_id',
  'study_mode',
  'semester',
  'semester_id',
  'phoneNumber',
  'tel_number',
  'date_of_birth',
  'country',
  'option_one',
  'option_two',
  'option_three',
  'next_of_kin_name',
  'next_of_kin_number',
  'next_of_kin_address',
  'relationship',
  'points',
  'accommodation',
  'year_of_study',
  'sponsorship',
  'sponsorname',
  'sponsornumber',
  'sponsoraddress',
  'campus',
  'postqualification',
  'physical_address',
  'dtef_status',
  'status',
];

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB (aligned with multer)

const pickAllowedFields = (source = {}) =>
  Object.fromEntries(
    Object.entries(source).filter(([key]) => ALLOWED_FIELDS.includes(key)),
  );

const addFileToPayload = (payload, fieldname, blob) => {
  const existing = payload[fieldname];
  if (!existing) {
    payload[fieldname] = blob;
    return;
  }

  if (Array.isArray(existing)) {
    existing.push(blob);
    payload[fieldname] = existing;
    return;
  }

  payload[fieldname] = [existing, blob];
};

exports.validateCreate = validateApplication(applicationSchema.create);
exports.validateUpdate = validateApplication(applicationSchema.update);

exports.createApplication = catchAsync(async (req, res, next) => {
  const { files = [], body } = req;

  if (!files.length) {
    return next(new AppError('No files were uploaded', 400));
  }

  // Validate files
  for (const file of files) {
    if (!file.buffer || !file.originalname || !file.mimetype) {
      return next(new AppError('Invalid file data provided', 400));
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return next(
        new AppError(
          `File type not allowed: ${file.originalname} (${file.mimetype})`,
          400,
        ),
      );
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return next(
        new AppError(
          `File too large: ${file.originalname} (max 10MB)`,
          400,
        ),
      );
    }
  }

  const data = pickAllowedFields(body);

  for (const file of files) {
    const blob = new Blob([file.buffer], { type: file.mimetype });
    addFileToPayload(data, file.fieldname, blob);
  }

  const record = await ApplicationService.create(data);

  return res.status(HTTP_STATUS.CREATED).json({
    status: 'success',
    data: record,
  });
});

exports.getApplications = catchAsync(async (req, res, next) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const requestedLimit = parseInt(req.query.limit, 10) || 20;
  const limit = Math.min(Math.max(requestedLimit, 1), 100);

  const { status, courseId, semesterId, sortBy, sortDir } = req.query;
  const filters = [];

  const escape = (val) => String(val).replace(/"/g, '\\"');
  if (status) filters.push(`status = "${escape(status)}"`);
  if (courseId) filters.push(`option_one = "${escape(courseId)}"`);
  if (semesterId) filters.push(`semester_id = "${escape(semesterId)}"`);

  const { q } = req.query;
  if (q) {
    const term = escape(q);
    const searchClauses = [
      `guest_id.national_id ~ "${term}"`,
      `guest_id.firstname ~ "${term}"`,
      `guest_id.lastname ~ "${term}"`,
      `sponsorship ~ "${term}"`,
      `option_one.course_name ~ "${term}"`,
    ];
    filters.push(`(${searchClauses.join(' || ')})`);
  }

  const filterQuery = filters.length ? filters.join(' && ') : undefined;

  const allowedSortFields = ['created', 'status', 'year_of_study'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created';
  const sortDirection = sortDir === 'asc' ? '' : '-';
  const sort = `${sortDirection}${sortField}`;

  const applications = await ApplicationService.list(page, limit, filterQuery, sort);

  return res.status(HTTP_STATUS.OK).json({
    status: 'success',
    results: applications.items.length,
    currentPage: page,
    totalPages: applications.totalPages,
    totalRecords: applications.totalItems,
    data: applications.items,
  });
});

exports.getApplication = catchAsync(async (req, res, next) => {
  const applicationId = req.params.id;

  const application = await safeGetOne(pb, 'applications', applicationId, {
    expand: 'option_one,option_two,option_three,guest_id,semester_id',
  });

  if (!application) {
    return next(new AppError('Application not found', 404));
  }

  return res.status(HTTP_STATUS.OK).json({ status: 'success', data: application });
});

exports.getMyApplications = catchAsync(async (req, res, next) => {
  const userId = req.user ? req.user.id : null;
  if (!userId) {
    return next(new AppError('Unauthorized', 401));
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const requestedLimit = parseInt(req.query.limit, 10) || 20;
  const limit = Math.min(Math.max(requestedLimit, 1), 100);

  const filter = `guest_id.user_id = "${String(userId).replace(/"/g, '\\"')}"`;
  const applications = await ApplicationService.list(page, limit, filter, '-created');

  return res.status(HTTP_STATUS.OK).json({
    status: 'success',
    results: applications.items.length,
    currentPage: page,
    totalPages: applications.totalPages,
    totalRecords: applications.totalItems,
    data: applications.items,
  });
});

exports.getApplicationDetails = catchAsync(async (req, res, next) => {
  const applicationId = req.params.id;

  const application = await safeGetOne(pb, 'applications', applicationId, {
    expand: 'option_one,option_two,option_three,guest_id,semester_id',
  });

  if (!application) {
    return next(new AppError('Application not found', 404));
  }

  const guest = application.expand?.guest_id;
  const userId = guest?.user_id;

  let user = null;
  if (userId) {
    user = await safeGetOne(pb, 'users', userId);
  }

  return res.status(HTTP_STATUS.OK).json({
    status: 'success',
    data: {
      application,
      guest,
      user,
      combined: {
        ...(guest || {}),
        ...(user || {}),
        ...application,
      },
    },
  });
});

exports.updateMyApplicationFiles = catchAsync(async (req, res, next) => {
  const userId = req.user ? req.user.id : null;
  const applicationId = req.params.id;

  if (!userId) {
    return next(new AppError('Unauthorized', 401));
  }

  const { files = [], body = {} } = req;
  const bodyFields = pickAllowedFields(body);

  if (!files.length && !Object.keys(bodyFields).length) {
    return next(new AppError('No data provided', 400));
  }

  const allowedFields = new Set(['copy_of_id', 'results_slip', 'sponsorship_letter', 'ovc_letter']);

  const application = await safeGetOne(pb, 'applications', applicationId, {
    expand: 'option_one,option_two,option_three,guest_id,semester_id',
  });
  if (!application) {
    return next(new AppError('Application not found', 404));
  }

  const guest = application.expand?.guest_id;
  if (!guest || String(guest.user_id) !== String(userId)) {
    return next(new AppError('Forbidden', 403));
  }

  const payload = { ...bodyFields };
  for (const file of files) {
    if (!allowedFields.has(file.fieldname)) {
      continue;
    }

    if (!file.buffer || !file.mimetype) {
      return next(new AppError('Invalid file data provided', 400));
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return next(new AppError(`File type not allowed: ${file.originalname} (${file.mimetype})`, 400));
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return next(new AppError(`File too large: ${file.originalname} (max 10MB)`, 400));
    }

    const blob = new Blob([file.buffer], { type: file.mimetype });
    addFileToPayload(payload, file.fieldname, blob);
  }

  if (!Object.keys(payload).length) {
    return next(new AppError('No valid data provided', 400));
  }

  const updated = await ApplicationService.update(applicationId, {
    ...application,
    ...payload,
  });

  return res.status(HTTP_STATUS.OK).json({ status: 'success', data: updated });
});

exports.updateApplication = catchAsync(async (req, res, next) => {
  const applicationId = req.params.id;

  const existing = await safeGetOne(pb, 'applications', applicationId);

  if (!existing) {
    return next(new AppError('Application not found', 404));
  }

  const payload = pickAllowedFields(req.body);

  const updatedApplication = await ApplicationService.update(
    applicationId,
    {
      ...existing,
      ...payload,
    },
  );

  return res.status(HTTP_STATUS.OK).json({
    status: 'success',
    message: 'Application updated successfully',
    data: updatedApplication,
  });
});

exports.deleteApplication = catchAsync(async (req, res, next) => {
  const applicationId = req.params.id;

  const application = await safeGetOne(pb, 'applications', applicationId);
  if (!application) {
    return next(new AppError('Application not found', 404));
  }

  await ApplicationService.delete(applicationId);

  return res.status(HTTP_STATUS.NO_CONTENT).send();
});

exports.getApplicationsByUserId = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) {
    return next(new AppError('userId is required', 400));
  }

  const applications = await ApplicationService.list(
    1,
    1,
    `guest_id.user_id = "${String(userId).replace(/"/g, '\\"')}"`,
    '-created',
  );

  return res.status(HTTP_STATUS.OK).json({
    status: 'success',
    data: applications.items?.[0] || null,
  });
});

exports.updateApplicationFiles = catchAsync(async (req, res, next) => {
  const applicationId = req.params.id;
  const { files = [] } = req;

  if (!files.length) {
    return next(new AppError('No files were uploaded', 400));
  }

  const allowedFields = new Set(['copy_of_id', 'results_slip', 'sponsorship_letter', 'ovc_letter']);

  const application = await safeGetOne(pb, 'applications', applicationId, {
    expand: 'option_one,option_two,option_three,guest_id,semester_id',
  });
  if (!application) {
    return next(new AppError('Application not found', 404));
  }

  const payload = {};
  for (const file of files) {
    if (!allowedFields.has(file.fieldname)) {
      continue;
    }

    if (!file.buffer || !file.mimetype) {
      return next(new AppError('Invalid file data provided', 400));
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return next(new AppError(`File type not allowed: ${file.originalname} (${file.mimetype})`, 400));
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return next(new AppError(`File too large: ${file.originalname} (max 10MB)`, 400));
    }

    const blob = new Blob([file.buffer], { type: file.mimetype });
    addFileToPayload(payload, file.fieldname, blob);
  }

  if (!Object.keys(payload).length) {
    return next(new AppError('No valid file fields provided', 400));
  }

  const updated = await ApplicationService.update(applicationId, {
    ...application,
    ...payload,
  });

  return res.status(HTTP_STATUS.OK).json({ status: 'success', data: updated });
});

exports.getApplicationFileUrl = catchAsync(async (req, res, next) => {
  const { id, field } = req.params;

  const allowedFields = new Set(['copy_of_id', 'results_slip', 'sponsorship_letter', 'ovc_letter']);
  if (!allowedFields.has(field)) {
    return next(new AppError('Invalid file field', 400));
  }

  const application = await withDbErrorHandling(
    () => ApplicationService.getByIdExpanded(id),
    { operation: 'getApplicationById', entity: 'Application', details: { id } }
  );
  if (!application) {
    return next(new AppError('Application not found', 404));
  }

  const userId = req.user ? req.user.id : null;
  if (!userId) {
    return next(new AppError('Unauthorized', 401));
  }

  const role = req.user?.role;
  const guestRoles = new Set(['guest', 'guestUser', 'returningGuest', 'student']);

  if (guestRoles.has(role)) {
    const guest = application.expand?.guest_id;
    if (!guest || String(guest.user_id) !== String(userId)) {
      return next(new AppError('Forbidden', 403));
    }
  }

  const raw = application[field];
  const filenames = Array.isArray(raw) ? raw : raw ? [raw] : [];

  if (!filenames.length) {
    return next(new AppError('File not available', 404));
  }

  const fileUrls = filenames.map(
    (filename) => `${BASE_URL}/api/files/${application.collectionId}/${application.id}/${filename}`,
  );

  return res.status(HTTP_STATUS.OK).json({
    status: 'success',
    data: {
      fileUrl: fileUrls[0],
      fileUrls,
    },
  });
});
