import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Button, Container, Typography, DialogActions, CircularProgress } from '@mui/material';
// components
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import Scrollbar from '../../../components/Scrollbar';
import EmptyContent from '../../../components/EmptyContent';
import { DialogAnimate } from '../../../components/animate';

TemplatePreview.propTypes = {
  values: PropTypes.array,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default function TemplatePreview({ values, isOpen, onClose }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (values) {
      setIsLoading(true);
      createPdf(values).finally(() => {
        setIsLoading(false);
      });
    }
  }, [values]);

  const createPdf = async () => {
    if (!values || values.length === 0) {
      console.log('No values provided');
      return;
    }

    if (!values[0].expand) {
      console.error('Invalid values structure: missing expand property');
      return;
    }

    const {
      expand: { studentId, courseId },
      moduleMark,
      created,
    } = values[0];

    console.log(values);
    const modules = await Promise.all(
      values.map(async (result) => {
        const {
          expand: { moduleId },
          moduleMark,
          created,
        } = result;

        const newModule = {
          module: moduleId.name,
          credit: moduleId.credits.toString(),
          grade: moduleMark.toString(),
          date: new Date(created).toLocaleString('default', { month: 'short', year: 'numeric' }),
        };

        return newModule;
      })
    );

    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();

    const page = pdfDoc.addPage([595, 842]);

    // Load standard fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const fontSize = 7;
    const blackColor = rgb(0, 0, 0);

    // Adding the same text structure as in the provided PDF
    // Start with text like "STUDENT NAME:", "DATE OF BIRTH:", etc.
    page.drawText('STUDENT NAME:', { x: 30, y: 750, size: fontSize, boldFont, color: blackColor });
    page.drawText(`${studentId.firstname} ${studentId.lastname}`, {
      x: 90,
      y: 750,
      size: fontSize,
      font,
      color: blackColor,
    });
    page.drawText('DATE OF BIRTH:', { x: 180, y: 750, size: fontSize, boldFont, color: blackColor });
    page.drawText(
      `${new Date(`${studentId.date_of_birth}`).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })}`,
      { x: 237, y: 750, size: fontSize, font, color: blackColor }
    );
    page.drawText('STUDENT NO:', { x: 300, y: 750, size: fontSize, boldFont, color: blackColor });
    page.drawText(`${studentId.tr_number}`, { x: 350, y: 750, size: fontSize, font, color: blackColor });
    page.drawText('NATIONAL ID:', { x: 400, y: 750, size: fontSize, boldFont, color: blackColor });
    page.drawText(`${studentId.tr_number}`, { x: 450, y: 750, size: fontSize, font, color: blackColor });

    // Program details
    page.drawText('PROGRAMME OF STUDY:', { x: 30, y: 735, size: fontSize, font, color: blackColor });
    page.drawText(`${courseId.course_name}`, {
      x: 119,
      y: 735,
      size: fontSize,
      font,
      color: blackColor,
    });

    page.drawText('LEVEL OF QUALIFICATION:', { x: 385, y: 735, size: fontSize, font, color: blackColor });
    page.drawText('DEGREE', { x: 477, y: 735, size: fontSize, font, color: blackColor });

    page.drawText('AWARDING INSTITUTION:', { x: 30, y: 720, size: fontSize, font, color: blackColor });
    page.drawText('GIPS', { x: 119, y: 720, size: fontSize, font, color: blackColor });

    page.drawText('STUDY MODE:', { x: 200, y: 720, size: fontSize, font, color: blackColor });
    page.drawText(`${studentId.study_mode.toUpperCase()}`, { x: 250, y: 720, size: fontSize, font, color: blackColor });

    page.drawText('COMPLETION DATE:', { x: 300, y: 720, size: fontSize, font, color: blackColor });
    page.drawText('30-JUNE-2024', { x: 370, y: 720, size: fontSize, font, color: blackColor });

    // Table Header
    page.drawText('MODULE', { x: 30, y: 690, size: fontSize, font, color: blackColor });
    page.drawText('CREDIT', { x: 270, y: 690, size: fontSize, font, color: blackColor });
    page.drawText('GRADE', { x: 350, y: 690, size: fontSize, font, color: blackColor });
    page.drawText('ASSESSMENT DATE', { x: 430, y: 690, size: fontSize, font, color: blackColor });

    const modules_ = [
      { module: 'Introduction to Logistics & Supply Chain', credit: '10', grade: 'X', date: 'Dec 2020' },
      { module: 'Introduction to Business Communication', credit: '10', grade: 'X', date: 'Dec 2020' },
      { module: 'Introduction to Quantitative Methods', credit: '10', grade: 'X', date: 'Dec 2020' },
    ];
    // Loop through and add modules
    let rowY = 675; // Initial Y-position for the first row
    modules.forEach((item, index) => {
      page.drawText(item.module, { x: 30, y: rowY, size: 7, font, color: blackColor });
      page.drawText(item.credit, { x: 270, y: rowY, size: fontSize, font, color: blackColor });
      page.drawText(item.grade, { x: 350, y: rowY, size: fontSize, font, color: blackColor });
      page.drawText(item.date, { x: 430, y: rowY, size: fontSize, font, color: blackColor });
      rowY -= 20; // Move the Y-position down for the next row
    });

    // Add manager signatures placeholders
    page.drawText('___________________', { x: 30, y: 100, size: fontSize, font, color: blackColor });
    page.drawText('Academic Manager', { x: 30, y: 80, size: fontSize, font, color: blackColor });

    page.drawText('___________________', { x: 300, y: 100, size: fontSize, font, color: blackColor });
    page.drawText('Centre Manager', { x: 300, y: 80, size: fontSize, font, color: blackColor });

    // Serialize the PDFDocument to bytes
    const pdfBytes = await pdfDoc.save();

    // Convert PDF bytes to Blob and create a URL to view it
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Set the PDF URL to state to view it
    setPdfUrl(pdfUrl);
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'Transcript.pdf';
      link.click();
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!values || values.length === 0) {
      return <EmptyContent title="No data available" />;
    }

    return (
      <Scrollbar>
        <Container>
          <Box sx={{ mt: 5, mb: 10 }}>
            {pdfUrl && (
              <Worker workerUrl={`https://unpkg.com/pdfjs-dist@2.5.207/build/pdf.worker.min.js`}>
                <Viewer fileUrl={pdfUrl} />
              </Worker>
            )}
          </Box>
        </Container>
      </Scrollbar>
    );
  };

  return (
    <DialogAnimate fullScreen open={isOpen} onClose={onClose}>
      <DialogActions sx={{ py: 2, px: 3 }}>
        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
          Preview Post
        </Typography>
        <Button onClick={onClose}>Cancel</Button>
        <LoadingButton type="submit" variant="contained" onClick={handleDownload}>
          Download
        </LoadingButton>
      </DialogActions>

      {renderContent()}
    </DialogAnimate>
  );
}

// ----------------------------------------------------------------------
