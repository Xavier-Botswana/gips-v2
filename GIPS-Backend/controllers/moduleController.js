const HTTP_STATUS = require('../utils/httpStatus');
const pb = require('../utils/dbBase');
const catchAsync = require('../utils/catchAsync');
const { safeGetFirst, withDbErrorHandling } = require('../utils/dbHelpers');

const { moduleSchema, validateModule } = require('../validation/moduleSchema');

exports.createModule = catchAsync(async (req, res) => {
  const {
    module_name,
    module_code,
    parent_course,
    year_level,
    faculty,
    semester,
    location,
    assignment_weight,
    supplement_weight,
    mid_semester_weight,
    exam_weight,
    credits,
    facilitator,
    prerequisites,
    is_prerequisite,
    minimum_pass_grade,
  } = req.body;

  if (prerequisites?.length > 0) {
    const prereqModules = await pb.collection('modules').getList(1, 50, {
      filter: `id ?= "${prerequisites.join('" || id ?= "')}"`,
    });

    if (prereqModules.items.length !== prerequisites.length) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'One or more prerequisite modules do not exist',
      });
    }
  }

  const moduleData = {
    name: module_name,
    module_code,
    parent_course,
    year_level,
    faculty,
    semester,
    location: location || null,
    assignment_weight,
    supplement_weight: supplement_weight || null,
    mid_semester_weight,
    exam_weight,
    credits,
    facilitator: facilitator || null,
    prerequisites: prerequisites || null,
    is_prerequisite: is_prerequisite || false,
    minimum_pass_grade: minimum_pass_grade || null,
  };

  const module = await pb.collection('modules').create(moduleData);

  res.status(HTTP_STATUS.CREATED).json({
    message: 'Module created successfully',
    module,
  });
});

exports.getAllModules = catchAsync(async (req, res) => {
  const {
    course,
    faculty,
    year,
    semester,
    prerequisites,
    isPrerequisite,
    expand = 'parent_course,faculty,semester',
    page,
    perPage,
    search,
    sortBy,
    sortDir,
    facilitator,
  } = req.query;

  const filters = [];
  const escape = (val) => String(val).replace(/"/g, '\\"');

  if (course) filters.push(`parent_course = "${escape(course)}"`);
  if (faculty) filters.push(`faculty = "${escape(faculty)}"`);
  if (year) filters.push(`year_level = ${year}`);
  if (semester) filters.push(`semester = "${escape(semester)}"`);
  if (prerequisites) filters.push(`prerequisites ?~ "${escape(prerequisites)}"`);
  if (isPrerequisite) filters.push(`is_prerequisite = ${isPrerequisite}`);
  if (facilitator) filters.push(`facilitator = "${escape(facilitator)}"`);
  if (search) {
    const term = escape(search);
    filters.push(
      `module_code ~ "${term}" || name ~ "${term}" || facilitator ~ "${term}" || id ~ "${term}"`,
    );
  }

  const filter = filters.length ? filters.join(' && ') : undefined;

  const allowedSort = ['created', 'name', 'module_code', 'year_level'];
  const sortField = allowedSort.includes(sortBy) ? sortBy : 'created';
  const sortDirection = sortDir === 'asc' ? '' : '-';
  const sort = `${sortDirection}${sortField}`;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const perPageNum = Math.min(Math.max(parseInt(perPage, 10) || 10, 1), 100);

  const modules = await pb.collection('modules').getList(pageNum, perPageNum, {
    filter,
    expand,
    sort,
  });

  res.status(HTTP_STATUS.OK).json({
    message: 'Modules retrieved successfully',
    totalItems: modules.totalItems,
    totalPages: modules.totalPages,
    currentPage: modules.page,
    perPage: modules.perPage,
    data: modules.items,
  });
});

// Get single module with prerequisite info
exports.getModule = catchAsync(async (req, res) => {
  const { id } = req.params;
  const module = await pb.collection('modules').getOne(id, {
    expand: 'parent_course,faculty,semester,prerequisites',
  });

  if (!module) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: 'Module not found',
    });
  }

  // Get modules that have this module as a prerequisite
  const dependentModules = await pb.collection('modules').getList(1, 100, {
    filter: `prerequisites ?~ "${id}"`,
    fields: 'id,name,module_code',
  });

  res.status(HTTP_STATUS.OK).json({
    ...module,
    dependent_modules: dependentModules.items,
  });
});

