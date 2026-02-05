const pb = require('../utils/dbBase');
const catchAsync = require('../utils/catchAsync');
const analyticsCache = require('../utils/analyticsCache');
const { safeGetFirst } = require('../utils/dbHelpers');

const escape = (val) => String(val).replace(/"/g, '\\"');

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
};

const getActiveSemesterDefaults = async () => {
  const active = await safeGetFirst(pb, 'semesters', 'active = true', {
    fields: 'id,study_semester,start_date,end_date',
  });

  if (!active) return null;

  const start = active.start_date ? new Date(active.start_date) : null;
  const end = active.end_date ? new Date(active.end_date) : null;

  return {
    semester: active.study_semester != null ? String(active.study_semester) : null,
    createdAfter: start && !Number.isNaN(start.getTime()) ? start.toISOString() : null,
    createdBefore: end && !Number.isNaN(end.getTime()) ? end.toISOString() : null,
  };
};

const buildResultsFilter = ({
  facultyId,
  courseId,
  moduleId,
  yearOfStudy,
  semester,
  studentNo,
  createdAfter,
  createdBefore,
}) => {
  const filters = [];
  if (facultyId) filters.push(`facultyId = "${escape(facultyId)}"`);
  if (courseId) filters.push(`courseId = "${escape(courseId)}"`);
  if (moduleId) filters.push(`moduleId = "${escape(moduleId)}"`);
  if (semester) filters.push(`semester = "${escape(semester)}"`);
  if (studentNo) filters.push(`studentNo = "${escape(studentNo)}"`);

  if (yearOfStudy != null && yearOfStudy !== '') {
    const num = Number(yearOfStudy);
    if (!Number.isNaN(num)) filters.push(`yearOfStudy = ${num}`);
  }

  if (createdAfter) filters.push(`created >= "${escape(createdAfter)}"`);
  if (createdBefore) filters.push(`created <= "${escape(createdBefore)}"`);

  return filters.length ? filters.join(' && ') : '';
};

const scanResults = async ({ filter, fields, onItems }) => {
  const perPage = 200;

  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    // eslint-disable-next-line no-await-in-loop
    const res = await pb.collection('results').getList(page, perPage, {
      ...(filter ? { filter } : {}),
      fields,
      sort: '-created',
    });

    // eslint-disable-next-line no-await-in-loop
    await onItems(res.items || []);
    totalPages = res.totalPages || 1;
    page += 1;
  }
};

// Helper to collect all results into an array (for caching)
const collectResults = async ({ filter, fields }) => {
  const results = [];
  await scanResults({
    filter,
    fields,
    onItems: (items) => {
      results.push(...items);
    },
  });
  return results;
};

const fetchByIds = async ({ collection, ids, fields }) => {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return new Map();

  const map = new Map();
  const chunks = chunk(unique, 50);

  for (const batch of chunks) {
    const filter = batch.map((id) => `id = "${escape(id)}"`).join(' || ');
    const uniqueIds = new Set(batch);

    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const res = await pb.collection(collection).getList(page, 100, {
        filter,
        fields,
        sort: 'id',
      });

      for (const item of res.items || []) {
        if (uniqueIds.has(item.id)) {
          map.set(item.id, item);
        }
      }

      totalPages = res.totalPages || 1;
      page += 1;
    }
  }

  return map;
};

const applyDefaultWindow = async (reqQuery) => {
  const defaults = await getActiveSemesterDefaults();

  const createdAfter = reqQuery.createdAfter || defaults?.createdAfter || null;
  const createdBefore = reqQuery.createdBefore || defaults?.createdBefore || null;
  const semester = reqQuery.semester || defaults?.semester || null;

  return {
    ...reqQuery,
    createdAfter,
    createdBefore,
    semester,
  };
};

