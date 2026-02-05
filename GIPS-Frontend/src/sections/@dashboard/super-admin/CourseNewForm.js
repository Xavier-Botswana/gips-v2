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
  Typography,
  Dialog,
  Divider,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import axios from '../../../utils/axios';

// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// _mock
// components
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

export default function CourseNewForm({ isEdit, courseData }) {
  // Get the query parameters from the URL
  const queryParams = new URLSearchParams(window.location.search);

  const [open, setOpen] = useState(false);

  const [openSent, setOpenSent] = useState(false);
  const [visible, setVisible] = useState(false);
  const [file, setFile] = useState(null); // State for 'Copy of results slip' file

  const navigate = useNavigate();
  const [faculties, setFaculties] = useState([]);
  const [template, setTemplate] = useState(null);

  const { record } = useSelector((state) => {
    return state.user;
  });

  const { enqueueSnackbar } = useSnackbar();

  const [edit, setEdit] = useState(false);
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

  const facultyName = faculties.find((faculty) => faculty.id === courseData?.faculty)?.name;

  const courseType = COURSE_TYPE_OPTION.find((type) => type === courseData?.type);

  const courseLocation = COURSE_LOCATION_OPTION.find((location) => location === courseData?.centre_location);

  const courseSponsorship = SPONSORHIP_OPTION.find((sponsorship) => sponsorship === courseData?.sponsorship_options);

  const defaultValues = useMemo(() => ({
    course_code: courseData?.course_code || '',
    course_name: courseData?.course_name || '',
    duration: courseData?.duration || '',
    level: courseData?.level || '',
    type: courseType || '',
    faculty: facultyName || '',
    centre: courseLocation || '',
    sponsorship_options: courseSponsorship || '',
    total_credits: courseData?.total_credits || '',
    facilitator: courseData?.facilitator || '',
  }));

  const methods = useForm({
    resolver: yupResolver(NewCourseSchema),
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

  const handleFileChange = (event) => {
    const uploadedFile = Array.from(event.target.files);
    const pdfFiles = uploadedFile.filter((file) => file.type === 'application/pdf');
    if (uploadedFile.length !== pdfFiles.length) {
      enqueueSnackbar('Please select only PDF files.', { variant: 'error' });
    } else {
      setFile(pdfFiles[0]); // Set the 'Copy of results slip' file to state
    }
  };
  const ResultSlipMethod = () => {
    document.getElementById('resultsSlip').click();
  };

  useEffect(() => {
    if (isEdit && courseData) reset(defaultValues);
    if (!isEdit) {
      defaultValues.centre = '';
      defaultValues.faculty = '';
      defaultValues.sponsorship_options = '';
      defaultValues.course_code = '';
      defaultValues.course_name = '';
      defaultValues.duration = '';
      defaultValues.level = '';
      defaultValues.type = '';
      defaultValues.total_credits = '';
      defaultValues.facilitator = '';

      reset(defaultValues);
    }
  }, [courseData, reset, isEdit, facultyName]);

  useEffect(() => {
    if (!courseData?.id) return;

    axios
      .get(`/v1/admission-letters/by-course/${courseData.id}`)
      .then((response) => {
        const letter = response.data.data?.letter;
        const fileUrl = response.data.data?.fileUrl;
        setTemplate(letter ? { ...letter, fileUrl } : { id: '', fileUrl: '' });
      })
      .catch(() => {
        setTemplate({ id: '', fileUrl: '' });
      });
  }, [courseData]);

  useEffect(() => {
    // Fetch faculties
    axios
      .get('/v1/faculties')
      .then((response) => {
        const data = response.data.map((record) => ({
          ...record,
          facilitator: record?.expand?.facilitator?.name,
        }));
        // console.log({ data });
        setFaculties(data);
      })
      .catch((error) => {
        console.error('Error fetching faculties:', error);
      });
  }, []);

  const values = watch();

  const onSubmit = async (e) => {
    e.preventDefault();

    if (isEdit) updateCourse();
    else createCourse();
  };

  // Function to fetch file from URL
  async function fetchFileFromURL(url) {
    try {
      const response = await fetch(url);
      console.log({ response });
      const blob = await response.blob();
      console.log({ blob });
      return blob;
    } catch (error) {
      console.error('Error fetching file:', error);
      throw error;
    }
  }

  const updateCourse = async () => {
    let blob = null;

    if (template.id !== '' && template.fileUrl) {
      try {
        blob = await fetchFileFromURL(template.fileUrl);
      } catch (error) {
        console.error('Failed to fetch existing file:', error);
      }
    }

    let fileToUpload = null;

    if (file instanceof File) {
      fileToUpload = file;
    } else if (blob instanceof Blob) {
      fileToUpload = blob;
    }

    if (fileToUpload) {
      try {
        await axios.patch(`/v1/courses/${courseData.id}`, {
          course_code: values.course_code,
          course_name: values.course_name,
          duration: values.duration,
          level: values.level,
          type: values.type,
          faculty: faculties.find((faculty) => faculty.name === values.faculty).id,
          centre_location: values.centre,
          sponsorship_options: values.sponsorship_options,
          total_credits: values.total_credits,
          facilitator: values.facilitator,
        });

        const formData = new FormData();
        formData.append('course_id', courseData.id);
        formData.append('courseName', courseData.course_name);
        formData.append('file', file || fileToUpload, template.file);

         await axios.patch(`/v1/admission-letters/${template.id}`, formData);


        reset();
        enqueueSnackbar('Course updated successfully!');
        navigate(record.role === 'hod' ? PATH_DASHBOARD.hod.courseList : PATH_DASHBOARD.superAdmin.courseList);
      } catch (error) {
        console.error(error);
        enqueueSnackbar('Error updating course!', { variant: 'error' });
      }
    } else {
      enqueueSnackbar('Upload course admission template!', { variant: 'error' });
    }
  };

  useEffect(() => {
    if (values?.faculty) {
      console.log({ faculties });
      console.log(values?.faculty);
      const managementFaculty = faculties.find((faculty) => faculty.name?.trim() === values?.faculty?.trim());

      console.log("Matched faculty's facilitator:", managementFaculty);

      // If you want to set the facilitator value:
      setValue('facilitator', managementFaculty?.facilitator || 'No Facilitator');
    }
  }, [values.faculty]);

  const createCourse = async () => {
    if (file) {
      try {
        await axios
          .post('/v1/courses', {
            course_code: values.course_code,
            course_name: values.course_name,
            duration: values.duration,
            level: values.level,
            type: values.type,
            faculty: faculties.find((faculty) => faculty.name === values.faculty).id,
            centre_location: values.centre,
            sponsorship_options: values.sponsorship_options,
            total_credits: values.total_credits,
            facilitator: values.facilitator,
          })
          .then(async (res) => {
            // console.log(res.data.course.id)
            enqueueSnackbar('Course created successfully!');
            const formData = new FormData();
            // Ensure correct values are being appended
            formData.append('course_id', res.data.course.id);
            formData.append('courseName', values.course_name);
            formData.append('file', file); // Ensure 'file' is a valid file object
            await axios.post(`/v1/admission-letters`, formData);
            reset();
            if (record.role === 'hod') navigate(PATH_DASHBOARD.hod.courseList);
            else navigate(PATH_DASHBOARD.superAdmin.courseList);
          })
          .catch((error) => {
            console.error(error);
            enqueueSnackbar('Error creating course!', { variant: 'error' });
          });
      } catch (error) {
        console.error(error);
        enqueueSnackbar('Error creating course!', { variant: 'error' });
      }
    } else {
      enqueueSnackbar('Upload course admission letter!', { variant: 'error' });
    }
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Dialog fullWidth maxWidth="sm" open={open || openSent || visible}>
          <DialogTitle>Hello World </DialogTitle>

          <DialogContent>
            <Stack spacing={3}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quis ducimus iste est in blanditiis, officia
                quisquam voluptatibus dignissimos aliquam magni?
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
        </Dialog>

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
                    sm: 'repeat(3, 1fr)',
                  },
                }}
              >
                <RHFTextField name="course_code" label="Course Code" />
                <RHFTextField name="course_name" label="Course Name" />
                <RHFTextField name="duration" label="Duration" />
              </Box>
              <Stack spacing={3} mt={2} mb={2} />

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
                <RHFSelect name="level" label="Study Mode">
                  <option value="" />
                  {STUDY_MODE_OPTION.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </RHFSelect>

                <RHFSelect name="type" label="Type">
                  <option value="" />
                  {COURSE_TYPE_OPTION.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </RHFSelect>
              </Box>

              <Stack spacing={3} mt={2} mb={2} />

              <Box
                sx={{
                  display: 'grid',
                  columnGap: 2,
                  rowGap: 3,
                  gridTemplateColumns: {
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(1, 1fr)',
                  },
                }}
              >
                <RHFSelect name="faculty" label="Faculty/School">
                  <option value="" />
                  {faculties?.map((option, index) => (
                    <option key={option.id}>{option.name}</option>
                  ))}
                </RHFSelect>
                <RHFSelect name="centre" label="Centre/Location">
                  <option value="" />
                  {COURSE_LOCATION_OPTION.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option}
                    </option>
                  ))}
                </RHFSelect>
                <RHFSelect name="sponsorship_options" label="Sponsorship Options">
                  <option value="" />
                  {SPONSORHIP_OPTION.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option}
                    </option>
                  ))}
                </RHFSelect>
                <RHFTextField name="total_credits" label="Total Credits" />
                <RHFTextField name="facilitator" label="Facilitator" />

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
                      onChange={handleFileChange}
                      style={{ display: 'none', border: 'none' }}
                      // multiple
                    />
                    <Button component="span" size="large" fullWidth onClick={ResultSlipMethod}>
                      {file !== null || template !== null
                        ? `Uploaded Admission Letter`
                        : 'Click to upload Admission Letter'}
                    </Button>
                  </label>
                </div>
              </Box>

              <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
                {record.role !== 'returningGuest' ? (
                  <Button
                    type="button"
                    color="inherit"
                    variant="outlined"
                    size="large"
                    onClick={() => {
                      if (record.role === 'hod') {
                        navigate(PATH_DASHBOARD.hod.courseList);
                      } else {
                        navigate(PATH_DASHBOARD.superAdmin.courseList);
                      }
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
