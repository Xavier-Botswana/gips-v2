const pb = require('../utils/dbBase');
const catchAsync = require('../utils/catchAsync');

// User Management

// start new academic year
exports.startAcademicYear = catchAsync(async (req, res) => {
  const { year, description } = req.body;
  const academicYear = await pb.collection('academicYears').create({
    year,
    description,
  });
  res
    .status(201)
    .json({ message: 'Academic year started successfully', academicYear });
});

// Start a semester in an academic year
exports.startSemester = catchAsync(async (req, res) => {
  const { semesterName, academicYearId, startDate, endDate } = req.body;
  const semester = await pb.collection('semesters').create({
    semesterName,
    academicYearId,
    startDate,
    endDate,
  });
  res
    .status(201)
    .json({ message: 'Semester started successfully', semester });
});

// System Logs Management

// View system logs
exports.viewSystemLogs = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const logs = await pb.collection('systemLogs').getList(page, limit);
  res.status(200).json({
    status: 'success',
    currentPage: logs.page,
    totalPages: logs.totalPages,
    totalRecords: logs.totalItems,
    logs: logs.items,
  });
});

// Add a lecturer
exports.addLecturer = catchAsync(async (req, res) => {
  const { name, email, departmentId } = req.body;
  const lecturer = await pb.collection('lecturers').create({
    name,
    email,
    departmentId,
  });
  res.status(201).json({ message: 'Lecturer added successfully', lecturer });
});

// Add an HOD
exports.addHOD = catchAsync(async (req, res) => {
  const { name, email, facultyId } = req.body;
  const hod = await pb.collection('hods').create({
    name,
    email,
    facultyId,
  });
  res.status(201).json({ message: 'HOD added successfully', hod });
});