/** 1. Results Analytics by Faculty (defaults to active semester window) */
exports.getAnalyticsByFaculty = catchAsync(async (req, res) => {
  const q = await applyDefaultWindow(req.query || {});
  const cacheKey = analyticsCache.generateKey('by-faculty', q);

  const result = await analyticsCache.get(cacheKey, async () => {
    const filter = buildResultsFilter({
      facultyId: q.facultyId,
      courseId: q.courseId,
      moduleId: q.moduleId,
      yearOfStudy: q.yearOfStudy,
      semester: q.semester,
      createdAfter: q.createdAfter,
      createdBefore: q.createdBefore,
    });

    const results = await collectResults({
      filter,
      fields: 'facultyId,moduleMark,progressionStatus',
    });

    const stats = new Map();
    for (const r of results) {
      const key = r.facultyId || 'unknown';
      if (!stats.has(key)) {
        stats.set(key, {
          facultyId: r.facultyId,
          records: 0,
          totalMark: 0,
          highestMark: -Infinity,
          lowestMark: Infinity,
          progressionStatusCounts: {},
        });
      }

      const row = stats.get(key);
      const mark = Number(r.moduleMark);
      row.records += 1;
      if (!Number.isNaN(mark)) {
        row.totalMark += mark;
        row.highestMark = Math.max(row.highestMark, mark);
        row.lowestMark = Math.min(row.lowestMark, mark);
      }

      const ps = r.progressionStatus || 'Unknown';
      row.progressionStatusCounts[ps] = (row.progressionStatusCounts[ps] || 0) + 1;
    }

    const facultyIds = [...stats.keys()].filter((id) => id !== 'unknown');
    const faculties = await fetchByIds({ collection: 'faculties', ids: facultyIds, fields: 'id,name' });

    return [...stats.values()].map((item) => {
      const facultyName = item.facultyId ? faculties.get(item.facultyId)?.name : undefined;
      const highestMark = item.records ? item.highestMark : null;
      const lowestMark = item.records ? item.lowestMark : null;

      return {
        facultyId: item.facultyId,
        facultyName: facultyName || 'Unknown Faculty',
        records: item.records,
        averageMark: item.records ? item.totalMark / item.records : 0,
        highestMark: highestMark === -Infinity ? null : highestMark,
        lowestMark: lowestMark === Infinity ? null : lowestMark,
        progressionStatusCounts: item.progressionStatusCounts,
      };
    });
  }, 15); // Cache for 15 minutes

  return res.status(200).json({
    status: 'success',
    cached: result.cached,
    cachedAt: result.computedAt ? new Date(result.computedAt).toISOString() : null,
    results: result.data.length,
    data: result.data,
  });
});

/** 2. Results Analytics by Study Program (defaults to active semester window) */
exports.getAnalyticsByProgram = catchAsync(async (req, res) => {
  const q = await applyDefaultWindow(req.query || {});
  const cacheKey = analyticsCache.generateKey('by-program', q);

  const result = await analyticsCache.get(cacheKey, async () => {
    const filter = buildResultsFilter({
      facultyId: q.facultyId,
      courseId: q.courseId,
      moduleId: q.moduleId,
      yearOfStudy: q.yearOfStudy,
      semester: q.semester,
      createdAfter: q.createdAfter,
      createdBefore: q.createdBefore,
    });

    const results = await collectResults({
      filter,
      fields: 'courseId,moduleMark,progressionStatus',
    });

    const stats = new Map();
    for (const r of results) {
      const key = r.courseId || 'unknown';
      if (!stats.has(key)) {
        stats.set(key, {
          courseId: r.courseId,
          records: 0,
          totalMark: 0,
          highestMark: -Infinity,
          lowestMark: Infinity,
          progressionStatusCounts: {},
        });
      }

      const row = stats.get(key);
      const mark = Number(r.moduleMark);
      row.records += 1;
      if (!Number.isNaN(mark)) {
        row.totalMark += mark;
        row.highestMark = Math.max(row.highestMark, mark);
        row.lowestMark = Math.min(row.lowestMark, mark);
      }

      const ps = r.progressionStatus || 'Unknown';
      row.progressionStatusCounts[ps] = (row.progressionStatusCounts[ps] || 0) + 1;
    }

    const courseIds = [...stats.keys()].filter((id) => id !== 'unknown');
    const courses = await fetchByIds({ collection: 'courses', ids: courseIds, fields: 'id,course_name' });

    return [...stats.values()].map((item) => {
      const courseName = item.courseId ? courses.get(item.courseId)?.course_name : undefined;
      const highestMark = item.records ? item.highestMark : null;
      const lowestMark = item.records ? item.lowestMark : null;

      return {
        courseId: item.courseId,
        courseName: courseName || 'Unknown Program',
        records: item.records,
        averageMark: item.records ? item.totalMark / item.records : 0,
        highestMark: highestMark === -Infinity ? null : highestMark,
        lowestMark: lowestMark === Infinity ? null : lowestMark,
        progressionStatusCounts: item.progressionStatusCounts,
      };
    });
  }, 15); // Cache for 15 minutes

  return res.status(200).json({
    status: 'success',
    cached: result.cached,
    cachedAt: result.computedAt ? new Date(result.computedAt).toISOString() : null,
    results: result.data.length,
    data: result.data,
  });
});