// Update module with prerequisite validation
exports.updateModule = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { prerequisites, ...updateData } = req.body;

  // Check if module exists
  const existingModule = await pb.collection('modules').getOne(id);

  if (!existingModule) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: 'Module not found',
    });
  }

  // Validate prerequisites if being updated
  if (prerequisites?.length > 0) {
    // Prevent circular prerequisites
    if (prerequisites.includes(id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'A module cannot be its own prerequisite',
      });
    }

    const prereqModules = await pb.collection('modules').getList(1, 50, {
      filter: `id ?= "${prerequisites.join('" || id ?= "')}"`,
    });

    if (prereqModules.items.length !== prerequisites.length) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'One or more prerequisite modules do not exist',
      });
    }
  }

  const updatedModule = await pb.collection('modules').update(id, {
    ...existingModule,
    name: updateData.module_name || existingModule.name,
    ...updateData,
    prerequisites: prerequisites || existingModule.prerequisites,
  });

  res.status(HTTP_STATUS.OK).json({
    message: 'Module updated successfully',
    module: updatedModule,
  });
});

// Delete module with dependency check
exports.deleteModule = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Check if module is a prerequisite for other modules
  const dependentModules = await pb.collection('modules').getList(1, 100, {
    filter: `prerequisites ?~ "${id}"`,
    fields: 'id,name,module_code',
  });

  if (dependentModules.items.length > 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: 'Cannot delete module as it is a prerequisite for other modules',
      dependent_modules: dependentModules,
    });
  }

  await pb.collection('modules').delete(id);
  res.status(HTTP_STATUS.OK).json({ message: 'Module deleted successfully' });
});

// Get modules by course with semester grouping
exports.getModulesByCourseId = catchAsync(async (req, res) => {
  const { course_id } = req.params;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);

  const modules = await pb.collection('modules').getList(page, limit, {
    filter: `parent_course = "${course_id}"`,
    expand: 'semester,prerequisites',
    sort: '+year_level,+semester',
  });

  // Group modules by year and semester
  const groupedModules = modules.items.reduce((acc, module) => {
    const year = module.year_level;
    const semester = module.expand?.semester?.name || 'Unknown Semester';

    if (!acc[year]) acc[year] = {};
    if (!acc[year][semester]) acc[year][semester] = [];

    acc[year][semester].push(module);
    return acc;
  }, {});

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    currentPage: modules.page,
    totalPages: modules.totalPages,
    totalRecords: modules.totalItems,
    data: groupedModules,
  });
});

// Get module prerequisites tree
exports.getModulePrerequisites = catchAsync(async (req, res) => {
  const { id } = req.params;

  const getPrerequisiteTree = async (moduleId, visited = new Set()) => {
    if (visited.has(moduleId)) return null; // Prevent circular references
    visited.add(moduleId);

    const module = await pb.collection('modules').getOne(moduleId, {
      fields: 'id,name,module_code,prerequisites',
    });

    if (!module || !module.prerequisites?.length) return module;

    const prerequisites = await Promise.all(
      module.prerequisites.map((prereqId) =>
        getPrerequisiteTree(prereqId, visited),
      ),
    );

    return { ...module, prerequisite_tree: prerequisites.filter(Boolean) };
  };

  const prerequisiteTree = await getPrerequisiteTree(id);
  res.status(HTTP_STATUS.OK).json(prerequisiteTree);
});

exports.getModuleLecturers = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

  const { lecturerId, moduleId } = req.query;
  const filters = [];
  const escape = (val) => String(val).replace(/"/g, '\\"');

  if (lecturerId) filters.push(`lecturer_id = "${escape(lecturerId)}"`);
  if (moduleId) filters.push(`module_id = "${escape(moduleId)}"`);
  const filter = filters.length ? filters.join(' && ') : undefined;

  const moduleLecturers = await pb
    .collection('module_lecturers')
    .getList(page, limit, {
      expand: 'module_id,module_id.semester,lecturer_id',
      sort: '-created',
      filter,
    });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    results: moduleLecturers.items.length,
    currentPage: page,
    totalPages: moduleLecturers.totalPages,
    totalRecords: moduleLecturers.totalItems,
    data: moduleLecturers.items,
  });
});

exports.deleteModuleLecturerAssignment = catchAsync(async (req, res) => {
  const { id } = req.params;
  await pb.collection('module_lecturers').delete(id);
  res.status(HTTP_STATUS.NO_CONTENT).send();
});

