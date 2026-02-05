const axios = require('axios');
const FormData = require('form-data');
const pb = require('../utils/dbBase');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const appLogger = require('../utils/appLogger');
const { BASE_URL } = require('../utils/base');
const { safeGetOne, withDbErrorHandling } = require('../utils/dbHelpers');
const HTTP_STATUS = require('../utils/httpStatus');

exports.getRegistration = catchAsync(async (req, res, next) => {
  const registrationId = req.params.id;

  const registration = await safeGetOne(pb, 'registration', registrationId, {
    expand: 'semester_id,course_id,student_id,guest_id',
  });

  if (!registration) {
    return next(new AppError('Registration not found', HTTP_STATUS.NOT_FOUND));
  }

  return res
    .status(HTTP_STATUS.OK)
    .json({ status: 'success', data: registration });
});

// exports.createRegistration = catchAsync(async (req, res, next) => {
//   const { files, body: formData } = req;

//   if (!files || !Array.isArray(files) || files.length === 0) {
//     return next(new AppError('No files were uploaded', 400));
//   }

//   if (!formData || Object.keys(formData).length === 0) {
//     return next(new AppError('No form data provided', 400));
//   }

//   try {
//     const data = { ...formData };

//     for (const file of files) {
//       if (!file.buffer || !file.originalname || !file.mimetype) {
//         throw new AppError('Invalid file data provided', 400);
//       }

//       const blob = new Blob([file.buffer], { type: file.mimetype });
//       data[file.fieldname] = blob;
//     }

//     console.log('Sending data to PocketBase:', {
//       ...data,
//       ...Object.fromEntries(
//         Object.entries(data)
//           .filter(([key]) => files.some((f) => f.fieldname === key))
//           .map(([key, value]) => [
//             key,
//             {
//               name: files.find((f) => f.fieldname === key)?.originalname,
//               type: files.find((f) => f.fieldname === key)?.mimetype,
//               size: value.size,
//             },
//           ]),
//       ),
//     });

//     const record = await pb.collection('registration').create(data);

//     res.status(HTTP_STATUS.CREATED).json({
//       status: 'success',
//       data: record,
//     });
//   } catch (error) {
//     console.error('Error details:', {
//       message: error.message,
//       data: error.data,
//       status: error.status,
//     });

//     if (error.status) {
//       return next(
//         new AppError(
//           error.message || 'Failed to create registration',
//           error.status,
//           {
//             originalError: error.data,
//             details: error.data,
//           },
//         ),
//       );
//     }

//     return next(
//       new AppError(error.message || 'Error creating registration', 500),
//     );
//   }
// });

exports.createRegistration = catchAsync(async (req, res, next) => {
  const { files, body: formData } = req;
  const isBatchUpload = formData?.batch_upload === 'true' || formData?.batch_upload === true || formData?.batch_upload ;

  // Only validate files if not a batch upload
  if (!isBatchUpload) {
    if (!files || !Array.isArray(files) || files.length === 0) {
      return next(new AppError('No files were uploaded', 400));
    }
  }

  if (!formData || Object.keys(formData).length === 0) {
    return next(new AppError('No form data provided', 400));
  }

  try {
    const data = { ...formData };

    // Only append files if not a batch upload
    if (!isBatchUpload && files && files.length > 0) {
      for (const file of files) {
        if (!file.buffer || !file.originalname || !file.mimetype) {
          throw new AppError('Invalid file data provided', HTTP_STATUS.BAD_REQUEST);
        }

        const blob = new Blob([file.buffer], { type: file.mimetype });
        data[file.fieldname] = blob;
      }
    }

    const record = await pb.collection('registration').create(data);

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      data: record,
    });
  } catch (error) {
    appLogger.warn('Registration create failed', {
      message: error.message,
      data: error.data,
      status: error.status,
    });

    if (error.status) {
      return next(
        new AppError(
          error.message || 'Failed to create registration',
          error.status,
          {
            originalError: error.data,
            details: error.data,
          },
        ),
      );
    }

    return next(
      new AppError(error.message || 'Error creating registration', 500),
    );
  }
});