/** 3. Results Analytics by Module (defaults to active semester window) */
exports.getAnalyticsByModule = catchAsync(async (req, res) => {
  const q = await applyDefaultWindow(req.query || {});
  const cacheKey = analyticsCache.generateKey('by-module', q);

  const result = await analyticsCache.get(cacheKey, async () => {
    const filter = buildResultsFilter({
      facultyId: q.facultyId,
      courseId: q.courseId,
      moduleId: q.moduleId,
      yearOfStudy: q.yearOfStudy,
      semester: q.semester,
      createdAfter: q.createdAfter,
      createdBefore: q.createdBefore,
    });

    const results = await collectResults({
      filter,
      fields: 'courseId,moduleId,moduleMark,progressionStatus',
    });

    const stats = new Map();
    for (const r of results) {
      const key = r.moduleId || 'unknown';
      if (!stats.has(key)) {
        stats.set(key, {
          moduleId: r.moduleId,
          parentCourseId: r.courseId,
          records: 0,
          totalMark: 0,
          highestMark: -Infinity,
          lowestMark: Infinity,
          progressionStatusCounts: {},
        });
      }

      const row = stats.get(key);
      const mark = Number(r.moduleMark);
      row.records += 1;
      if (!Number.isNaN(mark)) {
        row.totalMark += mark;
        row.highestMark = Math.max(row.highestMark, mark);
        row.lowestMark = Math.min(row.lowestMark, mark);
      }

      const ps = r.progressionStatus || 'Unknown';
      row.progressionStatusCounts[ps] = (row.progressionStatusCounts[ps] || 0) + 1;
    }

    const moduleIds = [...stats.keys()].filter((id) => id !== 'unknown');
    const courseIds = [...new Set([...stats.values()].map((v) => v.parentCourseId).filter(Boolean))];

    const [modules, courses] = await Promise.all([
      fetchByIds({ collection: 'modules', ids: moduleIds, fields: 'id,name,module_name,module_code' }),
      fetchByIds({ collection: 'courses', ids: courseIds, fields: 'id,course_name' }),
    ]);

    return [...stats.values()].map((item) => {
      const mod = item.moduleId ? modules.get(item.moduleId) : null;
      const course = item.parentCourseId ? courses.get(item.parentCourseId) : null;

      const moduleName = mod?.name || mod?.module_name || 'Unknown Module';
      const courseName = course?.course_name || 'Unknown Program';
      const highestMark = item.records ? item.highestMark : null;
      const lowestMark = item.records ? item.lowestMark : null;

      return {
        moduleId: item.moduleId,
        moduleName,
        parentCourseId: item.parentCourseId,
        parentCourseName: courseName,
        records: item.records,
        averageMark: item.records ? item.totalMark / item.records : 0,
        highestMark: highestMark === -Infinity ? null : highestMark,
        lowestMark: lowestMark === Infinity ? null : lowestMark,
        progressionStatusCounts: item.progressionStatusCounts,
      };
    });
  }, 15); // Cache for 15 minutes

  return res.status(200).json({
    status: 'success',
    cached: result.cached,
    cachedAt: result.computedAt ? new Date(result.computedAt).toISOString() : null,
    results: result.data.length,
    data: result.data,
  });
});

