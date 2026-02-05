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
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
} from '@mui/material';
// import { Close as CloseIcon } from '@mui/icons-material';
import { GridCloseIcon } from '@mui/x-data-grid';
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
const MODULE_LOCATION_OPTION = ['','Gaborone', 'Francistown', 'Maun', 'All'];
// let PARENT_COURSE_OPTIONS = [];

ModuleNewForm.propTypes = {
  isEdit: PropTypes.bool,
  moduleData: PropTypes.object,
};

export default function ModuleNewForm({ isEdit, moduleData }) {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [open, setOpen] = useState(false);
  const [openSent, setOpenSent] = useState(false);
  const [courses, setCourses] = useState();
  const [semesters, setSemesters] = useState();
  const [faculties, setFaculties] = useState([]);
  const [edit, setEdit] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hasPrerequisites, setHasPrerequisites] = useState(moduleData?.prerequisites?.length > 0 || false);
  const [prerequisites, setPrerequisites] = useState(moduleData?.prerequisites || []);
  const [availableModules, setAvailableModules] = useState([]);

  const navigate = useNavigate();
  const { record } = useSelector((state) => {
    return state.user;
  });

  const { enqueueSnackbar } = useSnackbar();
  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const ModuleSchema = Yup.object().shape({
    module_code: Yup.string().required('Course code is required'),
    module_name: Yup.string().required('Course name is required'),
    // duration: Yup.number().required('Duration is required'),
    year_level: Yup.string().required('Level is required'), // TODO: Change to number i think
    // type: Yup.string().required('Type is required'),
    faculty: Yup.string().required('Faculty is required'),
    location: Yup.string().required('Centre is required'),
    credits: Yup.number().required('Total credits is required'),
    facilitator: Yup.string().required('Facilitator is required'),
    parent_course: Yup.string().required('Parent course is required'),
    semester: Yup.number().required('Semester number is required'),
    assignment_weight: Yup.number().required('Assignment mark is required'),
    supplement_weight: Yup.number().required('Module supplement mark is required'),
    mid_semester_weight: Yup.number().required('Mid semester mark is required'),
    exam_weight: Yup.number().required('Examination weight is required'),
    prerequisites: Yup.array().when('hasPrerequisites', {
      is: true,
      then: Yup.array().min(1, 'Select at least one prerequisite module'),
    }),
  });

  const moduleLocation = MODULE_LOCATION_OPTION.find((location) => location === moduleData?.location);
  const parentCourse = courses?.find((course) => course.id === moduleData?.expand.parent_course.id)?.course_name;
  const facultyName = faculties?.find((faculty) => faculty.id === moduleData?.expand.faculty.id)?.name;
  const semester = semesters?.find((semester) => semester.id === moduleData?.expand.semester.id)?.name;

  const defaultValues = useMemo(() => ({
    module_code: moduleData?.module_code || '',
    module_name: moduleData?.name || '',
    // duration: '',
    year_level: moduleData?.year_level || '',
    // type: '',
    faculty: facultyName || '',
    location: moduleLocation || '',
    credits: moduleData?.credits || '',
    facilitator: moduleData?.facilitator || '',
    parent_course: parentCourse || '',
    semester: semester || '',
    assignment_weight: moduleData?.assignment_weight || '',
    supplement_weight: moduleData?.supplement_weight || '',
    mid_semester_weight: moduleData?.mid_semester_weight || '',
    exam_weight: moduleData?.exam_weight || '',
    // hasPrerequisites: moduleData?.prerequisites?.length > 0 || false,
    prerequisites: moduleData?.prerequisites || [],
  }));

  const methods = useForm({
    resolver: yupResolver(ModuleSchema),
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

  useEffect(() => {
    if (isEdit && moduleData) reset(defaultValues);
    if (!isEdit) reset(defaultValues);
  }, [moduleData, reset, isEdit, courses, faculties]);

  useEffect(() => {
    axios.get('/v1/faculties').then((response) => {
      setFaculties(response.data);
    });
    axios.get('/v1/courses').then((response) => setCourses(response.data.courses));
    axios.get('/v1/semesters').then((response) => {
      setSemesters(response.data);
    });
    axios.get('/v1/modules').then((response) => {
      const modulesMatchingParentCourse = response.data.filter(
        (module) => module.parent_course === moduleData?.expand.parent_course.id
      );

      setAvailableModules(modulesMatchingParentCourse);
    });
  }, []);

  const values = watch();

  const onSubmit = async (e) => {
    e.preventDefault();

    if (isEdit) updateModule();
    else createModule();
  };

  const updateModule = async () => {
    try {
      await axios
        .patch(`/v1/modules/${moduleData.id}`, {
          ...values,
          faculty: faculties.find((faculty) => faculty.name === values.faculty).id,
          parent_course: courses.find((course) => course.course_name === values.parent_course).id,
          module_name: values.module_name,
          semester: semesters.find((semester) => semester.name === values.semester).id,
          year_level: values.year_level,
          prerequisites: hasPrerequisites ? prerequisites : [],
          supplement_weight: 0,
          facilitator: '',
        })
        .then(() => {
          enqueueSnackbar('Module updated successfully!');
          if (record.role === 'hod') {
            navigate(PATH_DASHBOARD.hod.moduleList);
          } else {
            navigate(PATH_DASHBOARD.superAdmin.moduleList);
          }
        });
    } catch (error) {
      console.error(error);
      if (error?.errors) {
        error.errors.forEach((err) => {
          enqueueSnackbar(err.message, { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message || 'An error occurred', { variant: 'error' });
      }
    }
  };

  const createModule = async () => {
    try {
      await axios
        .post('/v1/modules', {
          ...values,
          semester: semesters.find((semester) => semester.name === values.semester).id,
          faculty: faculties.find((faculty) => faculty.name === values.faculty).id,
          parent_course: courses.find((course) => course.course_name === values.parent_course).id,
          prerequisites: hasPrerequisites ? prerequisites : [],
          supplement_weight: 0,
          facilitator: '',
        })
        .then(() => {
          enqueueSnackbar('Module created successfully!');
          if (record.role === 'hod') {
            navigate(PATH_DASHBOARD.hod.moduleList);
          } else {
            navigate(PATH_DASHBOARD.superAdmin.moduleList);
          }
        });
    } catch (error) {
      console.error(error);
      if (error?.errors) {
        error.errors.forEach((err) => {
          enqueueSnackbar(err.message, { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message || 'An error occurred', { variant: 'error' });
      }
    }
  };

  const handlePrerequisiteChange = (event) => {
    const { value } = event.target;
    setPrerequisites(value);
    setValue('prerequisites', value);
  };

  const handleDeletePrerequisite = (prerequisiteToDelete) => {
    const newPrerequisites = prerequisites.filter((prerequisite) => prerequisite !== prerequisiteToDelete);
    setPrerequisites(newPrerequisites);
    setValue('prerequisites', newPrerequisites);
  };

  useEffect(() => {
    if (isEdit && moduleData) {
      setHasPrerequisites(moduleData.prerequisites?.length > 0);
      setPrerequisites(moduleData.prerequisites || []);
    }
  }, [isEdit, moduleData]);

  useEffect(() => {
    const selectedCourse = values.parent_course;
    if (selectedCourse && courses) {
      const courseId = courses.find((course) => course.course_name === selectedCourse)?.id;
      if (courseId) {
        axios.get(`/v1/modules?course=${courseId}`).then((response) => {
          // Filter out the current module if we're in edit mode
          const filteredModules = isEdit
            ? response.data.filter((module) => module.id !== moduleData.id)
            : response.data;
          setAvailableModules(filteredModules);
        });
      }
    }
  }, [values.parent_course, courses]);

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
                    sm: 'repeat(2, 1fr)',
                  },
                }}
              >
                <RHFTextField name="module_name" label="Module Name" />
                <RHFTextField name="module_code" label="Module Code" />
                <RHFSelect name="parent_course" label="Parent Course">
                  <option value="" />
                  {courses?.map((option, index) => (
                    <option key={option?.id} value={option?.course_name}>
                      {option?.course_name}
                    </option>
                  ))}
                </RHFSelect>
                <RHFTextField name="year_level" label="Year(Level)" />
                <RHFSelect name="semester" label="Semester Number">
                  <option value="" />
                  {semesters?.map((option, index) => (
                    <option key={option.id} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </RHFSelect>

                <RHFSelect name="faculty" label="Faculty">
                  <option value="" />
                  {faculties?.map((option, index) => (
                    <option key={option.id} value={option.name}>
                      {option.name}
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
                <RHFSelect name="location" label="Centre/Location">
                  {MODULE_LOCATION_OPTION.map((option, index) => (
                    <option key={index} value={option.value}>
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
                    sm: 'repeat(2, 1fr)',
                  },
                }}
              >
                <RHFTextField name="assignment_weight" label="Assignment Mark(%)" />

                <RHFTextField name="mid_semester_weight" label="Mid Semester Mark(%)" />
                <RHFTextField name="exam_weight" label="Examination Weight(%)" />
                <RHFTextField name="credits" label="Module Credits" />
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
                <FormControlLabel
                  control={
                    <Switch
                      checked={hasPrerequisites}
                      onChange={(e) => {
                        setHasPrerequisites(e.target.checked);
                        if (!e.target.checked) {
                          setPrerequisites([]);
                          setValue('prerequisites', []);
                        }
                      }}
                    />
                  }
                  label="This module has prerequisites"
                />

                {hasPrerequisites && (
                  <FormControl fullWidth>
                    <InputLabel>Prerequisites</InputLabel>
                    <Select
                      multiple
                      value={prerequisites}
                      onChange={handlePrerequisiteChange}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={availableModules.find((module) => module.id === value)?.name}
                              onDelete={() => handleDeletePrerequisite(value)}
                              deleteIcon={
                                <IconButton
                                
                                  size="small"
                                  sx={{
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    },
                                  }}
                                >
                                  <GridCloseIcon fontSize="small" />
                                </IconButton>
                              }
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {availableModules.map((module) => (
                        <MenuItem key={module.id} value={module.id}>
                          {module.name} ({module.module_code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
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
      navigate(PATH_DASHBOARD.hod.moduleList);
    } else {
      navigate(PATH_DASHBOARD.superAdmin.moduleList);
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
                <LoadingButton disabled ={isSubmitting} type="submit" variant="contained" loading={isSubmitting} size="large">
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
