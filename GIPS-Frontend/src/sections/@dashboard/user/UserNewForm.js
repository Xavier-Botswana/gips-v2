import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useState, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector, useDispatch } from 'react-redux';
// @mui
import { LoadingButton, DesktopDatePicker } from '@mui/lab';
import {
  Card,
  Autocomplete,
  Stack,
  Button,
  Grid,
  Box,
  Typography,
  TextField,
  Dialog,
  Divider,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider as MuiSlider,
} from '@mui/material';
import { countryCodes } from './constants';
import useAuth from '../../../hooks/useAuth';
import axios from '../../../utils/axios';

// routes
import { PATH_DASHBOARD, PATH_AUTH } from '../../../routes/paths';
// _mock
import { countries } from '../../../_mock';
// components
import { FormProvider, RHFSelect, RHFTextField, RHFRadioGroup } from '../../../components/hook-form';
import { REACT_APP_EMAIL_URL } from '../../../utils/constants';

// ----------------------------------------------------------------------
const SPONSORSHIP_OPTION = ['Government Regular', 'Government Re-Instatement', 'Private Sponsorship'];
const CAMPUS_OPTION = ['Gaborone', 'Francistown', 'Maun'];
const ACADEMIC_YEAR_OPTION = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];

const ACCOMODATION_OPTION = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
];
const STUDY_MODE_OPTION = ['Full time', 'Part time', 'Online'];

UserNewForm.propTypes = {
  isEdit: PropTypes.bool,
  currentUser: PropTypes.object,
};