/** 4. Results Analytics by Year of Study (defaults to active semester window) */
exports.getAnalyticsByYearOfStudy = catchAsync(async (req, res) => {
  const q = await applyDefaultWindow(req.query || {});
  const cacheKey = analyticsCache.generateKey('by-year-of-study', q);

  const result = await analyticsCache.get(cacheKey, async () => {
    const filter = buildResultsFilter({
      facultyId: q.facultyId,
      courseId: q.courseId,
      moduleId: q.moduleId,
      yearOfStudy: q.yearOfStudy,
      semester: q.semester,
      createdAfter: q.createdAfter,
      createdBefore: q.createdBefore,
    });

    const results = await collectResults({
      filter,
      fields: 'yearOfStudy,moduleMark,progressionStatus',
    });

    const stats = new Map();
    for (const r of results) {
      const key = r.yearOfStudy != null ? String(r.yearOfStudy) : 'unknown';
      if (!stats.has(key)) {
        stats.set(key, {
          yearOfStudy: r.yearOfStudy,
          records: 0,
          totalMark: 0,
          highestMark: -Infinity,
          lowestMark: Infinity,
          progressionStatusCounts: {},
        });
      }

      const row = stats.get(key);
      const mark = Number(r.moduleMark);
      row.records += 1;
      if (!Number.isNaN(mark)) {
        row.totalMark += mark;
        row.highestMark = Math.max(row.highestMark, mark);
        row.lowestMark = Math.min(row.lowestMark, mark);
      }

      const ps = r.progressionStatus || 'Unknown';
      row.progressionStatusCounts[ps] = (row.progressionStatusCounts[ps] || 0) + 1;
    }

    return [...stats.values()].map((item) => {
      const highestMark = item.records ? item.highestMark : null;
      const lowestMark = item.records ? item.lowestMark : null;

      return {
        yearOfStudy: item.yearOfStudy,
        records: item.records,
        averageMark: item.records ? item.totalMark / item.records : 0,
        highestMark: highestMark === -Infinity ? null : highestMark,
        lowestMark: lowestMark === Infinity ? null : lowestMark,
        progressionStatusCounts: item.progressionStatusCounts,
      };
    });
  }, 15); // Cache for 15 minutes

  return res.status(200).json({
    status: 'success',
    cached: result.cached,
    cachedAt: result.computedAt ? new Date(result.computedAt).toISOString() : null,
    results: result.data.length,
    data: result.data,
  });
});

