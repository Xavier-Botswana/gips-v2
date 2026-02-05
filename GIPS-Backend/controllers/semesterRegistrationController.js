const HTTP_STATUS = require('../utils/httpStatus');
const pb = require('../utils/dbBase');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { withDbErrorHandling } = require('../utils/dbHelpers');

const escape = (val) => String(val).replace(/"/g, '\\"');

const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

exports.getAvailableModules = catchAsync(async (req, res, next) => {
  const { studyYear, semesterId, courseId } = req.params;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);

  if (!studyYear || !semesterId || !courseId) {
    return next(new AppError('studyYear, semesterId and courseId are required', 400));
  }

  const filter = `course = "${escape(courseId)}" && semester = "${escape(semesterId)}" && year_of_study = "${escape(studyYear)}"`;

  const courseSemesterModules = await withDbErrorHandling(
    () => pb.collection('course_semester_modules').getList(1, 50, { filter, fields: 'modules' }),
    {
      operation: 'getAvailableModules',
      entity: 'course_semester_modules',
      details: { filter },
    },
    false // Don't allow null on 404, throw error instead
  );

  const moduleIds = [];
  for (const item of courseSemesterModules.items) {
    if (Array.isArray(item.modules)) {
      moduleIds.push(...item.modules);
    }
  }

  const uniqueIds = [...new Set(moduleIds)].filter(Boolean);
  if (!uniqueIds.length) {
    return res.status(HTTP_STATUS.OK).json({
      status: 'success',
      currentPage: 1,
      totalPages: 0,
      totalRecords: 0,
      data: []
    });
  }

  const chunks = chunkArray(uniqueIds, 50);
  const modules = [];

  for (const chunk of chunks) {
    const chunkFilter = `id ?= "${chunk.map((id) => escape(id)).join('" || id ?= "')}"`;
    // eslint-disable-next-line no-await-in-loop
    const fetched = await withDbErrorHandling(
      () => pb.collection('modules').getList(1, 50, { filter: chunkFilter, sort: 'module_code' }),
      {
        operation: 'getAvailableModules',
        entity: 'modules',
        details: { chunkFilter },
      },
      false
    );

    modules.push(...fetched.items);
  }

  // Apply pagination to the aggregated results
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedModules = modules.slice(startIndex, endIndex);
  const totalPages = Math.ceil(modules.length / limit);

  return res.status(HTTP_STATUS.OK).json({
    status: 'success',
    currentPage: page,
    totalPages,
    totalRecords: modules.length,
    data: paginatedModules
  });
});
