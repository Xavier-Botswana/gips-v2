const pb = require('../utils/dbBase');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const UserService = require('../services/UserService');
const { safeGetFirst } = require('../utils/dbHelpers');
const HTTP_STATUS = require('../utils/httpStatus');

exports.createUser = catchAsync(async (req, res, next) => {
  const { name, email, role, faculty_id, department, phone_number, password, passwordConfirm } = req.body;

  const user = await UserService.create({
    name,
    email,
    role,
    faculty_id,
    department,
    password,
    passwordConfirm,
    emailVisibility: true,
    phone_number,
  });

  if (user && role === 'lecturer') {
    const record = await pb.collection('lecturers').create({
      name,
      user_id: user.id,
      faculty_id,
    });

    if (!record) {
      return next(new AppError('Failed to create lecturer', HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }

  if (user && role === 'hod') {
    const record = await pb.collection('hods').create({
      name,
      user_id: user.id,
      faculty_id,
    });

    if (!record) {
      return next(new AppError('Failed to create HOD', HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  }

  return res.status(HTTP_STATUS.CREATED).json({ message: 'User created successfully', user });
});

exports.getAllUsers = catchAsync(async (_req, res) => {
  const users = await UserService.list();
  return res.status(HTTP_STATUS.OK).json({ users });
});

exports.getMe = catchAsync(async (req, res) => {
  return res.status(HTTP_STATUS.OK).json({ status: 'success', data: req.user });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await UserService.getById(id);

  if (!user) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  return res.status(HTTP_STATUS.OK).json(user);
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const existing = await UserService.getById(id);
  if (!existing) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }
  const updatedUser = { ...existing, ...req.body };
  const response = await UserService.update(id, updatedUser);
  return res
    .status(HTTP_STATUS.OK)
    .json({ message: 'User updated successfully', user: response });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await UserService.getById(id);

  if (!user) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  const { role } = user;

  let collectionName = null;

  if (role === 'hod') {
    collectionName = 'hods';
  } else if (role === 'lecturer') {
    collectionName = 'lecturers';
  } else if (role === 'student') {
    collectionName = 'students';
  }

  if (collectionName) {
    const record = await safeGetFirst(
      pb,
      collectionName,
      `user_id = "${id}"`,
      { $autoCancel: false }
    );

    if (record) {
      await pb.collection(collectionName).delete(record.id);
    }
  }

  await UserService.delete(id);

  return res.status(HTTP_STATUS.OK).json({ message: 'User and associated record deleted successfully' });
});
