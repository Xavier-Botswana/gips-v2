const pb = require('../utils/dbBase');
const { BASE_URL } = require('../utils/base');
const catchAsync = require('../utils/catchAsync');
const { safeGetOne } = require('../utils/dbHelpers');

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

const escape = (val) => String(val).replace(/"/g, '\\"');

exports.createArchive = catchAsync(async (req, res) => {
  const { file } = req;
  const body = req.body || {};

  const filename = body.filename || body.fileName || '';
  const description = body.description || '';
  const year = body.year || body.academic_year || '';
  const semester = body.semester || '';
  const date = body.date || new Date().toISOString();

  if (!filename) {
    return res.status(400).json({ status: 'fail', message: 'filename is required' });
  }

  if (!file || !file.buffer) {
    return res.status(400).json({ status: 'fail', message: 'file is required' });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return res.status(400).json({ status: 'fail', message: 'file too large (max 20MB)' });
  }

  const blob = new Blob([file.buffer], { type: file.mimetype || 'application/octet-stream' });

  const created = await pb.collection('archives').create({
    filename,
    description,
    year,
    semester,
    date,
    file: blob,
  });

  return res.status(201).json({ status: 'success', data: created });
});

exports.getArchives = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const perPage = Math.min(Math.max(parseInt(req.query.perPage, 10) || 20, 1), 100);

  const { search, year, semester, sortBy, sortDir } = req.query;

  const filters = [];
  if (year) filters.push(`year = "${escape(year)}"`);
  if (semester) filters.push(`semester = "${escape(semester)}"`);

  if (search) {
    const term = escape(search);
    filters.push(`filename ~ "${term}" || description ~ "${term}" || year ~ "${term}"`);
  }

  const filter = filters.length ? filters.join(' && ') : undefined;

  const allowedSort = ['created', 'date', 'year', 'semester', 'filename'];
  const field = allowedSort.includes(sortBy) ? sortBy : 'created';
  const sortPrefix = sortDir === 'asc' ? '' : '-';

  const result = await pb.collection('archives').getList(page, perPage, {
    filter,
    sort: `${sortPrefix}${field}`,
  });

  return res.status(200).json({
    status: 'success',
    results: result.items.length,
    currentPage: page,
    totalPages: result.totalPages,
    totalRecords: result.totalItems,
    data: result.items,
  });
});

exports.getArchiveById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const archive = await pb.collection('archives').getOne(id);

  if (!archive) {
    return res.status(404).json({
      status: 'fail',
      message: 'Archive not found',
    });
  }

  res.status(200).json({
    status: 'success',
    archive,
  });
});

exports.getArchiveFileUrl = catchAsync(async (req, res) => {
  const { id } = req.params;

  const archive = await safeGetOne(pb, 'archives', id);
  if (!archive) {
    return res.status(404).json({ status: 'fail', message: 'Archive not found' });
  }

  const raw = archive.file;
  const filenames = Array.isArray(raw) ? raw : raw ? [raw] : [];

  if (!filenames.length) {
    return res.status(404).json({ status: 'fail', message: 'File not available' });
  }

  const fileUrls = filenames.map(
    (filename) => `${BASE_URL}/api/files/${archive.collectionId}/${archive.id}/${filename}`,
  );

  return res.status(200).json({
    status: 'success',
    data: {
      fileUrl: fileUrls[0],
      fileUrls,
    },
  });
});