/** 5. Departmental performance report (defaults to active semester window) */
exports.getDepartmentPerformanceReport = catchAsync(async (req, res) => {
  const q = await applyDefaultWindow(req.query || {});
  const cacheKey = analyticsCache.generateKey('department-performance', q);

  const result = await analyticsCache.get(cacheKey, async () => {
    const filter = buildResultsFilter({
      facultyId: q.facultyId,
      courseId: q.courseId,
      yearOfStudy: q.yearOfStudy,
      semester: q.semester,
      studentNo: q.studentNo,
      createdAfter: q.createdAfter,
      createdBefore: q.createdBefore,
    });

    const results = await collectResults({
      filter,
      fields: 'facultyId,courseId,yearOfStudy,progressionStatus,moduleMark,moduleId,studentId,studentNo',
    });

    const facultyIds = new Set();
    const courseIds = new Set();
    const moduleIds = new Set();
    const studentIds = new Set();

    for (const r of results) {
      if (r.facultyId) facultyIds.add(r.facultyId);
      if (r.courseId) courseIds.add(r.courseId);
      if (r.moduleId) moduleIds.add(r.moduleId);
      if (r.studentId) studentIds.add(r.studentId);
    }

    const [faculties, courses, modules, students] = await Promise.all([
      fetchByIds({ collection: 'faculties', ids: [...facultyIds], fields: 'id,name' }),
      fetchByIds({ collection: 'courses', ids: [...courseIds], fields: 'id,course_name' }),
      fetchByIds({ collection: 'modules', ids: [...moduleIds], fields: 'id,name,module_name,module_code' }),
      fetchByIds({
        collection: 'students',
        ids: [...studentIds],
        fields: 'id,firstname,lastname,first_name,last_name,name,studentNo',
      }),
    ]);

    const facultiesMap = {};

    for (const result of results) {
      const facultyRef = result.facultyId;
      const courseRef = result.courseId;
      const levelRef = result.yearOfStudy;
      const moduleRef = result.moduleId;
      const studentRef = result.studentId;

      const facultyName = facultyRef ? faculties.get(facultyRef)?.name : null;
      const courseName = courseRef ? courses.get(courseRef)?.course_name : null;

      const studentRecord = studentRef ? students.get(studentRef) : null;
      const fullName =
        [studentRecord?.firstname, studentRecord?.lastname]
          .filter(Boolean)
          .join(' ') ||
        [studentRecord?.first_name, studentRecord?.last_name]
          .filter(Boolean)
          .join(' ') ||
        studentRecord?.name ||
        'Unknown Student';

      const moduleRecord = moduleRef ? modules.get(moduleRef) : null;
      const moduleName = moduleRecord?.name || moduleRecord?.module_name || 'Unknown Module';
      const moduleCode = moduleRecord?.module_code || null;

      if (!facultiesMap[facultyRef]) {
        facultiesMap[facultyRef] = {
          facultyId: facultyRef,
          facultyName: facultyName || 'Unknown Faculty',
          programs: {},
        };
      }
      const faculty = facultiesMap[facultyRef];

      if (!faculty.programs[courseRef]) {
        faculty.programs[courseRef] = {
          courseId: courseRef,
          courseName: courseName || 'Unknown Program',
          levels: {},
        };
      }
      const program = faculty.programs[courseRef];

      const levelKey = levelRef || 'Unknown';
      if (!program.levels[levelKey]) {
        program.levels[levelKey] = {
          yearOfStudy: levelRef,
          summary: {
            totalStudents: 0,
            passProceedCount: 0,
            failSupplementCount: 0,
          },
          students: {},
        };
      }
      const level = program.levels[levelKey];

      if (!level.students[studentRef]) {
        const derivedStudentNo = studentRecord?.studentNo || result.studentNo || null;
        level.students[studentRef] = {
          studentId: studentRef,
          studentNo: derivedStudentNo,
          fullName,
          progressionStatusCounts: {},
          modules: [],
        };
        level.summary.totalStudents += 1;
      }
      const student = level.students[studentRef];

      student.modules.push({
        moduleId: moduleRef,
        moduleName,
        moduleCode,
        moduleMark: result.moduleMark != null ? Math.round(result.moduleMark) : null,
        progressionStatus: result.progressionStatus,
      });

      if (result.progressionStatus) {
        student.progressionStatusCounts[result.progressionStatus] =
          (student.progressionStatusCounts[result.progressionStatus] || 0) + 1;
      }
    }

    return Object.values(facultiesMap).map((faculty) => {
      const programsArr = Object.values(faculty.programs).map((program) => {
        const levelsArr = Object.values(program.levels).map((level) => {
          const studentsArr = Object.values(level.students);

          const passSet = new Set();
          const failSuppSet = new Set();

          studentsArr.forEach((student) => {
            if (student.progressionStatusCounts['Pass + Proceed']) passSet.add(student.studentId);
            if (student.progressionStatusCounts['Fail + Supplement']) failSuppSet.add(student.studentId);
          });

          level.summary.passProceedCount = passSet.size;
          level.summary.failSupplementCount = failSuppSet.size;
          level.summary.totalStudents = studentsArr.length;

          return {
            yearOfStudy: level.yearOfStudy,
            summary: level.summary,
            students: studentsArr,
          };
        });

        const programSummary = levelsArr.reduce(
          (acc, lvl) => {
            acc.totalStudents += lvl.summary.totalStudents;
            acc.passProceedCount += lvl.summary.passProceedCount;
            acc.failSupplementCount += lvl.summary.failSupplementCount;
            return acc;
          },
          { totalStudents: 0, passProceedCount: 0, failSupplementCount: 0 },
        );

        return {
          courseId: program.courseId,
          courseName: program.courseName,
          summary: programSummary,
          levels: levelsArr,
        };
      });

      const facultySummary = programsArr.reduce(
        (acc, prog) => {
          acc.totalStudents += prog.summary.totalStudents;
          acc.passProceedCount += prog.summary.passProceedCount;
          acc.failSupplementCount += prog.summary.failSupplementCount;
          return acc;
        },
        { totalStudents: 0, passProceedCount: 0, failSupplementCount: 0 },
      );

      return {
        facultyId: faculty.facultyId,
        facultyName: faculty.facultyName,
        summary: facultySummary,
        programs: programsArr,
      };
    });
  }, 15); // Cache for 15 minutes

  return res.status(200).json({
    status: 'success',
    cached: result.cached,
    cachedAt: result.computedAt ? new Date(result.computedAt).toISOString() : null,
    results: result.data.length,
    data: result.data,
  });
});

/** Cache Management Endpoints */

// Get cache statistics
exports.getCacheStats = catchAsync(async (req, res) => {
  const stats = analyticsCache.getStats();
  return res.status(200).json({
    status: 'success',
    stats,
  });
});

// Invalidate all analytics cache
exports.invalidateCache = catchAsync(async (req, res) => {
  analyticsCache.invalidateAll();
  return res.status(200).json({
    status: 'success',
    message: 'All analytics cache invalidated',
  });
});

// Invalidate cache by pattern
exports.invalidateCacheByPattern = catchAsync(async (req, res) => {
  const { pattern } = req.body;
  if (!pattern) {
    return res.status(400).json({
      status: 'fail',
      message: 'Pattern is required',
    });
  }
  
  analyticsCache.invalidate(new RegExp(pattern));
  return res.status(200).json({
    status: 'success',
    message: `Cache invalidated for pattern: ${pattern}`,
  });
});
