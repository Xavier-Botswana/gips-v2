/* eslint-disable prettier/prettier */
const pb = require('../utils/dbBase');
const catchAsync = require('../utils/catchAsync');
const { safeGetFirst, safeGetOne } = require('../utils/dbHelpers');
const AppError = require('../utils/appError');

const { computeProgressionStatus } = require('../services/progressionService');

exports.createResult = catchAsync(async (req, res, next) => {
  const {
    studentId,
    courseId,
    facultyId,
    yearOfStudy,
    semester,
    moduleId,
    assignmentMark,
    midSemesterMark,
    supplementaryMark,
    examMark,
    moduleMark,
    nonCreditAssessments,
    lecturerId,
    batchId,
  } = req.body;

  // validation
  if (
    !studentId ||
    !courseId ||
    !facultyId ||
    !yearOfStudy ||
    !semester ||
    !moduleId ||
    // !assignmentMark ||
    // !midSemesterMark ||
    // !examMark ||
    !lecturerId
  ) {
    return next(new AppError('Missing required fields', 400));
  }

  // Check if a result already exists for this student and module, unless this is a supplementary mark
  const existingResult = await pb.collection('results').getList(1, 1, {
    filter: `studentId = "${studentId}" && moduleId = "${moduleId}" && semester = "${semester}"`,
  });

  if (existingResult.items.length > 0) {
    return next(
      new AppError(
        'Result already exists for this module in the current semester. You can only update existing results or add supplementary marks.',
        400,
      ),
    );
  }

  const result = await pb.collection('results').create({
    studentId,
    courseId,
    facultyId,
    yearOfStudy,
    semester,
    moduleId,
    assignmentMark: assignmentMark || null,
    midSemesterMark: midSemesterMark || null,
    supplementaryMark: supplementaryMark || null,
    examMark: examMark || null,
    moduleMark: moduleMark || null,
    nonCreditAssessments: nonCreditAssessments || null,
    lecturerId,
    status: 'pending',
    batchId: batchId || null,
  });

  // Recompute progression for this student/semester and persist
  const semesterResults = await pb.collection('results').getList(1, 50, {
    filter: `studentId = "${studentId}" && semester = "${semester}"`,
  });
  const computedProgression = computeProgressionStatus(semesterResults.items);
  await Promise.all(
    semesterResults.map((r) =>
      pb.collection('results').update(r.id, { progressionStatus: computedProgression }),
    ),
  );

  // include progression on the created result response
  result.progressionStatus = computedProgression;

  res.status(201).json({
    message: 'Result created successfully',
    result,
  });
});

exports.getBatchResults = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const batchResults = await pb
    .collection('batch_results')
    .getList(page, limit, {
      expand: 'semester,results,semesterId,moduleId,',
      sort: '-created',
    });

  res.status(200).json({
    status: 'success',
    results: batchResults.items.length,
    currentPage: page,
    totalPages: batchResults.totalPages,
    totalRecords: batchResults.totalItems,
    data: batchResults.items,
  });
});

exports.getBatchResultsByModuleId = catchAsync(async (req, res) => {
  const { moduleId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const batchResults = await pb
    .collection('batch_results')
    .getList(page, limit, {
      filter: `moduleId = "${moduleId}"`,
      expand: 'results,moduleId,lecturerId',
      sort: '-created',
    });

  res.status(200).json({
    status: 'success',
    results: batchResults.items.length,
    currentPage: page,
    totalPages: batchResults.totalPages,
    totalRecords: batchResults.totalItems,
    data: batchResults.items,
  });
});

exports.getBatchResultById = catchAsync(async (req, res) => {
  const { batchId } = req.params;
  if (!batchId) {
    return res.status(400).json({ message: 'batchId is required' });
  }

  try {
    const batch = await pb.collection('batch_results').getOne(batchId, {
      // Expand nested relations so the client can render without N+1 calls.
      // This mirrors what /v1/results and /v1/results/me return.
      expand:
        'semester,semesterId,moduleId,lecturerId,courseId,facultyId,results,results.studentId,results.moduleId,results.courseId,results.facultyId',
    });

    return res.status(200).json({
      status: 'success',
      data: batch,
    });
  } catch (error) {
    return res.status(404).json({ message: 'Batch not found' });
  }
});

// Get all results unfiltered
exports.recomputeProgression = catchAsync(async (req, res) => {
  const { studentId, semester } = req.body;
  if (!studentId || !semester) {
    return res.status(400).json({ message: 'studentId and semester are required' });
  }

  const semesterResults = await pb.collection('results').getList(1, 50, {
    filter: `studentId = "${studentId}" && semester = "${semester}"`,
  });

  if (!semesterResults.items.length) {
    return res.status(404).json({ message: 'No results found for student/semester' });
  }

  const computedProgression = computeProgressionStatus(semesterResults.items);
  await Promise.all(
    semesterResults.items.map((r) =>
      pb.collection('results').update(r.id, { progressionStatus: computedProgression }),
    ),
  );

  return res.status(200).json({ message: 'Progression recomputed', progressionStatus: computedProgression });
});

exports.getResults = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 500);
  const {
    studentId,
    courseId,
    facultyId,
    moduleId,
    semester,
    status,
    progressionStatus,
    search,
    sortBy,
    sortDir,
  } = req.query;

  const filters = [];
  const escape = (val) => String(val).replace(/"/g, '\\"');
  if (studentId) filters.push(`studentId = "${escape(studentId)}"`);
  if (courseId) filters.push(`courseId = "${escape(courseId)}"`);
  if (facultyId) filters.push(`facultyId = "${escape(facultyId)}"`);
  if (moduleId) filters.push(`moduleId = "${escape(moduleId)}"`);
  if (semester) filters.push(`semester = "${escape(semester)}"`);
  if (status) filters.push(`status = "${escape(status)}"`);
  if (progressionStatus) filters.push(`progressionStatus = "${escape(progressionStatus)}"`);
  if (search) {
    const term = escape(search);
    filters.push(
      `studentId ~ "${term}" || courseId ~ "${term}" || moduleId ~ "${term}" || progressionStatus ~ "${term}" || semester ~ "${term}"`,
    );
  }
  const filter = filters.length ? filters.join(' && ') : undefined;

  const allowedSort = ['created', 'progressionStatus', 'moduleMark'];
  const sortField = allowedSort.includes(sortBy) ? sortBy : 'created';
  const sortDirection = sortDir === 'asc' ? '' : '-';
  const sort = `${sortDirection}${sortField}`;

  const results = await pb.collection('results').getList(page, limit, {
    expand: 'studentId,moduleId,courseId,facultyId',
    sort,
    filter,
  });

  res.status(200).json({
    status: 'success',
    results: results.items.length,
    currentPage: page,
    totalPages: results.totalPages,
    totalRecords: results.totalItems,
    data: results.items,
  });
});