export default function UserNewForm({ isEdit }) {
  // Get the query parameters from the URL
  const queryParams = new URLSearchParams(window.location.search);

  // Get the value of the 'data' parameter
  const encodedData = queryParams.get('course');

  // Decode the URL-encoded JSON string
  const decodedData = decodeURIComponent(encodedData);

  // Parse the JSON string back into an object
  const course = JSON.parse(decodedData);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [autoWidth, setAutoWidth] = useState(24);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [selectedOptionOne, setSelectedOptionOne] = useState('');
  const [selectedOptionTwo, setSelectedOptionTwo] = useState('');
  const [selectedOptionThree, setSelectedOptionThree] = useState('');
  const [openSent, setOpenSent] = useState(false);
  const [visible, setVisible] = useState(false);
  const [semesters, setSemesters] = useState();
  const [guestDetails, setGuest] = useState();
  const [applicantDetails, setApplicantDetails] = useState();
  const [selectedCountryCode, setSelectedCountryCode] = useState('+267');
  const navigate = useNavigate();
  const { record, token, isAuthenticated } = useSelector((state) => {
    return state.user;
  });
  const { enqueueSnackbar } = useSnackbar();
  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };
  const NewUserSchema = Yup.object().shape({
    firstname: Yup.string().required('Name is required'),
    lastname: Yup.string().required('Name is required'),
    email: Yup.string().required('Email is required').email(),
    tel_number: Yup.string().required('Phone number is required'),
    physical_address: Yup.string().required('Physical address is required'),
    country: Yup.string().required('country is required'),
    omang: Yup.mixed().required('ID / Passport number is required'),
    date_of_birth: Yup.date().required('Date of birth is required'),
    year_of_study: Yup.string().required('Year of study is required'),
    semester: Yup.string().required('Semester is required'),
    option_one: Yup.string().required('Course / program is required'),
    option_two: Yup.string().required('Course / program is required'),
    option_three: Yup.string().required('Course / program is required'),
    accommodation: Yup.string().required('Accomodation is required'),
    next_of_kin_name: Yup.string().required('Course / program is required'),
    next_of_kin_number: Yup.string().required('Course / program is required'),
    relationship: Yup.string().required('Next of kin relationship is required'),
    next_of_kin_address: Yup.string().required('Next of Kin phyical address is required'),
    campus: Yup.string().required('Campus is required'),
    sponsorship: Yup.string().required('Sponsorship is required'),
    study_mode: Yup.string().required('Study mode is required'),
    avatarUrl: Yup.mixed().test('required', 'Avatar is required', (value) => value !== ''),
  });

  const dateObject = new Date(applicantDetails?.date_of_birth);
  const option = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = dateObject.toLocaleDateString('en-US', option);

  const defaultValues = useMemo(
    () =>
      record.role === 'returningGuest'
        ? {
            accommodation: applicantDetails?.accommodation,
            email: record?.email || '',
            tel_number: applicantDetails?.phoneNumber?.slice(4) || '',
            option_one: applicantDetails?.option_one || '',
            option_two: applicantDetails?.option_two || '',
            option_three: applicantDetails?.option_three || '',
            country: applicantDetails?.country || '',
            next_of_kin_name: applicantDetails?.next_of_kin_name || '',
            firstname: applicantDetails?.firstname || '',
            points: applicantDetails?.points || '',
            lastname: applicantDetails?.lastname || '',
            next_of_kin_number: applicantDetails?.next_of_kin_number || '',
            next_of_kin_address: applicantDetails?.next_of_kin_address || '',
            semester: applicantDetails?.semester_id || '',
            date_of_birth: applicantDetails?.date_of_birth
              ? new Date(applicantDetails.date_of_birth).toISOString().split('T')[0]
              : '',
            study_mode: applicantDetails?.study_mode || '',
            omang: applicantDetails?.national_id || '',
            phoneNumber: applicantDetails?.phoneNumber?.slice(4) || '',
            sponsorship: applicantDetails?.sponsorship || '',
            sponsorname: applicantDetails?.sponsorname || '',
            sponsornumber: applicantDetails?.sponsornumber || '',
            physical_address: applicantDetails?.physical_address || '',
            year_of_study: applicantDetails?.year_of_study || '',
            relationship: applicantDetails?.relationship || '',
            campus: applicantDetails?.campus || '',
            postqualification: applicantDetails?.postqualification,
            sponsoraddress: applicantDetails?.sponsoraddress,
          }
        : { option_one: course?.course_name || '' },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [applicantDetails]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  // Filter out the selected option from the options list for the second select element
  const filteredOptions = options.filter(
    (option) => option.id !== selectedOptionOne || selectedOptionTwo || selectedOptionThree
  );

  useEffect(() => {
    const loadReturningGuest = async () => {
      try {
        const appsRes = await axios.get('/v1/applications/mine', { params: { page: 1, limit: 1 } });
        const application = appsRes.data.data?.[0];

        if (!application) {
          setGuest(undefined);
          setApplicantDetails(undefined);
          return;
        }

        const guest = application.expand?.guest_id;
        setGuest(guest);

        setApplicantDetails({
          ...application,
          firstname: guest?.firstname,
          lastname: guest?.lastname,
          date_of_birth: guest?.date_of_birth,
          national_id: guest?.national_id,
        });
      } catch (error) {
        console.error('Failed to load returning guest application:', error);
        setGuest(undefined);
        setApplicantDetails(undefined);
      }
    };

    if (record.role === 'returningGuest') {
      loadReturningGuest();
    }
  }, [record.role]);

  // Function to fetch file from URL
  async function fetchFileFromURL(url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error fetching file:', error);
      throw error;
    }
  }

  useEffect(() => {
    if (isEdit && applicantDetails) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, applicantDetails]);

  const onSubmit = async () => {
    const phoneNumber = `${selectedCountryCode}${values.tel_number}`;
    console.log(phoneNumber);
    try {
      if (values.points < 31 && !values.sponsorship.includes('Private') && values.sponsorship.includes('Government')) {
        await axios.post(`${REACT_APP_EMAIL_URL}/v1/emails/email`, {
          from: 'enquiries@gips.ac.bw,<GIPS ADMISSIONS>',
          to: values.email,
          subject: 'GIPS Application',
          html: `
        <p>Good day ${values.firstname},<br/>
        We have recieved your application, You do not meet the requirements to apply for this course.<br/>
        </p>
        <p><i>If you didn't register / apply to study at GIPS you can ignore this email.</i></p>
        <p>
          Thank you for applying at GIPS,<br/>
          GIPS ADMISSIONS
        </p>
        `,
        });
        // setVisible(true);
        return;
      }

      if (record.role === 'returningGuest') {
        let blob;
        let blob1;
        let blob2;

        const getExistingBlob = async (field) => {
          try {
            const res = await axios.get(`/v1/applications/${applicantDetails?.id}/file/${field}`);
            const fileUrl = res.data.data?.fileUrl;
            if (!fileUrl) return null;
            return await fetchFileFromURL(fileUrl);
          } catch (err) {
            return null;
          }
        };

        if (applicantDetails?.copy_of_id) blob = await getExistingBlob('copy_of_id');
        if (applicantDetails?.results_slip) blob1 = await getExistingBlob('results_slip');
        if (applicantDetails?.ovc_letter) blob2 = await getExistingBlob('ovc_letter');

        const formData = new FormData();
        formData.append('guest_id', guestDetails.id);
        formData.append('study_mode', values.study_mode);
        formData.append('semester_id', values.semester);
        formData.append('phoneNumber', phoneNumber);
        formData.append('date_of_birth', values?.date_of_birth || formattedDate);
        formData.append('country', values.country);
        formData.append('option_one', values.option_one);
        formData.append('option_two', values?.option_two || selectedOptionTwo);
        formData.append('option_three', values?.option_three || selectedOptionThree);
        formData.append('next_of_kin_name', values.next_of_kin_name);
        formData.append('next_of_kin_number', values.next_of_kin_number);
        formData.append('next_of_kin_address', values.next_of_kin_address);
        formData.append('points', values.points);
        formData.append('accommodation', values.accommodation);
        formData.append('year_of_study', values.year_of_study);
        formData.append('sponsorship', values.sponsorship);
        formData.append('sponsorname', values.sponsorname);
        formData.append('sponsornumber', values.sponsornumber);
        formData.append('campus', values.campus);
        formData.append('postqualification', values.postqualification);
        formData.append('sponsoraddress', values.sponsoraddress);
        formData.append('relationship', values.relationship);
        formData.append('physical_address', values.physical_address);
        formData.append('status', 'pending');
        formData.append('dtef_status', 'pending');
        formData.append('copy_of_id', fileCopyOfID || blob, applicantDetails.copy_of_id);
        formData.append('results_slip', fileResultsSlip || blob1, applicantDetails.results_slip);
        if (fileOVC) {
          formData.append('ovc_letter', fileOVC || blob2, applicantDetails.ovc_letter);
        }

        await axios.patch(`/v1/applications/${applicantDetails?.id}/mine/files`, formData).then(async () => {
          await axios.post(`${REACT_APP_EMAIL_URL}/v1/emails/email`, {
            from: 'enquiries@gips.ac.bw,<GIPS ADMISSIONS>',
            to: values.email,
            subject: 'GIPS Application',
            html: `
          <p>Good day ${values.firstname},<br/>
          We have received your application, we will get back to you once we are done reviewing it,<br/>
          </p>
          <p><i>If you didn't register / apply to study at GIPS you can ignore this email.</i></p>
          <p>
            Thank you for applying at GIPS,<br/>
            GIPS ADMISSIONS
          </p>
         `,
          });

          await axios.post(
            `/v1/sms/send`,
            {
              body: `Good day ${values.firstname} ${values.lastname}. We have received your application, and we will get back to you once we are done reviewing it.`,
              to: [phoneNumber],
            },
            {
              headers: {
                Authorization: `Bearer ${token}`, // Replace with your actual token
              },
            }
          );
        });
        setOpenSent(true);

        await axios
          .patch(`/v1/users/${record.id}`, {
            role: 'guest',
            name: `${values?.firstname}  ${values?.lastname}`,
          })
          .then(async (response) => {
            const newGuestInfor = {
              name: values.lastname,
              lastname: values.lastname,
              firstname: values.firstname,
              date_of_birth: values?.date_of_birth || formattedDate,
              national_id: `${values.omang}`,
            };
            await axios.patch(`/v1/guests/${guestDetails?.id}`, newGuestInfor);
          });
      }

      if (
        values.study_mode === '' ||
        values.semester === '' ||
        values.tel_number === '' ||
        values.date_of_birth === '' ||
        values.country === '' ||
        values.option_two === '' ||
        values.option_three === '' ||
        values.next_of_kin_name === '' ||
        values.next_of_kin_number === '' ||
        values.next_of_kin_address === '' ||
        values.points === '' ||
        values.accommodation === '' ||
        values.year_of_study === '' ||
        values.sponsorship === '' ||
        values.sponsorname === '' ||
        values.sponsornumber === '' ||
        values.campus === '' ||
        values.postqualification === '' ||
        values.sponsoraddress === '' ||
        values.relationship === '' ||
        values.physical_address === ''
      ) {
        enqueueSnackbar('Please fill in all the details');
        return;
      }

      if (record.role === 'guest') {
        if (fileCopyOfID === null) {
          enqueueSnackbar('Please attach all the neccessary documents.', {
            variant: 'error',
          });
          return;
        }
        if (fileResultsSlip === null) {
          enqueueSnackbar('Please attach all the neccessary documents.', {
            variant: 'error',
          });
          return;
        }

        if (fileOVC === null && values.points < 36 && values.points > 31) {
          enqueueSnackbar('Please attach all the neccessary documents.', {
            variant: 'error',
          });
          return;
        }

        const data = {
          email: values.email,
          emailVisibility: true,
          name: `${values.firstname}_${values.lastname}`,
          password: 'password1234',
          passwordConfirm: 'password1234',
          role: 'guest',
        };

        let response = await axios.get(`/v1/guests`);
        response = response.data.data.find((guest) => guest.national_id === values.omang);
        if (!response) {
          await axios
            .post(`/v1/users`, data)
            .then(async (response) => {
              const userid = response.data.user.id;
              const newGuestInfor = {
                name: response.data.user.username,
                lastname: values.lastname,
                firstname: values.firstname,
                user_id: userid,
                date_of_birth: values.date_of_birth,
                national_id: `${values.omang}`,
              };
              let guestId = '';
              await axios.post('/v1/guests', newGuestInfor).then(async (res) => {
                guestId = res.data.id;

                const firstChoice = course ? course?.id : values.option_one;

                const formData = new FormData();
                formData.append('guest_id', guestId);
                formData.append('study_mode', values.study_mode);
                formData.append('semester_id', values.semester);
                formData.append('phoneNumber', phoneNumber);
                formData.append('date_of_birth', values.date_of_birth);
                formData.append('country', values.country);
                formData.append('option_one', firstChoice);
                formData.append('option_two', values.option_two);
                formData.append('option_three', values.option_three);
                formData.append('next_of_kin_name', values.next_of_kin_name);
                formData.append('next_of_kin_number', values.next_of_kin_number);
                formData.append('next_of_kin_address', values.next_of_kin_address);
                formData.append('points', values.points);
                formData.append('accommodation', values.accommodation);
                formData.append('year_of_study', values.year_of_study);
                formData.append('sponsorship', values.sponsorship);
                formData.append('sponsorname', values.sponsorname);
                formData.append('sponsornumber', values.sponsornumber);
                formData.append('campus', values.campus);
                formData.append('postqualification', values.postqualification);
                formData.append('sponsoraddress', values.sponsoraddress);
                formData.append('relationship', values.relationship);
                formData.append('physical_address', values.physical_address);
                formData.append('status', 'pending');
                formData.append('dtef_status', 'pending');
                formData.append('copy_of_id', fileCopyOfID);
                fileResultsSlip?.forEach((file, index) => {
                  formData.append(`results_slip`, file);
                });
                if (fileOVC) {
                  formData.append('ovc_letter', fileOVC);
                }

                await axios.post('/v1/applications', formData).then(async () => {
                  try {
                    await axios.post(`${REACT_APP_EMAIL_URL}/v1/emails/email`, {
                      from: 'enquiries@gips.ac.bw,<GIPS ADMISSIONS>',
                      to: values.email,
                      subject: 'GIPS Application',
                      html: `
    <p>Good day ${values.firstname},<br/>
    We have received your application, we will get back to you once we are done reviewing it,<br/>
    </p>
    <p><i>If you didn't register / apply to study at GIPS you can ignore this email.</i></p>
    <p>
      Thank you for applying at GIPS,<br/>
      GIPS ADMISSIONS
    </p>
    `,
                    });
                  } catch (error) {
                    console.log('Email sending');
                    console.log(error);
                    console.log('Email sending');
                  }
                  await axios.post(
                    `/v1/sms/send`,
                    {
                      body: `Good day ${values.firstname} ${values.lastname}. We have received your application, and we will get back to you once we are done reviewing it.`,
                      to: [phoneNumber],
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${token}`, // Replace with your actual token
                      },
                    }
                  );

                  setOpenSent(true);
                });
              });
            })
            .catch((e) => {
              console.log(e);
              setOpen(true);
            });
        } else {
          setOpen(true);
        }
      }
    } catch (error) {
      console.log(error);
      console.error('Error submitting the form:', error);
      setOpen(true);
    }
  };

  // --------------------------- START ==> OPTIONS PART -------------------------------------------

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/v1/courses');
        setOptions(response.data.courses);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      await axios.get('/v1/semesters').then((response) => {
        const semesterResponse = response.data.filter((semester) => {
          return semester.active === true;
        });
        setSemesters(semesterResponse);
      });
    };

    fetch();
  }, []);

  // ------------------------------ END HERE ----------------------------------------

  // -------------------------- START: ACCOMODATION --------------------------------------------

  // ------------------------------------------------------------------------------------------------
  const [fileCopyOfID, setFileCopyOfID] = useState(null); // State for 'Copy of ID/Passport' file
  const [fileResultsSlip, setFileResultsSlip] = useState(null); // State for 'Copy of results slip' file
  const [fileOVC, setFileOVC] = useState(null); // State for 'Copy of ID/Passport' file
  const [edit, setEdit] = useState(false); // State for 'Copy of ID/Passport' file

  const handleCopyOfIDFileChange = (event) => {
    const uploadedFile = event.target.files[0];

    if (uploadedFile.type !== 'application/pdf') {
      enqueueSnackbar('Please select only PDF files.', { variant: 'error' });
      return;
    }

    setFileCopyOfID(uploadedFile); // Set the 'Copy of ID/Passport' file to state
  };

  const handleOVCFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile.type !== 'application/pdf') {
      enqueueSnackbar('Please select only PDF files.', { variant: 'error' });
      return;
    }
    setFileOVC(uploadedFile); // Set the 'Copy of ID/Passport' file to state
  };

  const handleResultsSlipFileChange = (event) => {
    const uploadedFile = Array.from(event.target.files);
    const pdfFiles = uploadedFile.filter((file) => file.type === 'application/pdf');
    if (uploadedFile.length !== pdfFiles.length) {
      enqueueSnackbar('Please select only PDF files.', { variant: 'error' });
    } else {
      setFileResultsSlip(pdfFiles); // Set the 'Copy of results slip' file to state
    }
  };

  // view method
  const handleDownload = async (applicationId, field, name) => {
    try {
      const res = await axios.get(`/v1/applications/${applicationId}/file/${field}`);
      const urls = res.data.data?.fileUrls || (res.data.data?.fileUrl ? [res.data.data.fileUrl] : []);

      urls.forEach((url) => {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.download = name || field;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } catch (error) {
      console.error('Error fetching file:', error);
    }
  };


  let label = '';
  let description = '';

  if (openSent) {
    label = 'Application Sent';
    description =
      'Your application has been sent successfully. We will get back to you after reviewing your application, Thank you';
  } else if (visible) {
    label = 'Requirements';
    description = 'You do not meet the required points to apply for this course';
  } else {
    label = 'Application Email Address/Identity Number';
    description = `The email address ${values.email} / Identity number ${values.omang} used is already in use by another application, please try again or contact the Admistration office.`;
  }

  let label01;
  if (!edit && record.role === 'returningGuest') {
    label01 = 'View Copy of ID';
  } else {
    label01 = fileCopyOfID ? `Uploaded Copy of ID` : 'Click to upload';
  }

  let label02;
  if (!edit && record.role === 'returningGuest') {
    label02 = 'View Result Slip';
  } else {
    label02 = fileResultsSlip ? `Uploaded Results Slip` : 'Click to upload';
  }

  let label03;
  if (!edit && record.role === 'returningGuest') {
    label03 = 'View OVC Letter';
  } else {
    label03 = fileOVC ? `Uploaded OVC Letter` : 'Click to upload';
  }

  const IDMethod = () => {
    if (record.role !== 'returningGuest') {
      document.getElementById('idCopy').click();
    }
    if (record.role === 'returningGuest') {
      if (edit) {
        document.getElementById('idCopy').click();
      } else {
        handleDownload(applicantDetails?.id, 'copy_of_id', `${applicantDetails.copy_of_id} Copy of ID/Passport`);
      }
    }
  };

  const ResultSlipMethod = () => {
    if (record.role !== 'returningGuest') {
      document.getElementById('resultsSlip').click();
    }
    if (record.role === 'returningGuest') {
      if (edit) {
        document.getElementById('resultsSlip').click();
      } else {
        handleDownload(applicantDetails?.id, 'results_slip', `${applicantDetails.results_slip} Copy of Results Slip`);
      }
    }
  };

  const OvcMethod = () => {
    if (record.role !== 'returningGuest') {
      document.getElementById('ovc').click();
    }
    if (record.role === 'returningGuest') {
      if (edit) {
        document.getElementById('ovc').click();
      } else {
        handleDownload(applicantDetails?.id, 'ovc_letter', `${applicantDetails.ovc_letter} Copy of OVC Letter`);
      }
    }
  };

  return (
    <>
      <Dialog fullWidth maxWidth="sm" open={open || openSent || visible}>
        <DialogTitle>{label} </DialogTitle>

        <FormProvider>
          <DialogContent>
            <Stack spacing={3}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {description}
              </Typography>
            </Stack>
          </DialogContent>

          <Divider />

          <DialogActions>
            <>
              <Button
                color="inherit"
                variant="outlined"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
              <LoadingButton
                variant="contained"
                onClick={async () => {
                  setOpen(false);
                  setVisible(false);
                  if (record.role === 'guest' && openSent) {
                    navigate(PATH_DASHBOARD.general.apply);
                  }
                  if (record.role === 'returningGuest' && openSent) {
                    navigate('/');
                  }
                  // else {
                  //   logout();
                  //   navigate(PATH_AUTH.login);
                  // }
                }}
                loading={isSubmitting}
              >
                okay
              </LoadingButton>
            </>
          </DialogActions>
        </FormProvider>
      </Dialog>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={16}>
            <Card sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'grid',
                  columnGap: 2,
                  rowGap: 3,
                  gridTemplateColumns: {
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                  },
                }}
              >
                <RHFTextField name="firstname" label="First Name" />
                <RHFTextField name="lastname" label="Last Name" />
                <RHFTextField
                  name="date_of_birth"
                  type="date"
                  placeholder=""
                  label="Date of Birth"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                {/* <Controller
                  name="date_of_birth"
                  render={({ field }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Date of Birth"
                      defaultValue
                      inputFormat="dd/MM/yyyy"
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  )}
                /> */}
                <RHFSelect name="country" label="Country" placeholder="Country">
                  <option value="" />
                  {countries.map((option) => (
                    <option key={option.code} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </RHFSelect>
              </Box>
              <Stack spacing={3} mt={2} mb={2}>
                <RHFTextField name="omang" label="ID / Passport" />
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  columnGap: 2,
                  rowGap: 3,
                  gridTemplateColumns: {
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                  },
                }}
              >
                <RHFSelect name="study_mode" label="Study Mode">
                  <option value="" />
                  {STUDY_MODE_OPTION.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </RHFSelect>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Autocomplete
                      options={countryCodes} // Your predefined country codes
                      getOptionLabel={(option) => `${option.label} (${option.code}) +${option.phone}`}
                      renderInput={(params) => <TextField {...params} label="Country Code" />}
                      onChange={(event, newValue) => setSelectedCountryCode(newValue ? `+${newValue.phone}` : '')}
                    />
                  </Grid>
                  <Grid item xs={8}>
                    <RHFTextField
                      name="tel_number"
                      label="Phone Number"
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>{selectedCountryCode}</Typography>,
                      }}
                    />
                  </Grid>
                </Grid>
                <RHFTextField name="email" label="Email Address" />
                <RHFTextField name="physical_address" label="Physical Address" />

                <RHFSelect name="year_of_study" label="Year of Study">
                  <option value="" />
                  {ACADEMIC_YEAR_OPTION.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </RHFSelect>

                <RHFSelect name="semester" label="Semester">
                  <option value="" />
                  {semesters?.map((option, index) => (
                    <option key={index} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </RHFSelect>
              </Box>

              <Stack spacing={3} mt={2} mb={2}>
                {!course && (
                  <RHFSelect
                    name="option_one"
                    label="Option One"
                    placeholder=""
                    onChange={(e) => setSelectedOptionOne(e.target.value)} // Update the selected value
                  >
                    <option value="" />
                    {options.map((option, index) => (
                      <option key={index} value={option?.id}>
                        {option.course_name}
                      </option>
                    ))}
                  </RHFSelect>
                )}
                {course && <RHFTextField name="option_one" label="Option One" disabled={course && true} />}

                <RHFSelect name="option_two" label="Option two" placeholder="">
                  <option value="" />
                  {options
                    .filter((option) => option?.id !== course?.id)
                    .map((option, index) => (
                      <option key={index} value={option?.id}>
                        {option.course_name}
                      </option>
                    ))}
                </RHFSelect>

                <RHFSelect name="option_three" label="Option Three" placeholder="">
                  <option value="" />
                  {filteredOptions
                    .filter((option) => option?.id !== values?.option_two && option?.id !== course?.id)
                    .map((option, index) => (
                      <option key={index} value={option?.id}>
                        {option.course_name}
                      </option>
                    ))}
                </RHFSelect>

                {/* <RHFSelect name="option_two" label="Option Two" placeholder="">
                  <option value="" />
                  {options.map((option, index) => (
                    <option key={index} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </RHFSelect> */}

                {/* <RHFSelect name="option_three" label="Option Three" placeholder="">
                  <option value="" />
                  {options.map((option, index) => (
                    <option key={index} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </RHFSelect> */}
              </Stack>
              <Box
                sx={{
                  display: 'grid',
                  columnGap: 2,
                  rowGap: 3,
                  gridTemplateColumns: {
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                  },
                }}
              >
                <RHFTextField name="points" label="Points" />
                <RHFSelect name="accommodation" label="Accommodation">
                  <option value="" />
                  {ACCOMODATION_OPTION.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </RHFSelect>
                <RHFTextField name="next_of_kin_name" label="Next of Kin names" />
                <RHFTextField name="next_of_kin_number" label="Next of Kin Cell Phone Number" />
                <RHFTextField name="relationship" label="Relationship" />
                <RHFTextField name="next_of_kin_address" label="Next of Kin Physical Address" />
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  columnGap: 2,
                  rowGap: 3,
                  gridTemplateColumns: {
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                  },
                }}
              >
                <Stack spacing={3} mt={2} mb={2}>
                  <Typography
                    sx={{
                      color: '#000000',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      display: 'flex',
                      paddingLeft: '2px',
                    }}
                  >
                    Campus of Study :
                  </Typography>

                  <RHFRadioGroup
                    name="campus"
                    options={CAMPUS_OPTION}
                    sx={{
                      '& .MuiFormControlLabel-root': { mr: 4 },
                    }}
                  />
                </Stack>

                <Stack spacing={3} mt={2} mb={2}>
                  <Typography
                    sx={{
                      color: '#000000',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      display: 'flex',
                      paddingLeft: '2px',
                    }}
                  >
                    SPONSORSHIP :
                  </Typography>

                  <RHFRadioGroup
                    name="sponsorship"
                    options={SPONSORSHIP_OPTION}
                    sx={{
                      '& .MuiFormControlLabel-root': { mr: 4 },
                    }}
                  />
                </Stack>
              </Box>
              {values.sponsorship === 'Private Sponsorship' ? (
                <Stack spacing={3} mt={2} mb={2}>
                  <Box
                    sx={{
                      display: 'grid',
                      columnGap: 2,
                      rowGap: 3,
                      gridTemplateColumns: {
                        xs: 'repeat(1, 1fr)',
                        sm: 'repeat(2, 1fr)',
                      },
                    }}
                  >
                    <RHFTextField name="postqualification" label="Post School Qualification" />
                    <RHFTextField name="sponsorname" label="Sponsor Name" />
                    <RHFTextField name="sponsornumber" label="Sponsor Phone Number" />
                    <RHFTextField name="sponsoraddress" label="Sponsor Physical Address" />
                  </Box>
                </Stack>
              ) : (
                ''
              )}

              <Box sx={{ marginBottom: 2 }}>
                <Box
                  sx={{
                    display: 'grid',
                    columnGap: 2,
                    rowGap: 3,
                    gridTemplateColumns: {
                      xs: 'repeat(1, 1fr)',
                      sm: 'repeat(2, 1fr)',
                    },
                  }}
                >
                  <div>
                    <Typography variant="subtitle1" gutterBottom>
                      ID/Passport
                    </Typography>

                    <div
                      style={{
                        border: '1px dashed #0000FF',
                        borderRadius: '8px',
                      }}
                    >
                      <label htmlFor="copy_of_id" style={{ display: 'block' }}>
                        <input
                          id="idCopy"
                          type="file"
                          onChange={handleCopyOfIDFileChange}
                          style={{ display: 'none', border: 'none' }}
                        />
                        <Button component="span" size="large" fullWidth onClick={IDMethod}>
                          {label01}
                        </Button>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Typography variant="subtitle1" gutterBottom>
                      Results slip
                    </Typography>
                    <div
                      style={{
                        border: '1px dashed #0000FF',
                        borderRadius: '8px',
                      }}
                    >
                      <label htmlFor="results_slip" style={{ display: 'block' }}>
                        <input
                          id="resultsSlip"
                          type="file"
                          onChange={handleResultsSlipFileChange}
                          style={{ display: 'none', border: 'none' }}
                          multiple
                        />
                        <Button component="span" size="large" fullWidth onClick={ResultSlipMethod}>
                          {label02}
                        </Button>
                      </label>
                    </div>
                  </div>

                  {values.points > 30 && values.points < 36 ? (
                    <div>
                      <Typography variant="subtitle1" gutterBottom>
                        OVC Letter
                      </Typography>
                      <div
                        style={{
                          border: '1px dashed #0000FF',
                          borderRadius: '8px',
                        }}
                      >
                        <label htmlFor="ovcf" style={{ display: 'block' }}>
                          <input
                            id="ovc"
                            type="file"
                            onChange={handleOVCFileChange}
                            style={{ display: 'none', border: 'none' }}
                          />
                          <Button
                            component="span"
                            // variant="outlined"
                            size="large"
                            fullWidth
                            onClick={OvcMethod}
                          >
                            {label03}
                          </Button>
                        </label>
                      </div>
                    </div>
                  ) : (
                    ''
                  )}
                </Box>
              </Box>

              <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
                {record.role !== 'returningGuest' ? (
                  <Button
                    type="button"
                    color="inherit"
                    variant="outlined"
                    size="large"
                    onClick={() => {
                      navigate(PATH_DASHBOARD.general.apply);
                    }}
                  >
                    Discard
                  </Button>
                ) : (
                  <Button
                    type="button"
                    color="inherit"
                    variant="outlined"
                    size="large"
                    onClick={() => {
                      setEdit(true);
                    }}
                  >
                    Edit Files
                  </Button>
                )}
                <LoadingButton type="submit" variant="contained" loading={isSubmitting} size="large">
                  Submit
                </LoadingButton>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}

// ----------------------------------------------------------------------
