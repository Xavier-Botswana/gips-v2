const results = require('./data');
const appLogger = require('../utils/appLogger');

// Only run in development mode
if (process.env.NODE_ENV === 'development') {
  appLogger.debug(`Analytics result count: ${results.data.length}`)

// Manually group and aggregate data
const analytics = results.data.reduce((acc, result) => {
    const { courseId, moduleMark, progressionStatus, expand } = result;
    
    if (!acc[courseId]) {
        acc[courseId] = {
            courseId: courseId, 
            courseName: expand.courseId.course_name, 
            records: 0,
            totalMark: 0,
            highestMark: -Infinity,
            lowestMark: Infinity,
            progressionStatusCounts: {}
        };
    }
    
    acc[courseId].records += 1;
    acc[courseId].totalMark += moduleMark;
    acc[courseId].highestMark = Math.max(acc[courseId].highestMark, moduleMark);
    acc[courseId].lowestMark = Math.min(acc[courseId].lowestMark, moduleMark);
    
    // Aggregate progressionStatus counts
    if (!acc[courseId].progressionStatusCounts[progressionStatus]) {
        acc[courseId].progressionStatusCounts[progressionStatus] = 0;
    }
    acc[courseId].progressionStatusCounts[progressionStatus] += 1;

    return acc;
}, {});

// console.log(analytics);

// Calculate average scores and remove totalScore
const analyticsArray = Object.values(analytics).map(item => {
    const { totalMark, ...rest } = item;
    return {
        ...rest,
        averageMark: totalMark / item.records
    };
});

  appLogger.debug('Analytics array computed', { count: analyticsArray.length })
}