exports.getMyResults = catchAsync(async (req, res, next) => {
  const userId = req.user ? req.user.id : null;
  if (!userId) {
    return next(new AppError('Unauthorized', 401));
  }
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 500);

  const student = await safeGetFirst(
    pb,
    'students',
    `user_id = "${userId}"`,
    { expand: 'course_id, semester_id' },
  );

  if (!student) {
    return next(new AppError('Student not found', 404));
  }

  const results = await pb.collection('results').getList(page, limit, {
    filter: `studentId = "${student.id}"`,
    expand: 'studentId, moduleId, courseId, facultyId',
    sort: '-created',
  });

  res.status(200).json({
    data: {
      results: results.items,
      student,
    },
    currentPage: results.page,
    totalPages: results.totalPages,
    totalRecords: results.totalItems,
  });
});

exports.getResultsByStudentId = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 500);

  const student = await safeGetFirst(
    pb,
    'students',
    `user_id = "${userId}"`,
    { expand: 'course_id, semester_id' },
  );

  if (!student) {
    return next(new AppError('Student not found', 404));
  }

  const results = await pb.collection('results').getList(page, limit, {
    filter: `studentId = "${student.id}"`,
    expand: 'studentId, moduleId, courseId, facultyId',
    sort: '-created',
  });

  res.status(200).json({
    data: {
      results: results.items,
      student,
    },
    currentPage: results.page,
    totalPages: results.totalPages,
    totalRecords: results.totalItems,
  });
});

exports.getStudentResultsById = async (studentId, page = 1, limit = 50) => {
  try {
    const results = await pb.collection('results').getList(page, limit, {
      filter: `studentId = "${studentId}"`,
      expand: 'studentId, moduleId, courseId, facultyId',
    });
    return results.items;
  } catch (error) {
    throw new Error('Failed to retrieve results');
  }
};

// Get results by year of study
exports.getResultsByYearOfStudy = catchAsync(async (req, res) => {
  const { yearOfStudy } = req.params;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 500);
  const results = await pb.collection('results').getList(page, limit, {
    filter: `yearOfStudy = ${yearOfStudy}`,
    expand: 'studentId, moduleId, courseId, facultyId',
    sort: '-created',
  });
  res.status(200).json({
    data: results.items,
    currentPage: results.page,
    totalPages: results.totalPages,
    totalRecords: results.totalItems,
  });
});

// Get results by faculty ID
exports.getResultsByFacultyId = catchAsync(async (req, res) => {
  const { facultyId } = req.params;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 500);
  const results = await pb.collection('results').getList(page, limit, {
    filter: `facultyId = "${facultyId}"`,
    expand: 'studentId, moduleId, courseId',
    sort: '-created',
  });
  res.status(200).json({
    data: results.items,
    currentPage: results.page,
    totalPages: results.totalPages,
    totalRecords: results.totalItems,
  });
});

// Get results by course ID
exports.getResultsByCourseId = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 500);
  const results = await pb.collection('results').getList(page, limit, {
    filter: `courseId = "${courseId}"`,
    expand: 'studentId, moduleId, facultyId',
    sort: '-created',
  });
  res.status(200).json({
    data: results.items,
    currentPage: results.page,
    totalPages: results.totalPages,
    totalRecords: results.totalItems,
  });
});

