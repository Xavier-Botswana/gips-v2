import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useState, useEffect, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton, DesktopDatePicker } from '@mui/lab';
import { Box, Card, Grid, Stack, Typography, Button, TextField } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// _mock
import { countries } from '../../../_mock';
// components
import { FormProvider, RHFSelect, RHFTextField, RHFRadioGroup } from '../../../components/hook-form';
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------
const CAMPUS_OPTION = ['Gaborone', 'Francistown', 'Maun'];
const SPONSORSHIP_OPTION = ['Government Regular', 'Government Re-Instatement', 'Private Sponsorship'];
UserNewForm.propTypes = {
  isEdit: PropTypes.bool,
  currentUser: PropTypes.object,
};

export default function UserNewForm({ currentUser, isEdit }) {
  const [courseList, setCourseList] = useState([]);
  const [semesterList, setSemesterList] = useState([]);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const getCourses = async () => {
      try {
        const response = await axios.get('/v1/courses');
        setCourseList(response.data?.courses || []);
      } catch (error) {
        console.error('Failed to load courses', error);
        enqueueSnackbar('Unable to load courses. Please try again later.', { variant: 'error' });
      }
    };

    const getSemester = async () => {
      try {
        const response = await axios.get(`/v1/semesters`);
        setSemesterList(response.data || []);
      } catch (error) {
        console.error('Failed to load semesters', error);
        enqueueSnackbar('Unable to load semesters. Please try again later.', { variant: 'error' });
      }
    };

    getSemester();
    getCourses();
  }, [enqueueSnackbar]);

  const NewUserSchema = Yup.object().shape({
    firstname: Yup.string().required('First name is required'),
    lastname: Yup.string().required('Last name is required'),
    gender: Yup.string().required('Gender is required'),
    email: Yup.string().required('Email is required').email('Enter a valid email'),
    phoneNumber: Yup.string().required('Phone number is required'),
    country: Yup.string().required('Country is required'),
    national_id: Yup.string().required('ID number is required'),
    date_of_birth: Yup.string().required('Date of birth is required'),
    course_id: Yup.string().required('Course is required'),
    semester_id: Yup.string().required('Semester is required'),
    study_mode: Yup.string().required('Study mode is required'),
    year_of_study: Yup.string().required('Year of study is required'),
    studentNo: Yup.string().required('Student number is required'),
    campus: Yup.string().required('Campus selection is required'),
    sponsorship: Yup.string().required('Sponsorship is required'),
  });

  // const dateObject = new Date(currentUser?.date_of_birth);
  // const options = { year: 'numeric', month: 'long', day: 'numeric' };
  // const formattedDate = dateObject.toLocaleDateString('en-US', options);

  const defaultValues = useMemo(() => {
    const accomoValue = (() => {
      if (currentUser?.accomo === 'true') return 'Yes';
      if (currentUser?.accomo === 'false') return 'No';
      return currentUser?.accomo || '';
    })();

    return {
      firstname: currentUser?.firstname || '',
      lastname: currentUser?.lastname || '',
      gender: currentUser?.gender || '',
      date_of_birth: currentUser?.date_of_birth || '',
      country: currentUser?.country || '',
      national_id: currentUser?.national_id || '',
      tr_number: currentUser?.tr_number || '',
      phoneNumber: currentUser?.phoneNumber || '',
      email: currentUser?.email || '',
      studentNo: currentUser?.studentNo || '',
      year_of_study: currentUser?.year_of_study || '',
      study_mode: currentUser?.study_mode || '',
      course_id: currentUser?.course_id || '',
      semester_id: currentUser?.semester_id || '',
      accomo: accomoValue,
      physical_address: currentUser?.physical_address || '',
      next_of_kin_name: currentUser?.next_of_kin_name || '',
      next_of_kin_number: currentUser?.next_of_kin_number || '',
      campus: currentUser?.campus || '',
      sponsorship: currentUser?.sponsorship || currentUser?.sponsor || '',
    };
  }, [currentUser]);

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (isEdit && currentUser) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentUser]);

  const onSubmit = useCallback(
    async (formValues) => {
      try {
        const userPayload = {
          email: formValues.email,
          emailVisibility: true,
          name: `${formValues.firstname} ${formValues.lastname}`.trim(),
          password: 'password1234',
          passwordConfirm: 'password1234',
          role: 'student',
        };

        const userResponse = await axios.post('/v1/users', userPayload);
        const createdUser =
          userResponse?.data?.user || userResponse?.data?.record || userResponse?.data;
        const userId = createdUser?.id;

        if (!userId) {
          throw new Error('User account was created but no user id was returned.');
        }

        const selectedCourse = courseList.find(
          (course) =>
            String(course?.id ?? course?.course_id ?? course?.name) === String(formValues.course_id)
        );
        const selectedSemester = semesterList.find(
          (semester) =>
            String(semester?.id ?? semester?.semester_id ?? semester?.name) ===
            String(formValues.semester_id)
        );

        const studentPayload = {
          ...formValues,
          user_id: userId,
          email: createdUser?.email || formValues.email,
          phoneNumber: formValues.phoneNumber,
          course_id: selectedCourse?.id || formValues.course_id,
          prog_name: selectedCourse?.course_name || selectedCourse?.name,
          semester_id: selectedSemester?.id || formValues.semester_id,
          semesterName: selectedSemester?.name,
          sponsor: formValues.sponsorship,
          reg_status: 'approved',
        };

        await axios.post('/v1/students', studentPayload);
        await axios.patch(`/v1/users/${userId}`, { role: 'student' });

        enqueueSnackbar('Student created successfully!');
        navigate(PATH_DASHBOARD.admissions.studentslist);
      } catch (error) {
        console.error('Failed to create student', error);
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Something went wrong while creating the student.';
        enqueueSnackbar(message, { variant: 'error' });
      }
    },
    [courseList, enqueueSnackbar, navigate, semesterList]
  );

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
              <RHFTextField name="firstname" label="First Name" />
              <RHFTextField name="lastname" label="Last Name" />
              <RHFSelect name="gender" label="Gender">
                <option value="" />
                {['Male', 'Female'].map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </RHFSelect>
              <Controller
                name="date_of_birth"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DesktopDatePicker
                    label="Date of Birth"
                    inputFormat="yyyy-MM-dd"
                    value={field.value ? new Date(field.value) : null}
                    onChange={(newValue) => {
                      const isoValue = newValue ? new Date(newValue).toISOString().split('T')[0] : '';
                      field.onChange(isoValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                )}
              />
              <RHFSelect name="country" label="Country" placeholder="Country">
                <option value="" />
                {countries.map((option) => (
                  <option key={option.code} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </RHFSelect>
              <RHFTextField name="national_id" label="ID NO:" />
              <RHFTextField name="tr_number" label="Tr Number" />
              <RHFTextField name="phoneNumber" label="Phone Number" />
              <RHFTextField name="email" label="Email Address" />
              <RHFTextField name="studentNo" label="Student No" />
              <RHFSelect name="year_of_study" label="Year of Study">
                <option value="" />
                {['Year 1', 'Year 2', 'Year 3', 'Year 4'].map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </RHFSelect>

              <RHFSelect name="study_mode" label="Study Mode">
                <option value="" />
                {['Full time', 'Part Time'].map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </RHFSelect>

              <RHFSelect name="course_id" label="Course/Programme">
                <option value="" />
                {courseList.map((option) => {
                  const optionId = option.id || option.course_id || option.name;
                  return (
                    <option key={optionId} value={optionId}>
                      {option.course_name || option.name}
                    </option>
                  );
                })}
              </RHFSelect>
              <RHFSelect name="semester_id" label="Semester">
                <option value="" />
                {semesterList.map((option) => {
                  const optionId = option.id || option.semester_id || option.name;
                  return (
                    <option key={optionId} value={optionId}>
                      {option.name}
                    </option>
                  );
                })}
              </RHFSelect>

              <RHFSelect name="accomo" label="Accomodation">
                <option value="" />{' '}
                {['Yes', 'No'].map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </RHFSelect>

              <RHFTextField name="physical_address" label="Physical Address" />

              <RHFTextField name="next_of_kin_name" label="Next of Kin names" />
              <RHFTextField name="next_of_kin_number" label="Next of Kin Cell Phone Number" />
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
              <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
                Finish
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