exports.assignModulesToLecturerByName = catchAsync(async (req, res) => {
  const { lecturerName } = req.body;
  if (!lecturerName || !String(lecturerName).trim()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ status: 'fail', message: 'lecturerName is required' });
  }

  const safeName = String(lecturerName).replace(/"/g, '\\"');

  const lecturer = await safeGetFirst(pb, 'lecturers', `name = "${safeName}"`);

  if (!lecturer) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ status: 'fail', message: 'Lecturer not found' });
  }

  const levelMap = {
    1: 'viokg5kyd0zf4pq',
    2: 'n16x2oory115gwv',
    3: 'f7woqbgg5kbegbz',
    4: 'l6jkg9f0lr0tcmi',
  };

  const modules = await pb.collection('modules').getList(1, 100, {
    filter: `facilitator = "${safeName}"`,
    fields: 'id,year_level',
  });

  if (!modules.items.length) {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'No modules found for this lecturer',
      assignedNow: 0,
      alreadyAssigned: 0,
      totalModules: 0,
    });
  }

  const existing = await pb
    .collection('module_lecturers')
    .getList(1, 100, {
      filter: `lecturer_id = "${lecturer.id}"`,
      fields: 'id,module_id',
    });

  const existingModuleIds = new Set(existing.items.map((e) => e.module_id));
  const remainingModules = modules.items.filter((m) => !existingModuleIds.has(m.id));

  if (!remainingModules.length) {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'No new modules to assign',
      totalModules: modules.items.length,
      alreadyAssigned: existingModuleIds.size,
      assignedNow: 0,
      createdRecords: [],
    });
  }

  const createdRecords = [];
  const chunkSize = 20;

  for (let i = 0; i < remainingModules.length; i += chunkSize) {
    const chunk = remainingModules.slice(i, i + chunkSize);
    // eslint-disable-next-line no-await-in-loop
    const createdChunk = await Promise.all(
      chunk.map((moduleItem) =>
        pb.collection('module_lecturers').create({
          lecturer_id: lecturer.id,
          module_id: moduleItem.id,
          level: levelMap[moduleItem.year_level],
        }),
      ),
    );

    createdRecords.push(...createdChunk);
  }

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Modules successfully assigned',
    totalModules: modules.items.length,
    alreadyAssigned: existingModuleIds.size,
    assignedNow: createdRecords.length,
    createdRecords,
  });
});

exports.getModuleLecturerAssignmentsByName = catchAsync(async (req, res) => {
  const { lecturerName } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

  if (!lecturerName || !String(lecturerName).trim()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ status: 'fail', message: 'lecturerName is required' });
  }

  const term = String(lecturerName).replace(/"/g, '\\"');
  const lecturer = await safeGetFirst(pb, 'lecturers', `name ~ "${term}"`);

  if (!lecturer) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ status: 'fail', message: 'Lecturer not found' });
  }

  const assignments = await pb.collection('module_lecturers').getList(page, limit, {
    filter: `lecturer_id = "${lecturer.id}"`,
    expand: 'module_id',
    sort: '-created',
  });

  const modules = (assignments.items || []).map((item) => {
    const moduleInfo = item.expand?.module_id || {};
    return {
      id: item.id,
      moduleId: item.module_id,
      code: moduleInfo.module_code || moduleInfo.code || '',
      name: moduleInfo.module_name || moduleInfo.name || '',
      yearLevel: moduleInfo.year_level,
    };
  });

  return res.status(HTTP_STATUS.OK).json({
    status: 'success',
    currentPage: page,
    totalPages: assignments.totalPages,
    totalRecords: assignments.totalItems,
    data: {
      lecturer: { id: lecturer.id, name: lecturer.name },
      modules,
    },
  });
});

exports.assignLecturerToModule = catchAsync(async (req, res) => {
  const { module_id, lecturer_id, level } = req.body;

  if (!module_id || !lecturer_id) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: 'Missing required fields',
    });
  }

  // Check if assignment already exists
  const existingAssignment = await safeGetFirst(
    pb,
    'module_lecturers',
    `module_id = "${module_id}" && lecturer_id = "${lecturer_id}"`,
  );

  if (existingAssignment) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: 'Lecturer is already assigned to this module',
    });
  }

  const response = await pb.collection('module_lecturers').create({
    module_id,
    lecturer_id,
    level,
  });

  res.status(HTTP_STATUS.OK).json({
    message: 'Lecturer assigned to module successfully',
    assignment: response,
  });
});

exports.createModule = [
  validateModule(moduleSchema.create),
  exports.createModule,
];
exports.updateModule = [
  validateModule(moduleSchema.update),
  exports.updateModule,
];
exports.assignLecturerToModule = [
  validateModule(moduleSchema.assignLecturer),
  exports.assignLecturerToModule,
];
