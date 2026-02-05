import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useState, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import {
  Card,
  Stack,
  Button,
  Grid,
  Box,
  Typography, InputBase,
  Dialog,
  Divider,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { TemplateTranscriptPreview } from '../blog';
import Iconify from '../../../components/Iconify';
import axios from '../../../utils/axios';
import { PATH_DASHBOARD } from '../../../routes/paths';
import { FormProvider, RHFSelect, RHFTextField } from '../../../components/hook-form';

const ACCOMODATION_OPTION = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
];
const STUDY_MODE_OPTION = ['Full time', 'Part time', 'Online'];
const COURSE_TYPE_OPTION = ['Diploma', 'Advanced Diploma', 'Bachelor Degree'];
const COURSE_LOCATION_OPTION = ['Gaborone', 'Francistown', 'Maun', 'All'];
const SPONSORHIP_OPTION = ['Government Regular', 'Government Reinstatement', 'Private Sponsorship', 'All'];

CourseNewForm.propTypes = {
  isEdit: PropTypes.bool,
  courseData: PropTypes.object,
};

export default function CourseNewForm({ isEdit, courseData, students }) {
  console.log({ students })
  const [open, setOpen] = useState(false);

  const handleOpenPreview = () => {
    setOpen(true);
  };

  const handleClosePreview = () => {
    setOpen(false);
  };

  const onDownloadTranscript = () => {
    console.log('Transcripted Download ');
    alert('Transcript Downloaded');
  };
  const [query, setQuery] = useState('');

  const [faculties, setFaculties] = useState([]);
  const { record } = useSelector((state) => {
    return state.user;
  });
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [id, setID] = useState('');

  const NewCourseSchema = Yup.object().shape({
    course_code: Yup.string().required('Course code is required'),
    course_name: Yup.string().required('Course name is required'),
    duration: Yup.number().required('Duration is required'),
    level: Yup.string().required('Level is required'),
    type: Yup.string().required('Type is required'),
    faculty: Yup.string().required('Faculty is required'),
    centre: Yup.string().required('Centre is required'),
    sponsorship_options: Yup.string().required('Sponsorship options is required'),
    total_credits: Yup.number().required('Total credits is required'),
    facilitator: Yup.string().required('Facilitator is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewCourseSchema),
    defaultValues: {
      firstname: courseData?.firstname || '',
      last_name: courseData?.firstname || '',
      course_name: courseData?.prog_name || '',
      study_mode: courseData?.duration || '',
      national_id: courseData?.duration || '',
      phone_Number: courseData?.duration || '',
      level: courseData?.level || '',
      sponsor: courseData?.sponsorship_options || ''
    },
  });

  const {
    reset,
    setValue,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (isEdit && courseData) {
      reset({
        firstname: courseData?.firstname || '',
        course_name: courseData?.course_name || '',
        // set other default values...
      });
    }
  }, [courseData, reset, isEdit]);

  useEffect(() => {
    axios.get('/v1/faculties').then((response) => {
      setFaculties(response.data);
    });
  }, []);

  useEffect(() => {
    const fetchFilteredStudents = async () => {
      const filteredResults = students.filter((student) => {
        return (
          student?.tr_number.toLowerCase().includes(query.toLowerCase()) ||
          student?.national_id.toString().toLowerCase().includes(query.toLowerCase()) 
        );
      });

      if (filteredResults.length > 0) {
        setID(filteredResults[0].id);
        // If search results exist, set the form values with the first result
        setValue('firstname', filteredResults[0]?.firstname);
        setValue('last_name', filteredResults[0]?.lastname);
        setValue('phone_Number', filteredResults[0]?.phoneNumber);
        setValue('course_name', filteredResults[0]?.prog_name);
        setValue('sponsorship_options', filteredResults[0]?.sponsor);
        setValue('national_id', filteredResults[0]?.national_id);
        setValue('sponsor', filteredResults[0]?.sponsor);
        setValue('tr_number', filteredResults[0]?.tr_number);
        setValue('study_mode', filteredResults[0]?.study_mode);
        setValue('level', filteredResults[0]?.year_of_study);

        // Set other fields as needed
      }
    };

   if(query.trim() !== ""){
 fetchFilteredStudents();
}else{
  reset()
}


  }, [query]);

  const onSubmit = async (data) => {
    console.log("")
    // if (isEdit) {
    //   updateCourse(data);
    // } else {
    //   createCourse(data);
    // }
  };

  const updateCourse = async (data) => {
    try {
      await axios.patch(`/v1/courses/${data.id}`, data);
      enqueueSnackbar('Course updated successfully!');
      navigate(PATH_DASHBOARD.superAdmin.courseList);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error updating course!', { variant: 'error' });
    }
  };

  const createCourse = async (data) => {
    try {
      await axios.post('/v1/courses', data);
      enqueueSnackbar('Course created successfully!');
      navigate(PATH_DASHBOARD.superAdmin.courseList);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error creating course!', { variant: 'error' });
    }
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Dialog fullWidth maxWidth="sm" open={open}>
          <DialogTitle>Hello World</DialogTitle>
          <DialogContent>
            <Stack spacing={3}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              </Typography>
            </Stack>
          </DialogContent>
          <Divider />
          <DialogActions>
            <Button color="inherit" variant="outlined" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <LoadingButton variant="contained" loading={isSubmitting} type="submit">
              Okay
            </LoadingButton>
          </DialogActions>
        </Dialog>

        <Grid container spacing={3}>
          <Grid item xs={12} md={16}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'end', width: '100%' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '8px',
                    border: '1px solid #dce0e4',
                    width: '30%',
                  }}
                >
                  <Iconify
                    icon="eva:search-fill"
                    sx={{ color: 'text.disabled', width: 20, height: 20, marginLeft: '10px' }}
                  />
                  <InputBase
                    placeholder="Search by tr number or id number..."
                    style={{
                      color: '#919eab',
                      fontStyle: 'semibold',
                      fontSize: '14px',
                      padding: '10px 5px',
                      width: '100%',
                    }}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </Box>
              </Box>
              <Stack spacing={3} mt={2} mb={2} />
              <Box sx={{ display: 'grid', columnGap: 2, rowGap: 3, gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' } }}>
                <RHFTextField name="firstname" label="Firstname" />
                <RHFTextField name="last_name" label="Lastname" />
                <RHFTextField name="phone_Number" label="Student Number" />
                <RHFTextField name="national_id" label="National ID" />
              </Box>
              <Stack spacing={3} mt={2} mb={2} />
              <Box sx={{ display: 'grid', columnGap: 1, rowGap: 3, gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(1, 1fr)' } }}>
                <RHFTextField name="course_name" label="Programme of Study" />
              </Box>
              <Stack spacing={3} mt={2} mb={2} />

              <Box sx={{ display: 'grid', columnGap: 2, rowGap: 3, gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' } }}>
                <RHFTextField name="sponsor" label="Sponsor" />
                <RHFTextField name="level" label="Year of Study" />
                <RHFTextField name="study_mode" label="Study Mode" />
                <RHFTextField name="national_id" label="National ID" />
              </Box>


              <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
                <Button
                  type="button"
                  color="inherit"
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    navigate(PATH_DASHBOARD.superAdmin.transcriptsList);
                  }}
                >
                  Discard
                </Button>
                <LoadingButton
                  loading={isSubmitting}
                  type="submit"
                  variant="contained"
                  onClick={handleOpenPreview}
                  sx={{ textTransform: 'capitalize' }}
                >
                  {isEdit ? 'Save Changes' : 'Preview '}
                </LoadingButton>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
      <TemplateTranscriptPreview values={id} isOpen={open} onClose={handleClosePreview} onSubmit={onDownloadTranscript} />
    </>
  );
}