/**** NEW SUBMIT BATCH**************************************************** */
exports.NewSubmitBatchResults = catchAsync(async (req, res, next) => {
  const {
    lecturerId,
    facultyId,
    courseId,
    results,
    year_level,
    semesterId,
    moduleId,
    status,
  } = req.body;

  // Input validation
  if (
    !lecturerId ||
    !facultyId ||
    !courseId ||
    !results ||
    !year_level ||
    !semesterId ||
    !moduleId ||
    !status ||
    results.length === 0
  ) {
    return next(new AppError('Missing required fields or no results provided.', 400));
  }

  // Check if a submission already exists
  const existingSubmissions = await pb
    .collection('batch_results')
    .getList(1, 1, {
      filter: `lecturerId = "${lecturerId}" && semesterId = "${semesterId}" && courseId = "${courseId}" && moduleId = "${moduleId}"`,
    });

  if (existingSubmissions.items.length > 0) {
    // Update existing submission
    const existingSubmission = existingSubmissions.items[0];
    const updatedResults = [...existingSubmission.results, ...results];

    const updatedSubmission = await pb
      .collection('batch_results')
      .update(existingSubmission.id, {
        results: updatedResults,
        status,
      });

    // Update all the results in the batch to have "pending" status
    await Promise.all(
      results.map((resultId) =>
        pb.collection('results').update(resultId, {
          status: 'pending',
        }),
      ),
    );

    return res.status(200).json({
      message: 'Results updated successfully',
      updatedSubmission,
    });
  }

  // Create new submission
  const newSubmission = await pb.collection('batch_results').create({
    lecturerId,
    facultyId,
    courseId,
    moduleId,
    results, // Array of result IDs
    submissionDate: new Date(),
    status: 'pending', // Batch status starts as 'pending'
    reviewMessage: '', // No message until reviewed by HOD
    year_level,
    semesterId,
  });

  return res.status(201).json({
    message: 'New submission created',
    newSubmission,
  });
});
/**** NEW SUBMIT BATCH**************************************************** */

// Controller function to submit batch results
exports.submitBatchResults = catchAsync(async (req, res, next) => {
  const {
    lecturerId,
    facultyId,
    courseId,
    results,
    year_level,
    semesterId,
    moduleId,
  } = req.body;

  // Input validation
  if (
    !lecturerId ||
    !facultyId ||
    !courseId ||
    !results ||
    !year_level ||
    !semesterId ||
    !moduleId ||
    results.length === 0
  ) {
    return next(new AppError('Missing required fields or no results provided.', 400));
  }

  // Check if lecturer exists
  const lecturer = await safeGetOne(pb, 'lecturers', lecturerId);
  if (!lecturer) {
    return next(new AppError('Lecturer not found', 404));
  }

  // Create batch in batch_results collection
  const batch = await pb.collection('batch_results').create({
    lecturerId,
    facultyId,
    courseId,
    moduleId,
    results, // Array of result IDs
    submissionDate: new Date(),
    status: 'pending', // Batch status starts as 'pending'
    reviewMessage: '', // No message until reviewed by HOD
    year_level,
    semesterId,
  });
  // Update all the results in the batch to have "pending" status
  await Promise.all(
    results.map((resultId) =>
      pb.collection('results').update(resultId, {
        status: 'pending',
      }),
    ),
  );

  res.status(201).json({
    message: 'Batch results submitted successfully for review',
    batch,
  });
});

// Update a student's result
exports.updateResult = catchAsync(async (req, res, next) => {
  const { resultId } = req.params;
  const updateFields = req.body;

  const existingResult = await safeGetOne(pb, 'results', resultId);

  if (!existingResult) {
    return next(new AppError('Result not found', 404));
  }

  const updatedResult = await pb
    .collection('results')
    .update(resultId, updateFields);

  const semesterResults = await pb.collection('results').getList(1, 50, {
    filter: `studentId = "${updatedResult.studentId}" && semester = "${updatedResult.semester}"`,
  });
  const computedProgression = computeProgressionStatus(semesterResults.items);
  await Promise.all(
    semesterResults.items.map((r) =>
      pb.collection('results').update(r.id, { progressionStatus: computedProgression }),
    ),
  );

  res.status(200).json({
    message: 'Result updated successfully',
    updatedResult: { ...updatedResult, progressionStatus: computedProgression },
  });
});

// Get all supplementary results
exports.getSupplementaryResults = catchAsync(async (req, res) => {
  const progressionStatus = 'Fail + Supplement';
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 500);

  const results = await pb.collection('results').getList(page, limit, {
    filter: `progressionStatus = "${progressionStatus}"`,
    expand: 'studentId,moduleId,courseId,facultyId',
  });

  res.status(200).json({
    status: 'success',
    results: results.items.length,
    currentPage: results.page,
    totalPages: results.totalPages,
    totalRecords: results.totalItems,
    data: results.items,
  });
});
