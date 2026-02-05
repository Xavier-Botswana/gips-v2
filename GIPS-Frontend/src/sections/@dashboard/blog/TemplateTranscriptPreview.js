import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Button, Container, Typography, DialogActions } from '@mui/material';
// components
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import Scrollbar from '../../../components/Scrollbar';
import EmptyContent from '../../../components/EmptyContent';
import { DialogAnimate } from '../../../components/animate';
import axios from '../../../utils/axios';


TemplatePreview.propTypes = {
  values: PropTypes.array,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default function TemplatePreview({ values, isOpen, onClose }) {


  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    if (values) {
      createPdf(values);
    }
  }, [values]);

  const createPdf = async () => {


    axios.get(`v1/transcripts/${values}`, { responseType: 'blob' })
      .then(async (res) => {
        // console.log("Response received:", res);
        // You can now work with the blob data, for example, create a URL for it.
        const blob = res.data;
        const url = window.URL.createObjectURL(blob);
        // const link = document.createElement('a');
        // link.href = url;
        // link.setAttribute('download', `transcript-${values}.pdf`); // Adjust file name and extension as needed
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link); // Clean up the link
        setPdfUrl(url);
      })
      .catch(error => {
        console.error("Error fetching the transcript:", error);
      });




    // console.log(values);

    // Set the PDF URL to state to view it
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'Transcript.pdf';
      link.click();
    }
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

      {values ? (
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
      ) : (
        <EmptyContent title="Empty content" />
      )}
    </DialogAnimate>
  );
}

// ----------------------------------------------------------------------
