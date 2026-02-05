import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, Stack, Typography, Button } from '@mui/material';
// utils
import axios from '../../../utils/axios';
import { fData } from '../../../utils/formatNumber';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// _mock
import { countries } from '../../../_mock';
// components
import Label from '../../../components/Label';
import { FormProvider, RHFSelect, RHFSwitch, RHFTextField, RHFRadioGroup } from '../../../components/hook-form';

// ----------------------------------------------------------------------
const SPONSORSHIP_OPTION = ['Government Regular', 'Government Re-Instatement', 'Private Sponsorship', 'MINISTRY','SELF SPONSORED'];
UserNewForm.propTypes = {
  isEdit: PropTypes.bool,
  currentUser: PropTypes.object,
};

export default function UserNewForm({ isEdit, currentUser }) {
  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();
  const [applicationFiles, setApplicationFiles] = useState(null);
  const [fileCopyOfID, setFileCopyOfID] = useState(null);
  const [fileResultsSlip, setFileResultsSlip] = useState(null);

  const NewUserSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().required('Email is required').email(),
    phoneNumber: Yup.string().required('Phone number is required'),
    address: Yup.string().required('Address is required'),
    country: Yup.string().required('country is required'),
    company: Yup.string().required('Company is required'),
    state: Yup.string().required('State is required'),
    city: Yup.string().required('City is required'),
    role: Yup.string().required('Role Number is required'),
    avatarUrl: Yup.mixed().test('required', 'Avatar is required', (value) => value !== ''),
  });

  const dateObject = new Date(currentUser?.date_of_birth);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = dateObject.toLocaleDateString('en-US', options);

  const toDateInputValue = (value) => {
    if (!value) return '';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
  };

 const defaultValues = useMemo(() => {
    const accommodationFlag =
      currentUser?.accommodation ?? currentUser?.accomo ?? currentUser?.accommodation;

    let accommodationValue = '';
    if (accommodationFlag === true || accommodationFlag === 'true') {
      accommodationValue = 'true';
    } else if (accommodationFlag === false || accommodationFlag === 'false') {
      accommodationValue = 'false';
    }

    return {
      accomo: accommodationValue,
      email: currentUser?.email || '',
      telephone: currentUser?.phoneNumber || '',
      course: currentUser?.prog_name || '',
      country: currentUser?.country || '',
      next_of_kin_name: currentUser?.next_of_kin_name || '',
      name: currentUser?.username || '',
      firstname: currentUser?.firstname || '',
      lastname: currentUser?.lastname || '',
      next_of_kin_number: currentUser?.next_of_kin_number || '',
      next_of_kin_address: currentUser?.next_of_kin_address || '',
      semester: currentUser?.semesterName || '',
      date_of_birth: toDateInputValue(currentUser?.date_of_birth) || '',
      Id: currentUser?.national_id || '',
      sponsor: currentUser?.sponsor || '',
      sponsorname: currentUser?.sponsorname || '',
      sponsornumber: currentUser?.sponsornumber || '',
      physical_address: currentUser?.physical_address || '',
      year_of_study: currentUser?.year_of_study || '',
      study_mode: currentUser?.study_mode || '',
      relationship: currentUser?.relationship || '',
      campus: currentUser?.campus || '',
      postqualification: currentUser?.postqualification,
      sponsoraddress: currentUser?.sponsoraddress,
      fileCopyOfID: currentUser?.copy_of_id,
      sponsorship_start_date: toDateInputValue(currentUser?.sponsorship_start_date),
      sponsorship_end_date: toDateInputValue(currentUser?.sponsorship_end_date),
      date_of_registration: toDateInputValue(currentUser?.date_of_registration),
     };
  }, [currentUser]);

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

  useEffect(() => {
    if (isEdit && currentUser) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentUser]);

  const onSubmit = async (e) => {
    e.preventDefault();


    console.log({currentUser})

    try {
      axios.patch(`/v1/students/${currentUser.id}`, values).then(() => {  
      });

    

      await axios.patch(`/v1/users/${currentUser.user_id}`, {
        email: values.email
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      enqueueSnackbar('Update success!');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file) {
        setValue(
          'avatarUrl',
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        );
      }
    },
    [setValue]
  );

  const handleDownload = async (applicationId, field) => {
    if (!applicationId || !field) {
      enqueueSnackbar('File not available', { variant: 'warning' });
      return;
    }

    try {
      const res = await axios.get(`/v1/applications/${applicationId}/file/${field}`);
      const fileUrl = res.data.data?.fileUrl;

      if (!fileUrl) {
        enqueueSnackbar('File not available', { variant: 'warning' });
        return;
      }

      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error fetching file:', error);
      enqueueSnackbar('Failed to load file', { variant: 'error' });
    }
  };

  const fetchApplicationFiles = useCallback(async () => {
    if (!currentUser?.user_id) return;

    try {
      // Staff path: load application linked to the user's guest record.
      const res = await axios.get(`/v1/applications/user/${currentUser.user_id}`);
      setApplicationFiles(res.data.data || null);
    } catch (error) {
      // Fallback for guest/self-service flows
      try {
        const mine = await axios.get('/v1/applications/mine', { params: { page: 1, limit: 1 } });
        setApplicationFiles(mine.data.data?.[0] || null);
      } catch (err) {
        console.error('Error fetching application files:', err);
        setApplicationFiles(null);
      }
    }
  }, [currentUser?.user_id]);

  useEffect(() => {
    fetchApplicationFiles();
  }, [fetchApplicationFiles]);

  const handleSaveFiles = async () => {
    if (!applicationFiles?.id) {
      enqueueSnackbar('No linked application found for this student', { variant: 'warning' });
      return;
    }

    if (!fileCopyOfID && !fileResultsSlip) {
      enqueueSnackbar('Select a file to upload before saving', { variant: 'warning' });
      return;
    }

    try {
      const formData = new FormData();
      if (fileCopyOfID) formData.append('copy_of_id', fileCopyOfID);
      if (fileResultsSlip) formData.append('results_slip', fileResultsSlip);

      let res;

      try {
        res = await axios.patch(`/v1/applications/${applicationFiles.id}/files`, formData);
      } catch (error) {
        // Fallback to self-service endpoint if staff endpoint is not permitted
        res = await axios.patch(`/v1/applications/${applicationFiles.id}/mine/files`, formData);
      }

      enqueueSnackbar('Files updated');
      if (res?.data?.data) {
        setApplicationFiles(res.data.data);
      } else {
        fetchApplicationFiles();
      }
      setFileCopyOfID(null);
      setFileResultsSlip(null);
    } catch (error) {
      console.error('Error updating files:', error);
      enqueueSnackbar('Failed to update files', { variant: 'error' });
    }
  };

  const fileSource = applicationFiles || currentUser;
  const fileRecordId = applicationFiles?.id;

    const resultsSlipFileName = useMemo(() => {
    const slip = fileSource?.results_slip;
    if (Array.isArray(slip)) return slip[0] || '';
    return slip || '';
  }, [fileSource]);
  const hasResultsSlip = useMemo(() => {
    if (Array.isArray(fileSource?.results_slip)) return fileSource.results_slip.length > 0 && Boolean(fileSource.results_slip[0]);
    return Boolean(fileSource?.results_slip);
  }, [fileSource]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
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
                label="Date of Birth"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
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
              <RHFTextField name="Id" label="ID NO:" />
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
                mt: 2,
              }}
            >
              <RHFTextField name="study_mode" label="Study Mode" />
              <RHFTextField name="telephone" label="Telephone" />
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
                mt: 2,
              }}
            >
              <RHFTextField name="year_of_study" label="Academic Year" />
              <RHFTextField name="semester" label="Semester" />
            </Box>
            <Stack spacing={3} mt={2} mb={2}>
              <RHFTextField name="email" label="Email Address" />
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
                mt: 2,
              }}
            >
              <RHFTextField name="course" label="Course" />
              <RHFSelect name="accomo" label="Accommodation">
                <option value="" />
                <option value="true">On campus</option>
                <option value="false">Off campus</option>
              </RHFSelect>
              <RHFTextField name="physical_address" label="Physical Address" />
              <RHFTextField
                name="date_of_registration"
                label="Date of Registration"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
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
                mt: 2,
                mb: 2,
              }}
            >
              <RHFTextField
                name="sponsorship_start_date"
                label="Sponsorship Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
              <RHFTextField
                name="sponsorship_end_date"
                label="Sponsorship End Date"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
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
                mt: 2,
              }}
            >
              <RHFTextField name="next_of_kin_name" label="Next of Kin names" />
              <RHFTextField name="next_of_kin_number" label="Next of Kin Cell Phone Number" />
            </Box>

            <Stack spacing={2} mt={4}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: '#000000' }}
              >
                Student Files
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                }}
              >
                <Box
                  sx={{
                    border: '1px dashed #0000FF',
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Copy of ID/Passport
                  </Typography>
                  <Stack spacing={1.5}>
                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                      disabled={!fileSource?.copy_of_id}
                      onClick={() =>
                        handleDownload(fileRecordId, 'copy_of_id')
                      }
                    >
                      {fileSource?.copy_of_id ? 'View Copy of ID' : 'No file uploaded'}
                    </Button>
                    <Button
                      component="label"
                      variant="contained"
                      color="primary"
                      size="large"
                      fullWidth
                    >
                      Upload New
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => setFileCopyOfID(e.target.files?.[0] || null)}
                      />
                    </Button>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    border: '1px dashed #0000FF',
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Results Slip
                  </Typography>
                  <Stack spacing={1.5}>
                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                     disabled={!hasResultsSlip}
                      onClick={() =>
                        handleDownload(fileRecordId, 'results_slip')
                      }
                    >
                      {hasResultsSlip ? 'View Results Slip' : 'No file uploaded'}
                    </Button>
                    <Button
                      component="label"
                      variant="contained"
                      color="primary"
                      size="large"
                      fullWidth
                    >
                      Upload New
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => setFileResultsSlip(e.target.files?.[0] || null)}
                      />
                    </Button>
                  </Stack>
                </Box>
              </Box>
              <Stack direction="row" justifyContent="flex-end">
                <Button variant="contained" onClick={handleSaveFiles}>
                  Save Files
                </Button>
              </Stack>
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
                name="sponsor"
                options={SPONSORSHIP_OPTION}
                sx={{
                  '& .MuiFormControlLabel-root': { mr: 4 },
                }}
              />
            </Stack>

            <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
              <Button
                type="button"
                color="inherit"
                variant="outlined"
                size="large"
                onClick={() => {
                  navigate(PATH_DASHBOARD.admissions.studentslist);
                }}
              >
                Discard
              </Button>
              <Button type="submit" variant="contained" size="large">
                Finish
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
