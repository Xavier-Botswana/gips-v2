const archiver = require('archiver');
const ResultSlipService = require('../services/ResultSlipService');
const pb = require('../utils/dbBase');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const HTTP_STATUS = require('../utils/httpStatus');

exports.generateResultSlipPDF = catchAsync(async (req, res) => {
  const { id, semester } = req.params;

  // Students typically have 6-10 modules per semester, 50 is more than enough
  const resultsList = await pb.collection('results').getList(1, 50, {
    filter: `studentId = "${id}" && semester = "${semester}"`,
    expand: 'studentId, moduleId, courseId, facultyId',
  });
  const results = resultsList.items;

  // Filter out results with status 'pending'
  const filteredResults = results.filter(r => r.status !== 'pending');

  if (!filteredResults || filteredResults.length === 0) {
    throw new AppError(
      'No non-pending results found for the student in this semester.',
      HTTP_STATUS.NOT_FOUND,
    );
  }

  const studentData = {
    firstname: filteredResults[0].expand.studentId.firstname,
    lastname: filteredResults[0].expand.studentId.lastname,
    studentNo: filteredResults[0].expand.studentId.studentNo,
    course_name: filteredResults[0].expand.courseId.course_name,
    study_mode: filteredResults[0].expand.studentId.study_mode,
    semester: semester,
    level: filteredResults[0].expand.courseId.type || 'DEGREE',
  };

  const formattedResults = ResultSlipService.formatResultData(filteredResults);

  const pdfBytes = await ResultSlipService.generateResultSlip(
    studentData,
    formattedResults,
  );

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename=result-slip-${id}-semester-${semester}.pdf`,
    'Content-Length': pdfBytes.length,
  });

  return res.send(Buffer.from(pdfBytes));
});

exports.generateBatchResultSlips = catchAsync(async (req, res) => {
  const { semester, courseId } = req.params;

  // Use pagination with a higher limit for batch processing
  const resultsList = await pb.collection('results').getList(1, 500, {
    filter: `semester = "${semester}" && courseId = "${courseId}"`,
    expand: 'studentId, moduleId, courseId, facultyId',
  });
  const results = resultsList.items;

  if (!results || results.length === 0) {
    throw new AppError(
      'No results found for this course and semester.',
      HTTP_STATUS.NOT_FOUND,
    );
  }

  // Group results by student
  const studentGroups = results.reduce((groups, result) => {
    const { studentId } = result;
    if (!groups[studentId]) {
      groups[studentId] = [];
    }
    groups[studentId].push(result);
    return groups;
  }, {});

  const pdfPromises = Object.entries(studentGroups).map(
    async ([studentId, studentResults]) => {
      const studentData = {
        firstname: studentResults[0].expand.studentId.firstname,
        lastname: studentResults[0].expand.studentId.lastname,
        tr_number: studentResults[0].expand.studentId.tr_number,
        course_name: studentResults[0].expand.courseId.course_name,
        study_mode: studentResults[0].expand.studentId.study_mode,
        semester: semester,
        level: studentResults[0].expand.courseId.type || 'DEGREE',
      };

      const formattedResults =
        ResultSlipService.formatResultData(studentResults);
      return await ResultSlipService.generateResultSlip(
        studentData,
        formattedResults,
      );
    },
  );

  const pdfs = await Promise.all(pdfPromises);

  const archive = archiver('zip', { zlib: { level: 9 } });

  res.set({
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename=result-slips-${courseId}-semester-${semester}.zip`,
  });

  archive.pipe(res);

  Object.keys(studentGroups).forEach((studentId, index) => {
    archive.append(Buffer.from(pdfs[index]), {
      name: `result-slip-${studentId}.pdf`,
    });
  });

  return archive.finalize();
});
