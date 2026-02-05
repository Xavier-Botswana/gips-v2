const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const isDev = process.env.NODE_ENV === 'development';

class ResultSlipService {
  static async generateResultSlip(studentData, results) {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const fontSize = 7;
      const blackColor = rgb(0, 0, 0);

      const drawText = (text, x, y, options = {}) => {
        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font: options.bold ? boldFont : font,
          color: blackColor,
          ...options,
        });
      };

      drawText('STATEMENT OF RESULTS', 250, 800, { bold: true, size: 12 });
      drawText('ACADEMIC YEAR 2025/2026', 245, 785, { size: 8 });

      drawText('STUDENT NAME:', 30, 750, { bold: true });
      drawText(`${studentData.firstname} ${studentData.lastname}`, 90, 750);
      drawText('STUDENT NO:', 300, 750, { bold: true });
      drawText(studentData.studentNo, 350, 750);

      drawText('PROGRAMME:', 30, 735, { bold: true });
      drawText(studentData.course_name, 85, 735);
      drawText('LEVEL:', 300, 735, { bold: true });
      drawText(studentData.level || 'DEGREE', 335, 735);

      drawText('SEMESTER:', 30, 720, { bold: true });
      drawText(studentData.semester || '1', 80, 720);
      drawText('STUDY MODE:', 300, 720, { bold: true });
      drawText(studentData.study_mode.toUpperCase(), 355, 720);

      const tableY = 690;
      drawText('CODE', 30, tableY, { bold: true });
      drawText('MODULE', 80, tableY, { bold: true });
      drawText('CREDITS', 270, tableY, { bold: true });
      drawText('CA', 320, tableY, { bold: true });
      drawText('EXAM', 360, tableY, { bold: true });
      drawText('TOTAL', 400, tableY, { bold: true });
      drawText('GRADE', 440, tableY, { bold: true });
      drawText('REMARKS', 480, tableY, { bold: true });

      const drawLine = (y) => {
        page.drawLine({
          start: { x: 25, y },
          end: { x: 570, y },
          thickness: 0.5,
          color: blackColor,
        });
      };

      drawLine(tableY - 5);

      let rowY = 675;
      let totalCredits = 0;
      let totalWeightedScore = 0;
      let passedModules = 0;
      let failedModules = 0;
      let hasSupplementaryFail = false;

      
      results.forEach((result) => {
        drawText(result.module_code, 30, rowY);
        drawText(result.module_name.replace(/\s*\(.*?\)/g, ''), 80, rowY);
        drawText(result.credits.toString(), 270, rowY);
        drawText(result.ca_mark.toString(), 320, rowY);
        drawText(result.exam_mark.toString(), 360, rowY);
        drawText(Math.round(result.total_mark).toString(), 400, rowY);
        drawText(result.grade, 440, rowY);
        drawText(result.remarks || 'PASS', 480, rowY);

        totalCredits += result.credits;
        totalWeightedScore += result.total_mark * result.credits;
          const remark = (result.remarks || 'PASS').toUpperCase();
        const hasSupplementary =
          result.supplementaryMark !== null &&
          result.supplementaryMark !== undefined;
        if (remark === 'PASS') {
          passedModules += 1;
        } else {
          failedModules += 1;
          const supplementaryFailed =
            hasSupplementary && Number(result.supplementaryMark) < 40;
          if (supplementaryFailed) {
            hasSupplementaryFail = true;
          }
        }

        rowY -= 15;
      });

      drawLine(rowY + 5);

      const gpa = (totalWeightedScore / (totalCredits * 100)).toFixed(2);
      rowY -= 20;

      drawText('SUMMARY', 30, rowY, { bold: true });
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
      drawText('Total Credits:', 30, rowY - 15, { bold: true });
      drawText(totalCredits.toString(), 90, rowY - 15);
      drawText('Progression Status:', 30, rowY - 30, { bold: true });
      drawText(progressionStatus, 120, rowY - 30, { bold: true });
      // drawText('GPA:', 150, rowY - 15, { bold: true });
      // drawText(gpa.toString(), 180, rowY - 15);

      drawText('___________________', 30, 100);
      drawText('Head of Department', 30, 80, { bold: true });
      drawText('___________________', 300, 100);
      drawText('Academic Director', 300, 80, { bold: true });

      const currentDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      drawText('Date:', 30, 50, { bold: true });
      drawText(currentDate, 60, 50);

      return await pdfDoc.save();
    } catch (error) {
      if (isDev) {
        console.error('Error generating PDF:', error.message);
      }
      throw new Error('Failed to generate result slip PDF');
    }
  }

  static formatResultData(results) {
    return results.map((result) => ({
      module_code: result.expand.moduleId.module_code,
      module_name: result.expand.moduleId.name,
      credits: result.expand.moduleId.credits,
      ca_mark: result.assignmentMark || 0,
      exam_mark: result.examMark || 0,
      total_mark: result.moduleMark,
      grade: this.calculateGrade(Math.round(result.moduleMark),Math.round(result.supplementaryMark)),
      remarks: this.calculateRemarks(Math.round(result.moduleMark),Math.round(result.supplementaryMark)),
    }));
  }

  // static calculateGrade(mark) {
  //   if (mark >= 70) return 'A';
  //   if (mark >= 55) return 'B';
  //   if (mark >= 40) return 'C';
  //   return 'F';
  // }

    /**
   * Calculate grade.
   * - For supplementary cases (supplementaryMark not null/undefined):
   *   - Mark is effectively capped at 40.
   *   - If effective mark >= 40 ⇒ grade 'C'
   *   - If effective mark < 40  ⇒ grade 'F'
   * - For normal cases (no supplementary mark), keep existing banding.
   */
  static calculateGrade(mark, supplementaryMark) {
    const hasSupplementary =
      supplementaryMark !== null && supplementaryMark !== 0 && supplementaryMark !== undefined;

    if (hasSupplementary) {
      const effective =
        Math.min(
          Number(supplementaryMark || mark || 0),
          40,
        );

      if (effective >= 40) return 'C';
      return 'F';
    }

    if (mark >= 70) return 'A';
    if (mark >= 55) return 'B';
    if (mark >= 40) return 'C';
    return 'F';
  }

  // static calculateRemarks(mark) {
  //   if (mark >= 40) return 'PASS';
  //   return 'FAIL';
  // }

 /**
   * Calculate remarks.
   * For supplementary and normal cases we still treat >= 40 as PASS, < 40 as FAIL.
   * (Supplementary pass/fail is already reflected in the grade via calculateGrade.)
   */
  static calculateRemarks(mark, supplementaryMark) {
    const hasSupplementary =
      supplementaryMark !== null && supplementaryMark !== 0 && supplementaryMark !== undefined;

    const effectiveMark = hasSupplementary
      ? Math.min(Number(supplementaryMark || mark || 0), 40)
      : mark;

    if (effectiveMark >= 40) return 'PASS';
    return 'FAIL';
  }





  
}

module.exports = ResultSlipService;
