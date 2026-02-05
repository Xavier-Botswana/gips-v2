const pb = require('../utils/dbBase');
const { courseSchema } = require('../helpers/validation_schema');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { safeGetOne } = require('../utils/dbHelpers');

exports.createCourse = catchAsync(async (req, res, next) => {
  const { error, value } = courseSchema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const course = await pb.collection('courses').create(value);

  res.status(201).json({
    message: 'Course created successfully',
    course,
  });
});

exports.getAllCourses = catchAsync(async (req, res, next) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const perPage = Math.min(Math.max(parseInt(req.query.perPage, 10) || 10, 1), 100);
  const { facultyId, search, sortBy, sortDir } = req.query;

  const filters = [];
  const escape = (val) => String(val).replace(/"/g, '\\"');
  if (facultyId) filters.push(`faculty = "${escape(facultyId)}"`);
  if (search) {
    const term = escape(search);
    filters.push(
      `course_code ~ "${term}" || course_name ~ "${term}" || facilitator ~ "${term}" || id ~ "${term}"`,
    );
  }
  const filter = filters.length ? filters.join(' && ') : undefined;

  const allowedSort = ['created', 'course_name', 'course_code', 'duration'];
  const sortField = allowedSort.includes(sortBy) ? sortBy : 'created';
  const sortDirection = sortDir === 'asc' ? '' : '-';
  const sort = `${sortDirection}${sortField}`;

  const courses = await pb.collection('courses').getList(page, perPage, {
    expand: 'faculty',
    filter,
    sort,
  });

  res.status(200).json({
    message: 'Courses retrieved successfully',
    totalItems: courses.totalItems,
    totalPages: courses.totalPages,
    currentPage: courses.page,
    perPage: courses.perPage,
    courses: courses.items,
  });
});

exports.getCourse = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const course = await safeGetOne(pb, 'courses', id, { expand: 'faculty' });

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  res.status(200).json(course);
});

exports.updateCourse = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { error, value } = courseSchema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const course = await safeGetOne(pb, 'courses', id);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  const updatedCourse = await pb.collection('courses').update(id, value);

  res.status(200).json({
    message: 'Course updated successfully',
    updatedCourse,
  });
});

exports.deleteCourse = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const course = await safeGetOne(pb, 'courses', id);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  await pb.collection('courses').delete(id);
  res.status(204).send();
});

exports.getCoursesByFacultyId = catchAsync(async (req, res, next) => {
  const { faculty_id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;

  const courses = await pb.collection('courses').getList(page, perPage, {
    filter: `faculty = "${faculty_id}"`,
  });

  res.status(200).json({
    message: 'Courses retrieved successfully',
    totalItems: courses.totalItems,
    totalPages: courses.totalPages,
    currentPage: courses.page,
    perPage: courses.perPage,
    courses: courses.items,
  });
});
