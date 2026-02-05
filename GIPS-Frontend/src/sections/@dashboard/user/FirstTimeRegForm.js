import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useSnackbar } from 'notistack';
import { useDispatch } from 'react-redux';

// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton, DesktopDatePicker } from '@mui/lab';
import { Box, Card, Grid, Stack, Typography, Button, FormControlLabel, Checkbox } from '@mui/material';
// utils
// routes
import axios from '../../../utils/axios';
import { PATH_DASHBOARD, PATH_AUTH } from '../../../routes/paths';
// _mock
import { countries } from '../../../_mock';
// components
import { FormProvider, RHFSelect, RHFSwitch, RHFTextField, RHFRadioGroup } from '../../../components/hook-form';
import { logout } from '../../../redux/slices/auth';

// ----------------------------------------------------------------------
const SPONSORSHIP_OPTION = ['Government Regular', 'Government Re-Instatement', 'Private Sponsorship'];
const STATUS_OPTION = ['Approve', 'Decline'];
const CAMPUS_OPTION = ['Gaborone', 'Francistown', 'Maun'];

FirstTimeRegForm.propTypes = {
  isEdit: PropTypes.bool,
  currentUser: PropTypes.object,
  applicantDetails: PropTypes.object,
};

export default function FirstTimeRegForm({ isEdit, currentUser, applicantDetails }) {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // ------------------------------ END HERE ----------------------------------------
  const [fileCopyOfID, setFileCopyOfID] = useState(null); // State for 'Copy of ID/Passport' file
  const [fileResultsSlip, setFileResultsSlip] = useState(null); // State for 'Copy of results slip' file
  const [fileDtef, setFileDTEF] = useState(null); // State for 'Copy of results slip' file
  const [edit, setEdit] = useState(false);
  const dispatch = useDispatch();

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

  const { enqueueSnackbar } = useSnackbar();

  const FirstTimeRegFormSchema = Yup.object().shape({
    accommodation: Yup.boolean,
    email: Yup.string(),
    telephone: Yup.string(),
    option_one: Yup.string(),
    option_two: Yup.string(),
    option_three: Yup.string(),
    country: Yup.string(),
    nextOfKin: Yup.string(),
    name: Yup.string(),
    nextOfKinNumber: Yup.string(),
    semester: Yup.string(),
    study_mode: Yup.string(),
    telphone: Yup.string(),
    sponsorship: Yup.string(),
    campus: Yup.string(),
    sponsorname: Yup.string(),
    sponsornumber: Yup.string(),
    physical_address: Yup.string(),
    academic_year: Yup.string(),
    relationship: Yup.string(),
  });

  const dateObject = new Date(applicantDetails?.date_of_birth);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = dateObject.toLocaleDateString('en-US', options);

  const defaultValues = useMemo(
    () => ({
      accommodation: currentUser?.accommodation === true ? 'Yes' : 'No',
      email: '',
      telephone: currentUser?.phoneNumber || '',
      option_one: applicantDetails?.expand?.option_one?.course_name || applicantDetails?.prog_name || '',
      option_two: applicantDetails?.expand?.option_two?.course_name || '',
      option_three: applicantDetails?.expand?.option_three?.course_name || '',
      country: currentUser?.country || '',
      next_of_kin_name: currentUser?.next_of_kin_name || '',
      name: applicantDetails?.username || '',
      firstname: applicantDetails?.firstname || currentUser?.names || '',
      lastname: applicantDetails?.lastname || currentUser?.surname || '',
      next_of_kin_number: currentUser?.next_of_kin_number || '',
      next_of_kin_address: currentUser?.next_of_kin_address || '',
      semester: currentUser.expand?.semester_id?.name || '',
      date_of_birth: formattedDate || '',
      studymode: currentUser?.study_mode || '',
      Id: applicantDetails?.national_id || applicantDetails?.idNumber || '',
      tr_number: applicantDetails?.tr_number || '',
      sponsorship: currentUser?.sponsorship || applicantDetails?.sponsor || '',
      sponsorname: currentUser?.sponsorname || '',
      sponsornumber: currentUser?.sponsornumber || '',
      physical_address: currentUser?.physical_address || '',
      year_of_study: currentUser?.year_of_study || '',
      relationship: currentUser?.relationship || '',
      campus: currentUser?.campus || '',
      postqualification: currentUser?.postqualification,
      sponsoraddress: currentUser?.sponsoraddress,
    }),

    [currentUser, applicantDetails]
  );

  const methods = useForm({
    resolver: yupResolver(FirstTimeRegFormSchema),
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
  const statusUpate = useRef('');
  const values = watch();

  const [modules, setModules] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const fetchModules = async () => {
        try {
          const courseId = applicantDetails.expand?.option_one?.id || applicantDetails.expand?.course_id?.id;
          const yearLevel = currentUser?.year_of_study?.slice(-1);

          const response = await axios.get('/v1/modules', {
            params: {
              course: courseId,
              year: yearLevel,
              perPage: 100,
            },
          });

          setModules(response.data.data || []);
        } catch (error) {
          console.error('Error fetching modules:', error);
        }
      };

      fetchModules();
    };
    fetch();
  }, [applicantDetails, currentUser]);

  useEffect(() => {
    if (isEdit && currentUser && applicantDetails) {
      reset(defaultValues);
    }

    if (!isEdit) {
      reset(defaultValues);
    }
    //   // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentUser, applicantDetails]);

  // view method
  const handleDownload = async (registrationId, field, name) => {
    try {
      const res = await axios.get(`/v1/registration/${registrationId}/file/${field}`);
      const fileUrl = res.data.data?.fileUrl;

      if (!fileUrl) {
        enqueueSnackbar('File not available', { variant: 'warning' });
        return;
      }

      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.download = name || field;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error fetching file:', error);
      enqueueSnackbar('Failed to load file', { variant: 'error' });
    }
  };


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

  let label;
  if (!edit) {
    label = 'View Copy of ID';
  } else {
    label = fileCopyOfID ? `Uploaded  ${fileCopyOfID.name}` : 'Click to upload';
  }

  let label02;
  if (!edit) {
    label02 = 'View Result Slip';
  } else {
    label02 = fileResultsSlip ? `Uploaded ${fileResultsSlip.name}` : 'Click to upload';
  }

  let label03;
  if (!edit && currentUser?.sponsorship_letter) {
    label03 = 'View Sponsorship Letter';
  } else {
    label03 = fileDtef ? `Uploaded ${fileDtef.name}` : 'Click to upload';
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(!submitting);
      let blob;
      let blob1;
      let blob2;

      console.log({ currentUser });

      const getExistingBlob = async (field) => {
        try {
          const res = await axios.get(`/v1/registration/${currentUser?.id}/file/${field}`);
          const fileUrl = res.data.data?.fileUrl;
          if (!fileUrl) return null;
          return await fetchFileFromURL(fileUrl);
        } catch (err) {
          return null;
        }
      };

      if (currentUser?.copy_of_id) blob = await getExistingBlob('copy_of_id');
      if (currentUser?.results_slip) blob1 = await getExistingBlob('results_slip');
      if (currentUser?.sponsorship_letter) blob2 = await getExistingBlob('sponsorship_letter');


      const modulesJSON = JSON.stringify(modules);

      const formData = new FormData();
      formData.append('names', applicantDetails?.firstname || currentUser.names);
      formData.append('surname', applicantDetails?.lastname || currentUser.surname);
      formData.append('prog_name', applicantDetails?.expand?.option_one?.course_name || currentUser.prog_name);
      formData.append('email', applicantDetails?.email);
      formData.append('prog_code', applicantDetails.expand?.option_one?.program_code || currentUser.prog_code);
      formData.append('course_id', applicantDetails.expand?.option_one?.id || currentUser.course_id);
      formData.append('study_mode', applicantDetails?.study_mode);
      formData.append('date_of_birth', applicantDetails?.date_of_birth);
      formData.append('inst', 'GIPS - GABORONE CENTRE');
      formData.append('tr_number', values.tr_number);
      formData.append('campus', currentUser?.campus);
      formData.append('sponsor', currentUser?.sponsorship || currentUser.sponsor);
      formData.append('accomo', currentUser?.accommodation || currentUser.accomo);
      formData.append('year_of_study', currentUser?.year_of_study);
      formData.append('semester_id', currentUser.expand?.semester_id?.id || currentUser.semester_id);
      formData.append('sem_start_date', currentUser.expand?.semester_id?.start_date);
      formData.append('sem_end_date', currentUser.expand?.semester_id?.end_date);
      formData.append('modules', modulesJSON);
      formData.append('user_id', applicantDetails.userid);
      formData.append('idNumber', applicantDetails.national_id || currentUser.idNumber);
      formData.append('country', applicantDetails.country);
      formData.append('phoneNumber', applicantDetails.phoneNumber);
      formData.append('next_of_kin_name', values.next_of_kin_name);
      formData.append('next_of_kin_number', values.next_of_kin_number);
      formData.append('next_of_kin_address', values.next_of_kin_address);
      formData.append('relationship', values.relationship);
      formData.append('reg_status', 'pending');
      formData.append('dtef_status', 'pending');
      formData.append('copy_of_id', fileCopyOfID || blob, currentUser.copy_of_id);
      formData.append('results_slip', fileResultsSlip || blob1, currentUser.results_slip);
      formData.append('sponsorship_letter', fileDtef || blob2, currentUser.sponsorship_letter);

      if (!currentUser?.tr_number) {
        axios.post('/v1/registration', formData).then(() => {
          enqueueSnackbar('Registration completed successfully');
          setSubmitting(false);
          dispatch(logout());
          navigate(PATH_AUTH.login, { replace: true });
        });
      } else {
        axios.patch(`/v1/registration/${currentUser.id}/mine`, formData).then(() => {
          enqueueSnackbar('Registration Updated successfully');
          setSubmitting(false);
          navigate(PATH_DASHBOARD.root);
        });
      }
    } catch (error) {
      console.error(error);
      setSubmitting(!submitting);
    }
  };

  return (
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
              <RHFTextField name="firstname" label="First Name" disabled={!edit} />
              <RHFTextField name="lastname" label="Last Name" disabled={!edit} />
              <RHFTextField name="date_of_birth" label="Date of Birth" disabled={!edit} />
              <RHFSelect name="country" label="Country" placeholder="Country" disabled={!edit}>
                <option value="" />
                {countries.map((option) => (
                  <option key={option.code} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </RHFSelect>
            </Box>
            <Stack spacing={3} mt={2} mb={2}>
              <RHFTextField name="Id" label="ID NO:" disabled={!edit} />
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
              <RHFTextField name="physical_address" label="Physical Address" disabled={!edit} />
              <RHFTextField name="telephone" label="Telephone" disabled={!edit} />

              <RHFTextField
                name="tr_number"
                label="TR Number"
                error={!values.tr_number && true}
                disabled={currentUser.tr_number && !edit}
              />
              <RHFTextField name="studymode" label="Study Mode" disabled={!edit} />

              <RHFTextField name="year_of_study" label="Academic Year" disabled={!edit} />
              <RHFTextField name="semester" label="Semester" disabled />
              {/* <RHFSelect name="semester" label="Semester"  error={!values.semester && true}>
                <option value="" />
                {semesters?.map((option, index) => (
                  <option key={index} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </RHFSelect> */}
            </Box>
            <Stack spacing={3} mt={2} mb={2}>
              <RHFTextField name="option_one" label="Programe Name" placeholder="" disabled />

              <RHFTextField name="accommodation" label="Accomodation" disabled />
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
              <RHFTextField name="next_of_kin_name" label="Next of Kin names" disabled={!edit} />
              <RHFTextField name="next_of_kin_number" label="Next of Kin Cell Phone Number" disabled={!edit} />
              <RHFTextField name="relationship" label="Relationship" disabled={!edit} />
              <RHFTextField name="next_of_kin_address" label="Next of Kin Physical Address" disabled={!edit} />
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
                  disable={!edit}
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
                  disable={!edit}
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
                      <Button
                        component="span"
                        size="large"
                        fullWidth
                        onClick={
                          edit
                            ? () => document.getElementById('idCopy').click()
                            : () =>
                                handleDownload(currentUser?.id, 'copy_of_id', `${currentUser.copy_of_id} Copy of ID`)
                        }
                      >
                        {label}
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
                      />
                      <Button
                        component="span"
                        size="large"
                        fullWidth
                        onClick={
                          edit
                            ? () => document.getElementById('resultsSlip').click()
                            : () =>
                                handleDownload(currentUser?.id, 'results_slip', `${currentUser.results_slip} Copy of Results slip`)
                        }
                      >
                        {label02}
                      </Button>
                    </label>
                  </div>
                </div>
              </Box>
            </Box>

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
                      SPONSORSHIP INFORMATION :
                    </Typography>
                    <div>
                      {fileDtef || currentUser?.sponsorship_letter ? (
                        <Typography
                          variant="subtitle"
                          gutterBottom
                          sx={{
                            color: '#000000',
                            fontSize: '13px',
                            display: 'flex',
                            paddingLeft: '2px',
                          }}
                        >
                          {' '}
                          Copy of DTEF Sponsorship letter/ Proof of Payment *
                        </Typography>
                      ) : (
                        <Typography
                          variant="subtitle"
                          gutterBottom
                          sx={{
                            color: '#e53e30',
                            fontSize: '13px',
                            display: 'flex',
                            paddingLeft: '2px',
                          }}
                        >
                          {' '}
                          Copy of DTEF Sponsorship letter/ Proof of Payment *
                        </Typography>
                      )}

                      <div
                        style={{
                          border: fileDtef || currentUser?.sponsorship_letter ? '1px dashed #0000FF' : '1px dashed red',
                          borderRadius: '8px',
                        }}
                      >
                        <label htmlFor="fileDTEF" style={{ display: 'block' }}>
                          <input
                            id="dtef"
                            type="file"
                            onChange={handleDTEFFileChange}
                            style={{
                              display: 'none',
                              border: 'none',
                              outline: 'none',
                            }}
                          />
                          <Button
                            component="span"
                            size="large"
                            fullWidth
                            onClick={
                            edit || !currentUser?.sponsorship_letter
                                ? () => document.getElementById('dtef').click()
                                : () =>
                                    handleDownload(
                                      currentUser?.id,
                                      'sponsorship_letter',
                                      `${currentUser?.sponsorship_letter} Copy of Sponsorship Letter`
                                    )
                            }
                          >
                            {label03}
                          </Button>
                        </label>
                      </div>
                    </div>
                  </Stack>
                </div>
              </Box>
              <Typography variant="subtitle1" gutterBottom>
                Course Modules
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  columnGap: 2,
                  rowGap: 1,
                  gridTemplateColumns: {
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                  },
                }}
              >
                {modules.map((item, index) => (
                  <Typography
                    variant="subtitle"
                    gutterBottom
                    sx={{
                      color: '#909eaa',
                      fontSize: '13px',
                      display: 'flex',
                      paddingLeft: '2px',
                    }}
                    disabled
                  >{`-  ${item.name}`}</Typography>
                ))}
              </Box>
            </Box>
            <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
              <Button type="button" color="inherit" variant="outlined" size="large">
                Discard
              </Button>
              <Button onClick={() => setEdit(!edit)} type="button" color="inherit" variant="outlined" size="large">
                Edit
              </Button>
              {currentUser?.sponsorship_letter ? (
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={submitting}
                  size="large"
                  disabled={
                    (!values?.tr_number && true) || (!currentUser?.sponsorship_letter && true) || (submitting && true)
                  }
                >
                  Finish
                </LoadingButton>
              ) : (
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={submitting}
                  size="large"
                  disabled={(fileDtef === '' && true) || (values.tr_number === '' && true)}
                >
                  Finish
                </LoadingButton>
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

// ----------------------------------------------------------------------
