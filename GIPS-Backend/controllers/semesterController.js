const axios = require('axios');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const pb = require('../utils/dbBase');
const { BASE_URL } = require('../utils/base');
const { withDbErrorHandling } = require('../utils/dbHelpers');
const { axiosConfig } = require('../middlewares/timeout');

exports.getAllSemesters = catchAsync(async (req, res, next) => {
  const config = {
    ...axiosConfig(),
    method: 'get',
    url: `${BASE_URL}/api/collections/semesters/records`,
  };

  await axios(config).then((response) => {
    res.status(200).json(response.data.items);
  });
});

exports.getSemester = catchAsync(async (req, res, next) => {
  const semesterId = req.params.id;

  const config = {
    ...axiosConfig(),
    method: 'get',
    url: `${BASE_URL}/api/collections/semesters/records/${semesterId}`,
  };

  await axios(config).then((response) => {
    res.status(200).json(response.data);
  });
});

exports.createSemester = catchAsync(async (req, res, next) => {
  const config = {
    ...axiosConfig(),
    method: 'post',
    url: `${BASE_URL}/api/collections/semesters/records`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: req.body,
  };

  await axios(config).then((response) => {
    res.status(201).json(response.data);
  });
});

exports.updateSemester = catchAsync(async (req, res, next) => {
  const semesterId = req.params.id;

  const config = {
    ...axiosConfig(),
    method: 'patch',
    url: `${BASE_URL}/api/collections/semesters/records/${semesterId}`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: req.body,
  };

  await axios(config).then((response) => {
    res.status(200).json(response.data);
  });
});

const getYearRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${start.getFullYear()}-${end.getFullYear()}`;
};

const parseYearOfStudyNumber = (yearOfStudy) => {
  const match = String(yearOfStudy || '').match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
};

exports.rolloverSemester = catchAsync(async (req, res, next) => {
  const { activeStudySemester, startDate, endDate } = req.body;

  const activeSemesterNum = parseInt(activeStudySemester, 10);
  if (![1, 2].includes(activeSemesterNum)) {
    return next(new AppError('activeStudySemester must be 1 or 2', 400));
  }
  if (!startDate || !endDate) {
    return next(new AppError('startDate and endDate are required', 400));
  }

  const yearRange = getYearRange(startDate, endDate);

  // Deactivate currently active semesters (typically a small set)
  const activeSemesters = await withDbErrorHandling(
    () => pb.collection('semesters').getList(1, 10, { filter: 'active = true', fields: 'id' }),
    {
      operation: 'rolloverSemester',
      entity: 'semesters',
      details: { filter: 'active = true' },
    },
    true // Allow empty result if no active semesters
  );

  for (const sem of activeSemesters.items) {
    // eslint-disable-next-line no-await-in-loop
    await withDbErrorHandling(
      () => pb.collection('semesters').update(sem.id, { active: false }),
      {
        operation: 'rolloverSemester',
        entity: 'semesters',
        details: { id: sem.id, action: 'deactivate' },
      },
      false // Don't allow null on update errors
    );
  }

  // Create new semester pair
  const semester1 = await pb.collection('semesters').create({
    active: activeSemesterNum === 1,
    name: 'Semester 1',
    code: `SEM01/${yearRange}`,
    start_date: startDate,
    end_date: endDate,
    study_semester: 1,
  });

  const semester2 = await pb.collection('semesters').create({
    active: activeSemesterNum === 2,
    name: 'Semester 2',
    code: `SEM02/${yearRange}`,
    start_date: startDate,
    end_date: endDate,
    study_semester: 2,
  });

  // Roll students forward in pages to avoid loading everything at once.
  let updatedStudents = 0;
  let skippedStudents = 0;
  let errorCount = 0;

  let page = 1;
  let totalPages = 1;
  const pageSize = 100;

  while (page <= totalPages) {
    // eslint-disable-next-line no-await-in-loop
    const studentsPage = await pb.collection('students').getList(page, pageSize, {
      expand: 'semester_id',
      fields: 'id,year_of_study,semester_id',
      sort: '-created',
    });

    totalPages = studentsPage.totalPages;
    const students = studentsPage.items || [];

    const escapedIds = students.map((s) => String(s.id).replace(/"/g, '\\"'));
    const studentOr = escapedIds.map((id) => `studentId = "${id}"`).join(' || ');

    let results = [];
    if (escapedIds.length) {
      // Fetch results in pages to handle large result sets
      const resultsList = await withDbErrorHandling(
        () => pb.collection('results').getList(1, 500, {
          filter: `(${studentOr}) && (semester = "1" || semester = "2")`,
          fields: 'studentId,semester,yearOfStudy,moduleMark',
        }),
        {
          operation: 'rolloverSemester',
          entity: 'results',
          details: { filter: `(${studentOr}) && (semester = "1" || semester = "2")` },
        },
        true // Allow empty results on 404
      );
      results = resultsList.items;
    }

    const resultsByStudent = new Map();
    for (const r of results) {
      const sid = r.studentId;
      if (!resultsByStudent.has(sid)) resultsByStudent.set(sid, []);
      resultsByStudent.get(sid).push(r);
    }

    for (const student of students) {
      try {
        const currentSemester = student.expand?.semester_id?.study_semester;
        if (!currentSemester) {
          skippedStudents += 1;
          continue;
        }

        const yearNum = parseYearOfStudyNumber(student.year_of_study);
        const studentResults = resultsByStudent.get(student.id) || [];

        const relevant = studentResults.filter(
          (r) => String(r.semester) === String(currentSemester) && String(r.yearOfStudy) === String(yearNum),
        );

        const passed = relevant.filter((r) => Number(r.moduleMark) >= 40).length;
        const total = relevant.length;
        const passPercentage = total ? (passed / total) * 100 : 0;

        let newYear = yearNum;
        let newSemesterId = student.semester_id;

        if (passPercentage >= 50 && String(currentSemester) === '2') {
          newYear = yearNum + 1;
          newSemesterId = semester1.id;
        } else if (passPercentage >= 50 && String(currentSemester) === '1') {
          newSemesterId = semester2.id;
        }

        // eslint-disable-next-line no-await-in-loop
        await pb.collection('students').update(student.id, {
          year_of_study: `Year ${newYear}`,
          semester_id: newSemesterId,
          reg_status: 'pending',
        });

        updatedStudents += 1;
      } catch (err) {
        errorCount += 1;
      }
    }

    page += 1;
  }

  return res.status(200).json({
    status: 'success',
    data: {
      semester1,
      semester2,
      updatedStudents,
      skippedStudents,
      errorCount,
    },
  });
});
