const TranscriptService = require('../services/TranscriptService');
const pb = require('../utils/dbBase');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const HTTP_STATUS = require('../utils/httpStatus');

exports.generateTranscriptPDF = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Fetch student results - use high limit for complete transcript
  const resultsList = await pb.collection('results').getList(1, 200, {
    filter: `studentId = "${id}"`,
    expand: 'studentId, moduleId, courseId, facultyId',
  });
  const results = resultsList.items;

  if (!results || results.length === 0) {
    throw new AppError('No results found for the student.', HTTP_STATUS.NOT_FOUND);
  }

  // Extract student data from the first result
  const studentData = {
    firstname: results[0].expand.studentId.firstname,
    lastname: results[0].expand.studentId.lastname,
    date_of_birth: results[0].expand.studentId.date_of_birth,
    tr_number: results[0].expand.studentId.tr_number,
    course_name: results[0].expand.courseId.course_name,
    study_mode: results[0].expand.studentId.study_mode,
  };

  // Format module data
  const formattedResults = TranscriptService.formatModuleData(results);

  // Generate PDF
  const pdfBytes = await TranscriptService.generateTranscript(
    studentData,
    formattedResults,
  );

  // Send response
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename=transcript-${id}.pdf`,
    'Content-Length': pdfBytes.length,
  });

  return res.send(Buffer.from(pdfBytes));
});