exports.getRegistrations = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 500);
  const { status, courseId, search, sortBy, sortDir } = req.query;

  const filters = [];
  const escape = (val) => String(val).replace(/"/g, '\\"');

  if (status) filters.push(`reg_status = "${escape(status)}"`);
  if (courseId) filters.push(`course_id = "${escape(courseId)}"`);
  if (search) {
    const term = escape(search);
    filters.push(
      `prog_name ~ "${term}" || tr_number ~ "${term}" || names ~ "${term}" || surname ~ "${term}" || email ~ "${term}"`,
    );
  }

  const filter = filters.length ? filters.join(' && ') : undefined;

  const allowedSort = ['created', 'reg_status', 'prog_name'];
  const sortField = allowedSort.includes(sortBy) ? sortBy : 'created';
  const sortDirection = sortDir === 'asc' ? '' : '-';
  const sort = `${sortDirection}${sortField}`;

  const registrations = await pb
    .collection('registration')
    .getList(page, limit, {
      expand: 'semester_id, course_id',
      sort,
      filter,
    });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    results: registrations.items.length,
    currentPage: page,
    totalPages: registrations.totalPages,
    totalRecords: registrations.totalItems,
    data: registrations.items,
  });
});

exports.getMyRegistrations = catchAsync(async (req, res, next) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 500);
  const userEmail = req.user?.email;

  if (!userEmail) {
    return next(new AppError('User email not found', HTTP_STATUS.BAD_REQUEST));
  }

  const registrations = await pb.collection('registration').getList(page, limit, {
    expand: 'semester_id, course_id',
    filter: `email = "${userEmail}"`,
    sort: '-created',
  });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    results: registrations.items.length,
    currentPage: page,
    totalPages: registrations.totalPages,
    totalRecords: registrations.totalItems,
    data: registrations.items,
  });
});

exports.getStudentRegistration = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const registration = await safeGetOne(pb, 'registration', id, {
    expand: 'student_id',
  });

  if (!registration) {
    return next(new AppError('Registration not found', HTTP_STATUS.NOT_FOUND));
  }

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    data: registration,
  });
});

exports.updateRegistration = catchAsync(async (req, res, next) => {
  const registrationId = req.params.id;

  const existing = await safeGetOne(pb, 'registration', registrationId);
  if (!existing) {
    return next(new AppError('Registration not found', HTTP_STATUS.NOT_FOUND));
  }

  const updated = await pb.collection('registration').update(registrationId, {
    ...existing,
    ...req.body,
  });

  return res.status(HTTP_STATUS.OK).json({ status: 'success', data: updated });
});

exports.deleteRegistration = catchAsync(async (req, res, next) => {
  const registrationId = req.params.id;

  const existing = await safeGetOne(pb, 'registration', registrationId);
  if (!existing) {
    return next(new AppError('Registration not found', HTTP_STATUS.NOT_FOUND));
  }

  await pb.collection('registration').delete(registrationId);
  return res.status(HTTP_STATUS.NO_CONTENT).send();
});

exports.approveRegistration = catchAsync(async (req, res, next) => {
  const registrationId = req.params.id;
  const { studentData = {} } = req.body || {};

  const registration = await safeGetOne(pb, 'registration', registrationId, {
    expand: 'student_id,guest_id,course_id,semester_id',
  });

  if (!registration) {
    return next(new AppError('Registration not found', 404));
  }

  const pickFirst = (...vals) => vals.find((v) => v !== undefined && v !== null && String(v).trim() !== '');

  let studentId = registration.student_id;

  if (!studentId) {
    const userId = pickFirst(studentData.user_id, registration.user_id, registration.expand?.guest_id?.user_id);

    const payload = {
      user_id: userId,
      firstname: pickFirst(studentData.firstname, studentData.first_name, registration.firstname, registration.names),
      lastname: pickFirst(studentData.lastname, studentData.last_name, registration.lastname, registration.surname),
      national_id: pickFirst(
        studentData.national_id,
        registration.national_id,
        registration.idNumber,
        registration.expand?.guest_id?.national_id,
      ),
      tr_number: pickFirst(studentData.tr_number, registration.tr_number),
      phoneNumber: pickFirst(studentData.phoneNumber, studentData.phone_number, registration.phoneNumber, registration.tel_number),
      course_id: pickFirst(studentData.course_id, registration.course_id, registration.expand?.course_id?.id),
      semester_id: pickFirst(studentData.semester_id, registration.semester_id, registration.expand?.semester_id?.id),
      year_of_study: pickFirst(studentData.year_of_study, registration.year_of_study),
      reg_status: 'approved',
      dtef_status: 'approved',
    };

    if (!payload.user_id) {
      return next(new AppError('Unable to determine user_id for student creation', 400));
    }

    if (!payload.firstname || !payload.lastname) {
      return next(new AppError('Unable to determine student name for student creation', 400));
    }

    const clean = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== ''),
    );

    const createdStudent = await pb.collection('students').create(clean);
    studentId = createdStudent.id;

    // Promote user role to student
    await withDbErrorHandling(
      () => pb.collection('users').update(payload.user_id, { role: 'student' }),
      {
        operation: 'approveRegistration',
        entity: 'users',
        details: { userId: payload.user_id, action: 'promote_to_student' },
      },
      false
    );
  } else {
    // Ensure existing student is marked approved
    const yearOfStudy = pickFirst(studentData.year_of_study, registration.year_of_study);
    const updates = {
      dtef_status: 'approved',
      reg_status: 'approved',
    };
    if (yearOfStudy) updates.year_of_study = yearOfStudy;

    await withDbErrorHandling(
      () => pb.collection('students').update(studentId, updates),
      {
        operation: 'approveRegistration',
        entity: 'students',
        details: { studentId, updates },
      },
      false
    );
  }

  const updatedRegistration = await pb.collection('registration').update(registrationId, {
    reg_status: 'approved',
    dtef_status: 'approved',
    student_id: studentId,
  });

  return res.status(HTTP_STATUS.OK).json({
    status: 'success',
    data: {
      registration: updatedRegistration,
      studentId,
    },
  });
});

