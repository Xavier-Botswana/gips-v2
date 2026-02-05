const pb = require('../utils/dbBase');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { safeGetOne } = require('../utils/dbHelpers');

// Helper: Stream records in pages to avoid loading entire table into memory
const streamRecords = async ({ collection, filter, fields, onBatch }) => {
  const perPage = 200;
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const res = await pb.collection(collection).getList(page, perPage, {
      ...(filter ? { filter } : {}),
      ...(fields ? { fields } : {}),
      sort: 'id',
    });

    await onBatch(res.items || []);
    totalPages = res.totalPages || 1;
    page += 1;
  }
};

exports.getHods = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const hods = await pb.collection('hods').getList(page, limit, {
    filter: 'user_id != ""',
    sort: '-created',
  });

  res.status(200).json({
    status: 'success',
    results: hods.items.length,
    currentPage: hods.page,
    totalPages: hods.totalPages,
    totalRecords: hods.totalItems,
    hods: hods.items,
  });
});

exports.reviewBatchResults = catchAsync(async (req, res, next) => {
  const { batchId } = req.params;
  const { status, reviewMessage } = req.body;

  if (!status || (status !== 'approved' && status !== 'rejected')) {
    return next(
      new AppError(
        'Invalid status provided. Must be either "approved" or "rejected".',
        400,
      ),
    );
  }

  const batch = await safeGetOne(pb, 'batch_results', batchId);

  if (!batch) {
    return next(new AppError('Batch not found', 404));
  }

  if (batch.status !== 'pending') {
    return next(new AppError('This batch has already been reviewed.', 400));
  }

  const module = await safeGetOne(pb, 'modules', batch.moduleId);

  if (!module) {
    return next(new AppError('Associated module not found', 404));
  }

    const weights = {
      assignment: module.assignment_weight / 100,
      midSemester: module.mid_semester_weight / 100,
      exam: module.exam_weight / 100,
    };

    // await Promise.all(
    //   batch.results.map(async (resultId) => {
    //     const result = await pb.collection('results').getOne(resultId);

    //     let totalMark =
    //       result.assignmentMark * weights.assignment +
    //       result.midSemesterMark * weights.midSemester +
    //       result.examMark * weights.exam;

    //     totalMark = Math.round(totalMark);

    //     let progressionStatus = 'Fail + Repeat';
    //     if (totalMark >= 40) {
    //       progressionStatus = 'Pass + Proceed';
    //     } else if (totalMark < 40 ) {
    //       progressionStatus = 'Fail + Supplement';
    //     }

    //     await pb.collection('results').update(resultId, {
    //       status,
    //       progressionStatus,
    //       moduleMark: totalMark,
    //     });
    //   }),
    // );
       await Promise.all(
      batch.results.map(async (resultId) => {
        const result = await pb.collection('results').getOne(resultId);

        let moduleMark;
        let progressionStatus = 'Fail + Repeat';

        const hasSupplementaryMark =
          result.supplementaryMark !== null &&
          result.supplementaryMark !== 0 &&
          result.supplementaryMark !== undefined;

        if (hasSupplementaryMark) {
          // Use the supplementary mark for final decision, capped at 40
          const rawSuppMark = Number(result.supplementaryMark) || 0;
          const cappedSuppMark = Math.min(rawSuppMark, 40);

          moduleMark = cappedSuppMark;

          if (cappedSuppMark >= 40) {
            // Supplementary passed – treat as Pass + Proceed
            progressionStatus = 'Pass + Proceed';
          } else {
            // Supplementary failed – plain Fail
            progressionStatus = 'Fail + Repeat';
          }

          await pb.collection('results').update(resultId, {
            status,
            progressionStatus,
            moduleMark,
            // Persist the capped supplementary mark (e.g. 79 -> 40)
            supplementaryMark: cappedSuppMark,
          });
        } else {
          // No supplementary mark – use normal weighted calculation
          const totalMark =
            result.assignmentMark * weights.assignment +
            result.midSemesterMark * weights.midSemester +
            result.examMark * weights.exam;

          moduleMark = totalMark;

        if (totalMark >= 40) {
          progressionStatus = 'Pass + Proceed';
        } else if (totalMark < 40 ) {
          progressionStatus = 'Fail + Supplement';
        }

          await pb.collection('results').update(resultId, {
            status,
            progressionStatus,
            moduleMark,
          });
        }
      }),
    );

  const updatedBatch = await pb.collection('batch_results').update(batchId, {
    status,
    reviewMessage: reviewMessage || '',
    reviewDate: new Date(),
  });

  res.status(200).json({
    message: `Batch has been successfully ${status}.`,
    batch: updatedBatch,
  });
});

exports.updateAllModuleWeights = catchAsync(async (req, res) => {
  // This is a bulk admin operation - consider adding admin authorization check here
  // if (!req.user || req.user.role !== 'admin') {
  //   return res.status(403).json({ message: 'Admin access required' });
  // }

  let updatedCount = 0;
  let errorCount = 0;
  const errors = [];

  // Stream through modules in pages to avoid loading all into memory
  await streamRecords({
    collection: 'modules',
    fields: 'id',
    onBatch: async (modules) => {
      // Process each module in the batch
      for (const module of modules) {
        try {
          await pb.collection('modules').update(module.id, {
            assignment_weight: 25,
            mid_semester_weight: 25,
            exam_weight: 50,
            supplement_weight: 0,
          });
          updatedCount += 1;
        } catch (err) {
          errorCount += 1;
          errors.push({ moduleId: module.id, error: err.message });
        }
      }
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Module weights update completed',
    updatedCount,
    errorCount,
    ...(errors.length > 0 && { errors: errors.slice(0, 10) }), // Show first 10 errors
  });
});
