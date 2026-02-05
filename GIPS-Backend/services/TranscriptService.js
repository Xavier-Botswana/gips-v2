const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const isDev = process.env.NODE_ENV === 'development';

class TranscriptService {
  static async generateTranscript(studentData, results) {
    try {
      // Create a new PDFDocument
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);

      // Load standard fonts
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const fontSize = 7;
      const blackColor = rgb(0, 0, 0);

      // Helper function to draw text
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

      // Draw student details
      drawText('STUDENT NAME:', 30, 750, { bold: true });
      drawText(`${studentData.firstname} ${studentData.lastname}`, 90, 750);
      drawText('DATE OF BIRTH:', 180, 750, { bold: true });
      drawText(
        new Date(studentData.date_of_birth).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        237,
        750,
      );
      drawText('STUDENT NO:', 300, 750, { bold: true });
      drawText(studentData.tr_number, 350, 750);
      drawText('NATIONAL ID:', 400, 750, { bold: true });
      drawText(studentData.tr_number, 450, 750);

      // Draw program details
      drawText('PROGRAMME OF STUDY:', 30, 735, { bold: true });
      drawText(studentData.course_name, 119, 735);
      drawText('LEVEL OF QUALIFICATION:', 385, 735, { bold: true });
      drawText('DEGREE', 477, 735);
      drawText('AWARDING INSTITUTION:', 30, 720, { bold: true });
      drawText('GIPS', 119, 720);
      drawText('STUDY MODE:', 200, 720, { bold: true });
      drawText(studentData.study_mode.toUpperCase(), 250, 720);
      drawText('COMPLETION DATE:', 300, 720, { bold: true });
      drawText('30-JUNE-2024', 370, 720);

      // Draw table headers
      drawText('MODULE', 30, 690, { bold: true });
      drawText('CREDIT', 270, 690, { bold: true });
      drawText('GRADE', 350, 690, { bold: true });
      drawText('ASSESSMENT DATE', 430, 690, { bold: true });

      // Draw modules
      let rowY = 675;
      results.forEach((result) => {
        drawText(result.module_name, 30, rowY);
        drawText(result.credits.toString(), 270, rowY);
        drawText(result.grade.toString(), 350, rowY);
        drawText(result.assessment_date, 430, rowY);
        rowY -= 20;
      });

      // Draw signatures
      drawText('___________________', 30, 100);
      drawText('Academic Manager', 30, 80, { bold: true });
      drawText('___________________', 300, 100);
      drawText('Centre Manager', 300, 80, { bold: true });

      // Return the PDF bytes
      return await pdfDoc.save();
    } catch (error) {
      if (isDev) {
        console.error('Error generating PDF:', error.message);
      }
      throw new Error('Failed to generate transcript PDF');
    }
  }

  static formatModuleData(results) {
    return results.map((result) => ({
      module_name: result.expand.moduleId.name,
      credits: result.expand.moduleId.credits,
      grade: result.moduleMark,
      assessment_date: new Date(result.created).toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      }),
    }));
  }
}

module.exports = TranscriptService;
