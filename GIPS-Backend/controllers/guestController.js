const HTTP_STATUS = require('../utils/httpStatus');
const pb = require('../utils/dbBase');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { safeGetOne } = require('../utils/dbHelpers');

exports.getGuests = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const guests = await pb
    .collection('guests')
    .getList(page, limit, {
      expand: 'user_id',
      sort: '-created',
    });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    results: guests.items.length,
    currentPage: page,
    totalPages: guests.totalPages,
    totalRecords: guests.totalItems,
    data: guests.items,
  });
});

exports.getGuest = catchAsync(async (req, res, next) => {
  const guestId = req.params.id;
  const guest = await safeGetOne(pb, 'guests', guestId);
  if (!guest) {
    return next(new AppError('Guest not found', 404));
  }
  res.status(HTTP_STATUS.OK).json(guest);
});

exports.createGuest = catchAsync(async (req, res, next) => {
  const guestData = req.body;
  const guest = await pb.collection('guests').create(guestData);
  res.status(HTTP_STATUS.CREATED).json(guest);
});

exports.updateGuest = catchAsync(async (req, res, next) => {
  const guestId = req.params.id;
  const guestData = req.body;
  const guest = await safeGetOne(pb, 'guests', guestId);
  if (!guest) {
    return next(new AppError('Guest not found', 404));
  }
  const updatedGuest = await pb
    .collection('guests')
    .update(guestId, guestData);
  res.status(HTTP_STATUS.OK).json(updatedGuest);
});

exports.deleteGuest = catchAsync(async (req, res, next) => {
  const guestId = req.params.id;
  const guest = await safeGetOne(pb, 'guests', guestId);
  if (!guest) {
    return next(new AppError('Guest not found', 404));
  }
  await pb.collection('guests').delete(guestId);
  res.status(HTTP_STATUS.NO_CONTENT).send();
});
