const axios = require('axios');
const pb = require('../utils/dbBase');

const catchAsync = require('../utils/catchAsync');
const { BASE_URL } = require('../utils/base');
const { safeGetFirst } = require('../utils/dbHelpers');
const { axiosConfig } = require('../middlewares/timeout');

exports.createLecturer = catchAsync(async (req, res, next) => {
  const { name, facultyId } = req.body;
  const config = {
    ...axiosConfig(),
    method: 'post',
    url: `${BASE_URL}/api/collections/lecturers/records`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      name,
      faculty_id: facultyId,
    },
  };

  await axios(config).then((response) => {
    res.status(200).json(response.data);
  });
});

exports.getLecturerByUserId = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  
  const lecturer = await safeGetFirst(pb, 'lecturers', `user_id = "${userId}"`);

  if (!lecturer) {
    return res.status(404).json({
      status: 'error',
      message: 'Lecturer not found for this user_id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: lecturer,
  });
});

exports.getLecturers = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const lecturers = await pb.collection('lecturers').getList(page, limit, {
    expand: 'parent_course',
    sort: '-created',
  });

  res.status(200).json({
    status: 'success',
    results: lecturers.items.length,
    currentPage: page,
    totalPages: lecturers.totalPages,
    totalRecords: lecturers.totalItems,
    data: lecturers.items,
  });
});

exports.getLecturer = catchAsync(async (req, res, next) => {
  const lecturerId = req.params.id;
  const config = {
    ...axiosConfig(),
    method: 'get',
    url: `${BASE_URL}/api/collections/lecturers/records/${lecturerId}`,
  };

  await axios(config).then((response) => {
    res.status(200).json(response.data);
  });
});

exports.updateLecturer = catchAsync(async (req, res, next) => {
  const lecturerId = req.params.id;

  const config = {
    ...axiosConfig(),
    method: 'patch',
    url: `${BASE_URL}/api/collections/lecturers/records/${lecturerId}`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: req.body,
  };

  await axios(config).then((response) => {
    res.status(200).json(response.data);
  });
});

exports.deleteLecturer = catchAsync(async (req, res, next) => {
  const lecturerId = req.params.id;
  const config = {
    ...axiosConfig(),
    method: 'delete',
    url: `${BASE_URL}/api/collections/lecturers/records/${lecturerId}`,
  };

  await axios(config).then((response) => {
    res.status(200).json(response.data);
  });
});
