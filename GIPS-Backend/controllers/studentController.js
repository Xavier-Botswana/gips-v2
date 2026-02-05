const pb = require('../utils/dbBase');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const StudentService = require('../services/StudentService');

exports.createStudent = catchAsync(async (req, res, next) => {
  const { body } = req;

  if (!body || Object.keys(body).length === 0) {
    return next(new AppError('No data provided', 400));
  }

  const record = await StudentService.create(body);

  return res.status(201).json({
    status: 'success',
    data: record,
  });
});

exports.getStudents = catchAsync(async (req, res, next) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const requestedLimit = parseInt(req.query.limit, 10) || 20;
  const limit = Math.min(Math.max(requestedLimit, 1), 500);

  const { courseId, courseIds, yearLevel, withholdResults, search, sortBy, sortDir } = req.query;
  const filters = [];
  const escape = (val) => String(val).replace(/"/g, '\\"');

  if (courseId) {
    filters.push(`course_id = "${escape(courseId)}"`);
  }

  if (courseIds) {
    const ids = String(courseIds)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (ids.length) {
      const or = ids.map((id) => `course_id = "${escape(id)}"`).join(' || ');
      filters.push(`(${or})`);
    }
  }

  if (yearLevel) {
    const lvl = String(yearLevel).trim();
    // Year strings in PB are typically "Year 1", "Year 2", etc.
    filters.push(`year_of_study = "Year ${escape(lvl)}"`);
  }

  if (withholdResults !== undefined) {
    const flag = String(withholdResults).toLowerCase();
    if (['true', '1', 'yes'].includes(flag)) filters.push('withhold_results = true');
    if (['false', '0', 'no'].includes(flag)) filters.push('withhold_results = false');
  }

  if (search) {
    const term = escape(search);
    filters.push(
      `national_id ~ "${term}" || firstname ~ "${term}" || lastname ~ "${term}" || tr_number ~ "${term}" || studentNo ~ "${term}"`,
    );
  }

  const filter = filters.length ? filters.join(' && ') : undefined;

  const allowedSort = ['created', 'firstname', 'lastname', 'tr_number', 'year_of_study'];
  const sortField = allowedSort.includes(sortBy) ? sortBy : 'created';
  const sortDirection = sortDir === 'asc' ? '' : '-';
  const sort = `${sortDirection}${sortField}`;

  const students = await StudentService.list(page, limit, filter, sort);

  return res.status(200).json({
    status: 'success',
    results: students.items.length,
    currentPage: page,
    totalPages: students.totalPages,
    totalRecords: students.totalItems,
    data: students.items,
  });
});

exports.getMyStudent = catchAsync(async (req, res, next) => {
  const userId = req.user ? req.user.id : null;
  if (!userId) {
    return next(new AppError('Unauthorized', 401));
  }

  const student = await StudentService.getByUserId(userId);
  if (!student) {
    return next(new AppError('Student not found', 404));
  }

  return res.status(200).json({ status: 'success', data: student });
});

exports.getStudentByUserId = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) {
    return next(new AppError('userId is required', 400));
  }

  const student = await StudentService.getByUserId(userId);
  if (!student) {
    return next(new AppError('Student not found', 404));
  }

  return res.status(200).json({ status: 'success', data: student });
});

exports.getAllStudents = catchAsync(async (req, res, next) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 200);
  const filter = req.query.filter || '';

  const result = await StudentService.list(page, limit, filter);

  return res.status(200).json({
    status: 'success',
    currentPage: result.page,
    totalPages: result.totalPages,
    totalRecords: result.totalItems,
    results: result.items.length,
    data: result.items,
  });
});

exports.getStudent = catchAsync(async (req, res, next) => {
  const studentId = req.params.id;

  const student = await StudentService.getById(studentId);

  if (!student) {
    return next(new AppError('Student not found', 404));
  }

  return res.status(200).json({ status: 'success', data: student });
});

exports.updateStudent = catchAsync(async (req, res, next) => {
  const studentId = req.params.id;

  const existing = await StudentService.getById(studentId);

  if (!existing) {
    return next(new AppError('Student not found', 404));
  }

  const updated = await StudentService.update(studentId, {
    ...existing,
    ...req.body,
  });

  return res.status(200).json({
    status: 'success',
    message: 'Student updated successfully',
    data: updated,
  });
});

exports.deleteStudent = catchAsync(async (req, res, next) => {
  const studentId = req.params.id;

  const student = await StudentService.getById(studentId);
  if (!student) {
    return next(new AppError('Student not found', 404));
  }

  await StudentService.delete(studentId);

  return res.status(200).json({ status: 'success', message: 'Student deleted' });
});
