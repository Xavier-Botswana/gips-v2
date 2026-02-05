import PropTypes from 'prop-types';
import { useRef, useEffect, useState } from 'react';
import * as Yup from 'yup';
// form
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// @mui
import {
  Box,
  Stack,
  Dialog,
  Typography,
  Button,
  Divider,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { PATH_AUTH, PATH_DASHBOARD } from '../../../../routes/paths';
import axios from '../../../../utils/axios';
import { REACT_APP_BASE_URL, REACT_APP_EMAIL_URL } from '../../../../utils/constants';

// _mock
import { countries } from '../../../../_mock';
import { FormProvider, RHFCheckbox, RHFSelect, RHFTextField, RHFRadioGroup } from '../../../../components/hook-form';
import sendToDtefRegistrations from '../../../../hooks/RegistrationsApi';
// ----------------------------------------------------------------------

CheckoutNewRegForm.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onNextStep: PropTypes.func,
  onCreateBilling: PropTypes.func,
};

export default function CheckoutNewRegForm({
  open,
  onClose,
  details,
  currentUser,
  name,
  email,
  status,
  applicationID,
}) {
  const NewAddressSchema = Yup.object().shape({
    receiver: Yup.string().required('Fullname is required'),
    phone: Yup.string().required('Phone is required'),
    address: Yup.string().required('Address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
  });
  const { enqueueSnackbar } = useSnackbar();
  const { record, token, isAuthenticated, isInitialized } = useSelector((state) => {
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

  const [fileCopyOfID, setFileCopyOfID] = useState(null); // State for 'Copy of ID/Passport' file
  const [fileResultsSlip, setFileResultsSlip] = useState(null); // State for 'Copy of results slip' file
  const [fileDtef, setFileDTEF] = useState(null); // State for 'Copy of results slip' file
  const handleCopyOfIDFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    setFileCopyOfID(uploadedFile); // Set the 'Copy of ID/Passport' file to state
  };

  const handleDTEFFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    setFileDTEF(uploadedFile); // Set the 'Copy of ID/Passport' file to state
  };

  const handleResultsSlipFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    setFileResultsSlip(uploadedFile); // Set the 'Copy of results slip' file to state
  };

  const onSubmit = async (data) => {
    if (status === 'approved') {
      if (details.registration_type !== 'Returning') {
        try {
          const approveRes = await axios.post(`/v1/registration/${applicationID}/approve`, {
            studentData: details,
          });

          const studentID = approveRes.data.data.studentId;

          enqueueSnackbar('Registration Approved!');
          onClose();

          await axios.post(
            `/v1/sms/send`,
            {
              body: `Good day ${details.firstname} ${details.lastname},You have been registered for a new semester. Best regards, GIPS.`,
              to: [details.phoneNumber],
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
            subject: 'GIPS Registration Response',
            html: `
          <p>Good day ${name},<br/>
          You have been registered for a new semester,<br/>
          </p>
          <p><i>If you didn't register / apply to study at GIPS you can ignore this email.</i></p>
          <p>
            Thanks,<br/>
            GIPS ADMISSIONS
          </p>
        `,
          });
        } catch (error) {
          console.error('Error during student registration flow:', error);
        }
      }

      if (details.registration_type === 'Returning') {
        try {
          await axios.post(`/v1/registration/${applicationID}/approve`, {
            studentData: details,
          });

          enqueueSnackbar('Registration Approved!');
          onClose();

          await axios.post(
            `/v1/sms/send`,
            {
              body: `Good day ${details.firstname} ${details.lastname},You have been registered for a new semester. Best regards, GIPS.`,
              to: [details.phoneNumber],
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
            subject: 'GIPS Registration Response',
            html: `
          <p>Good day ${name},<br/>
          You have been registered for a new semester,<br/>
          </p>
          <p><i>If you didn't register / apply to study at GIPS you can ignore this email.</i></p>
          <p>
            Thanks,<br/>
            GIPS ADMISSIONS
          </p>
        `,
          });
        } catch (error) {
          console.error('Error during student registration flow:', error);
        }
        navigate(PATH_DASHBOARD.admissions.returningStudents_registrationlist)
      }


    } else if (status === 'declined') {
      enqueueSnackbar('Registration Declined!');
      onClose();
      navigate(PATH_DASHBOARD.admissions.returningStudents_registrationlist);
      await axios
        .patch(`/v1/registration/${applicationID}`, {
          reg_status: 'declined',
        })
        .then(() => {
          axios.post(`${REACT_APP_EMAIL_URL}/v1/emails/email`, {
            from: 'enquiries@gips.ac.bw ,<GIPS ADMISSIONS>',
            to: email,
            subject: 'GIPS Application Response',
            html: `
          <p>Good day ${name},<br/>
          Your registration has been declined.<br/> Reason being : ${messageRef.current} <br/> <br/>
          Make changes to your application by clicking  on the button below <br/>
          
            <a  href="${REACT_APP_BASE_URL}/auth/login" target="_blank" rel="noopener"><button style="background:black;color:white;border-radius:5px">Register</button></a>
          </p>
          <p><i>If you didn't register / apply to study at GIPS you can ignore this email.</i></p>
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
      <DialogTitle>{status !== 'approved' ? 'Rejection Reason' : 'Approve Registration'}</DialogTitle>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={3}>
            {/* <RHFRadioGroup name="addressType" options={['Home', 'Office']} /> */}

            {status === 'approved' ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Are you sure you want to approve this registration?
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
