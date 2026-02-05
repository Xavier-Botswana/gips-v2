const computeProgressionStatus = (results = []) => {
  if (!Array.isArray(results) || results.length === 0) {
    return 'Fail + Supplement';
  }

  let passedModules = 0;
  let failedModules = 0;
  let hasSupplementaryFail = false;

  results.forEach((result) => {
    const moduleMark = Number(result.moduleMark || 0);
    const supplementaryMarkRaw = result.supplementaryMark;
    const hasSupplementary =
      supplementaryMarkRaw !== null &&
      supplementaryMarkRaw !== undefined &&
      supplementaryMarkRaw !== 0;
    const supplementaryMark = hasSupplementary
      ? Number(supplementaryMarkRaw || 0)
      : 0;

    const passed =
      moduleMark >= 40 || (hasSupplementary && supplementaryMark >= 40);

    if (passed) {
      passedModules += 1;
    } else {
      failedModules += 1;
      if (hasSupplementary && supplementaryMark < 40) {
        hasSupplementaryFail = true;
      }
    }
  });

  const totalModules = results.length;
  const passedMoreThanHalf = passedModules > totalModules / 2;
  const passedAll = passedModules === totalModules && totalModules > 0;
  const failedAll = failedModules === totalModules && totalModules > 0;

  let progressionStatus = 'Fail + Supplement';
  if (hasSupplementaryFail) {
    progressionStatus = 'Fail + Discontinue';
  } else if (passedAll) {
    progressionStatus = 'Proceed';
  } else if (failedAll) {
    progressionStatus = 'Fail + Supplement';
  } else if (passedMoreThanHalf) {
    progressionStatus = 'Proceed + Supplement';
  }

  return progressionStatus;
};

module.exports = {
  computeProgressionStatus,
};