exports.getRegistrationsByTrNumber = catchAsync(async (req, res, next) => {
  const { trNumber } = req.params;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 200);

  if (!trNumber) {
    return next(new AppError('trNumber is required', 400));
  }

  const safeTr = String(trNumber).replace(/"/g, '\\"');

  // If a student is calling, ensure they only access their own TR number.
  if (String(req.user?.role) === 'student') {
    const student = await withDbErrorHandling(
      () => pb.collection('students').getFirstListItem(
        `user_id = "${String(req.user.id).replace(/"/g, '\\"')}"`,
        { fields: 'id,tr_number' }
      ),
      {
        operation: 'getRegistrationsByTrNumber',
        entity: 'students',
        details: { userId: req.user.id },
      },
      true
    );

    if (!student || String(student.tr_number) !== String(trNumber)) {
      return next(new AppError('Forbidden', 403));
    }
  }

  const registrations = await pb.collection('registration').getList(page, limit, {
    filter: `tr_number = "${safeTr}"`,
    expand: 'semester_id,course_id,student_id,guest_id',
    sort: '-created',
  });

  return res.status(HTTP_STATUS.OK).json({
    status: 'success',
    results: registrations.items.length,
    currentPage: page,
    totalPages: registrations.totalPages,
    totalRecords: registrations.totalItems,
    data: registrations.items,
  });
});

exports.updateMyRegistration = catchAsync(async (req, res, next) => {
  const registrationId = req.params.id;
  const userEmail = req.user?.email;

  if (!userEmail) {
    return next(new AppError('User email not found', 400));
  }

  const existing = await safeGetOne(pb, 'registration', registrationId);

  if (!existing) {
    return next(new AppError('Registration not found', 404));
  }

  if (String(existing.email || '').toLowerCase() !== String(userEmail).toLowerCase()) {
    return next(new AppError('Forbidden', 403));
  }

  const { files = [], body: formData } = req;
  const data = { ...existing, ...formData };

  for (const file of files) {
    if (!file.buffer || !file.mimetype) {
      return next(new AppError('Invalid file data provided', 400));
    }

    const blob = new Blob([file.buffer], { type: file.mimetype });
    data[file.fieldname] = blob;
  }

  const updated = await pb.collection('registration').update(registrationId, data);
  return res.status(HTTP_STATUS.OK).json({ status: 'success', data: updated });
});

exports.getRegistrationFileUrl = catchAsync(async (req, res, next) => {
  const { id, field } = req.params;

  const allowedFields = new Set(['copy_of_id', 'results_slip', 'sponsorship_letter']);
  if (!allowedFields.has(field)) {
    return next(new AppError('Invalid file field', 400));
  }

  const registration = await safeGetOne(pb, 'registration', id);
  if (!registration) {
    return next(new AppError('Registration not found', 404));
  }

  const role = req.user?.role;
  const selfRoles = new Set(['student', 'guest', 'guestUser', 'returningGuest']);

  if (selfRoles.has(role)) {
    const userEmail = req.user?.email;
    if (!userEmail) {
      return next(new AppError('Unauthorized', 401));
    }

    if (String(registration.email || '').toLowerCase() !== String(userEmail).toLowerCase()) {
      return next(new AppError('Forbidden', 403));
    }
  }

  const raw = registration[field];
  const filenames = Array.isArray(raw) ? raw : raw ? [raw] : [];

  if (!filenames.length) {
    return next(new AppError('File not available', 404));
  }

  const fileUrls = filenames.map(
    (filename) => `${BASE_URL}/api/files/${registration.collectionId}/${registration.id}/${filename}`,
  );

  return res.status(HTTP_STATUS.OK).json({
    status: 'success',
    data: {
      fileUrl: fileUrls[0],
      fileUrls,
    },
  });
});
