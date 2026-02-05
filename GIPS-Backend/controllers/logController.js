const HTTP_STATUS = require('../utils/httpStatus');
const pb = require('../utils/dbBase');
const catchAsync = require('../utils/catchAsync');

exports.getLogs = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const perPage = parseInt(req.query.perPage, 10) || 10;
  const logs = await pb
    .collection('system_logs')
    .getList(page, perPage, { sort: '-created' });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    results: logs.items.length,
    currentPage: page,
    totalPages: logs.totalPages,
    totalRecords: logs.totalItems,
    logs: logs.items,
  });
});
