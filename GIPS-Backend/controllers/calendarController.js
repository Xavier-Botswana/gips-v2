const pb = require('../utils/dbBase');
const { calendarEventSchema } = require('../helpers/validation_schema');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllEvents = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  // Build filter for date range if provided
  const filters = [];
  if (startDate) {
    filters.push(`event_date >= "${startDate}"`);
  }
  if (endDate) {
    filters.push(`event_date <= "${endDate}"`);
  }
  const filter = filters.length > 0 ? filters.join(' && ') : '';

  const calendarEvents = await pb.collection('Calendar_Events').getList(page, limit, {
    ...(filter ? { filter } : {}),
    sort: '-event_date',
  });

  res.status(200).json({
    status: 'success',
    results: calendarEvents.items.length,
    currentPage: calendarEvents.page,
    totalPages: calendarEvents.totalPages,
    totalRecords: calendarEvents.totalItems,
    events: calendarEvents.items,
  });
});

exports.createEvent = catchAsync(async (req, res, next) => {
  const { error } = calendarEventSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const newEvent = await pb.collection('Calendar_Events').create(req.body);
  res.status(201).json(newEvent);
});

exports.getEventById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  try {
    const event = await pb.collection('Calendar_Events').getOne(id);

    if (!event) {
      return next(new AppError('Calendar Event not found', 404));
    }

    res.status(200).json(event);
  } catch (error) {
    if (error.status === 404 || error.response?.code === 404) {
      return next(new AppError('Calendar Event not found', 404)); // Return 404 for resource not found
    }
    next(error); // For all other errors, pass to the global error handler
  }
});

exports.updateEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { error, value } = calendarEventSchema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const updatedEvent = await pb.collection('Calendar_Events').update(id, value);
  res.status(200).json(updatedEvent);
});

exports.deleteEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await pb.collection('Calendar_Events').delete(id);
  res.status(204).send();
});
