import PropTypes from 'prop-types';
import { useRef } from 'react';
import * as Yup from 'yup';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
// form
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Stack, Dialog, Typography, Button, Divider, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { PATH_DASHBOARD } from '../../../../routes/paths';
import axios from '../../../../utils/axios';
import { REACT_APP_BASE_URL, REACT_APP_EMAIL_URL } from '../../../../utils/constants';

// _mock
import { FormProvider, RHFTextField } from '../../../../components/hook-form';

// ----------------------------------------------------------------------

CheckoutNewAddressForm.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onNextStep: PropTypes.func,
  onCreateBilling: PropTypes.func,
};

export default function CheckoutNewAddressForm({
  open,
  onClose,
  sponsor,
  name,
  email,
  status,
  applicationID,
  applicantDetails,
}) {
  const NewAddressSchema = Yup.object().shape({
    receiver: Yup.string().required('Fullname is required'),
    phone: Yup.string().required('Phone is required'),
    address: Yup.string().required('Address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
  });
  const { enqueueSnackbar } = useSnackbar();
  const { record, token, isAuthenticated } = useSelector((state) => {
    return state.user;
  });
  const messageRef = useRef('');
  const navigate = useNavigate();
  const defaultValues = {
    mesage: status,
  };

  const methods = useForm({
    resolver: yupResolver(NewAddressSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  async function modifyPdf() {
    const courseId = applicantDetails?.expand?.option_one?.id;
    if (!courseId) {
      throw new Error('Course not found for admission letter');
    }

    const response = await axios.get(`/v1/admission-letters/by-course/${courseId}`);
    const url = response.data.data?.fileUrl;

    if (!url) {
      throw new Error('Admission letter template file not available');
    }

    const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    // Draw a string of text diagonally across the first page
    const applicationNo = `${applicantDetails.national_id}`;
    firstPage.drawText(applicationNo, {
      x: width / 2 + 155,
      y: height / 1 - 80.8,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    // Draw a string of text diagonally across the first page
    const to = `${applicantDetails.firstname} ${applicantDetails.lastname}`;
    firstPage.drawText(to, {
      x: width / 2 - 216,
      y: height / 1 - 104.5,
      size: 9,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    const names = `${applicantDetails.firstname} ${applicantDetails.lastname}`;
    firstPage.drawText(names, {
      x: width / 2 - 200,
      y: height / 1 - 116.5,
      size: 9,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    const idNo = `${applicantDetails.national_id}`;
    firstPage.drawText(idNo, {
      x: width / 2 - 217,
      y: height / 1 - 128.5,
      size: 9,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    const address = `${applicantDetails.physical_address}`;
    firstPage.drawText(address, {
      x: width / 2 - 147,
      y: height / 1 - 140.5,
      size: 9,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    const contacts = `${applicantDetails.phoneNumber}`;
    firstPage.drawText(contacts, {
      x: width / 2 - 177,
      y: height / 1 - 152,
      size: 9,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    // Draw a string of text diagonally across the first page
    const program = `${applicantDetails.expand.option_one.course_name}`;
    firstPage.drawText(program, {
      x: width / 2 - 53,
      y: height / 2 + 140.2,
      size: 9,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    const duration = `${applicantDetails.expand.option_one.duration} Years`;
    firstPage.drawText(duration, {
      x: width / 2 - 53,
      y: height / 2 + 128,
      size: 9,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    const awardedBy = 'GIPS';
    firstPage.drawText(awardedBy, {
      x: width / 2 - 53,
      y: height / 2 + 116.2,
      size: 9,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    const levelOfAdmission = `${applicantDetails.expand.option_one.duration}`;
    firstPage.drawText(levelOfAdmission, {
      x: width / 2 - 53,
      y: height / 2 + 104.2,
      size: 9,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    const commenceDate = `${moment(applicantDetails.expand.semester_id.start_date)} - ${moment(
      applicantDetails.expand.semester_id.end_date
    )}`;

    firstPage.drawText(commenceDate, {
      x: width / 2 - 53,
      y: height / 2 + 92.3,
      size: 9,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    const base64String = await pdfDoc.saveAsBase64();
 await axios.post(
      `/v1/sms/send`,
      {
        body: `Good day ${applicantDetails.firstname} ${applicantDetails.lastname}. Your application has been approved, please check your email to continue with registration.`,
        to: [applicantDetails.phoneNumber],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Replace with your actual token
        },
      }
    );
    
    axios.post(`${REACT_APP_EMAIL_URL}/v1/emails/email`, {
      from: 'enquiries@gips.ac.bw,<GIPS ADMISSIONS>',
      to: email,
      subject: 'GIPS Application Response',
      html: `
      <p>Good day ${name} ,<br/>
      Your application has been approved,<br/>To register click on the button below to create an account<br/><br/>
     
        <a  href="${REACT_APP_BASE_URL}/auth/id_number" target="_blank" rel="noopener"><button style="background:black;color:white;border-radius:5px">Create account</button></a>
      </p>
      <p><i>If you didn't ask / apply to study at GIPS you can ignore this email.</i></p>
      <p>
        Thanks,<br/>
        GIPS ADMISSIONS
      </p>
      `,
      attachments: [
        {
          filename: 'Admission Letter.pdf',
          content: base64String,
          encoding: 'base64',
        },
      ],
    });

   
  }

  const onSubmit = async (data) => {
    if (status === 'approved') {
      await axios.patch(`/v1/applications/${applicationID}`, { status: 'approved' }).then(async () => {
        onClose();
        modifyPdf();
        enqueueSnackbar('Application Approved!');
        navigate(PATH_DASHBOARD.admissions.applicationlist);

        try {
          const response = await axios.get(`/v1/applications/${applicationID}`);
          const details = response.data.data;

          if (sponsor.includes('Government')) {
            await axios.post('/v1/dtef/sendAdmissionToDtef', details);
          }
        } catch (error) {
          console.error('Failed to load application details for DTEF:', error);
        }
      });
    } else if (status === 'declined') {
      axios.patch(`/v1/applications/${applicationID}`, { status: 'declined' }).then(() => {
        onClose();
        enqueueSnackbar('Application declined!');
        navigate(PATH_DASHBOARD.admissions.applicationlist);
        axios.post(`${REACT_APP_EMAIL_URL}/v1/emails/email`, {
          from: 'enquiries@gips.ac.bw ,<GIPS ADMISSIONS>',
          to: email,
          subject: 'GIPS Application Response',
          html: `
          <p>Good day ${name},<br/>
          Your application has been declined.<br/> Reason being : ${messageRef.current} <br/> <br/>
          To make changes to your application  click the on the button below to create an account<br/>
          
            <a  href="${REACT_APP_BASE_URL}/auth/id_number" target="_blank" rel="noopener"><button style="background:black;color:white;border-radius:5px">Create account</button></a>
          </p>
          <p><i>If you didn't ask / apply to study at GIPS you can ignore this email.</i></p>
          <p>
            Thanks,<br/>
            GIPS ADMISSIONS
          </p>
          `,
        });
      });
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle>{status !== 'approved' ? 'Rejection Reason' : 'Approve Application'}</DialogTitle>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={3}>
            {/* <RHFRadioGroup name="addressType" options={['Home', 'Office']} /> */}

            {status === 'approved' ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Are you sure you want to approve this application?
              </Typography>
            ) : (
              ''
            )}

            {status === 'declined' ? (
              <RHFTextField
                multiline
                fullWidth
                rows={4}
                ref={messageRef}
                name="message"
                label="Message"
                onChange={(e) => {
                  messageRef.current = e.target.value;
                }}
              />
            ) : (
              ''
            )}
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions>
          {status === 'approved' ? (
            <>
              {' '}
              <Button color="inherit" variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <LoadingButton variant="contained" onClick={onSubmit} loading={isSubmitting}>
                Approve
              </LoadingButton>
            </>
          ) : (
            <>
              {' '}
              <Button color="inherit" variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <LoadingButton variant="contained" onClick={onSubmit} loading={isSubmitting}>
                Decline
              </LoadingButton>
            </>
          )}
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
