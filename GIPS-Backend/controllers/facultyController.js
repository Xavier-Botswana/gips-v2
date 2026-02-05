const HTTP_STATUS = require('../utils/httpStatus');
const pb = require('../utils/dbBase');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { safeGetOne } = require('../utils/dbHelpers');

const getAllFaculties = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const faculties = await pb.collection('faculties').getList(page, limit, {
    expand: 'facilitator',
  });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    currentPage: faculties.page,
    totalPages: faculties.totalPages,
    totalRecords: faculties.totalItems,
    data: faculties.items,
  });
});

const createFaculty = catchAsync(async (req, res) => {
  const { name, facilitator } = req.body;

  const faculty = await pb
    .collection('faculties')
    .create({ name, facilitator });

  res.status(HTTP_STATUS.CREATED).json(faculty);
});

const updateFaculty = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const faculty = await safeGetOne(pb, 'faculties', id);
  if (!faculty) {
    return next(new AppError('Faculty not found', 404));
  }
  const updatedFaculty = { ...faculty, ...req.body };

  const response = await pb
    .collection('faculties')
    .update(id, updatedFaculty);

  res.status(HTTP_STATUS.OK).json(response);
});

const getFacultyById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const faculty = await safeGetOne(pb, 'faculties', id, { expand: 'facilitator' });

  if (!faculty) {
    return next(new AppError('Faculty not found', 404));
  }

  res.status(HTTP_STATUS.OK).json(faculty);
});

// Note will not work if the faculty has courses
const deleteFaculty = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const faculty = await safeGetOne(pb, 'faculties', id);
  if (!faculty) {
    return next(new AppError('Faculty not found', 404));
  }

  const response = await pb.collection('faculties').delete(id);

  res.status(HTTP_STATUS.OK).json(response);
});

module.exports = {
  getAllFaculties,
  createFaculty,
  updateFaculty,
  getFacultyById,
  deleteFaculty,
};
