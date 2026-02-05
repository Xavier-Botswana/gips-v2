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

const STUDY_MODE_OPTION = ['Full time', 'Part time', 'Online'];

FacultyNewForm.propTypes = {
  isEdit: PropTypes.bool,
  facultyData: PropTypes.object,
};

export default function FacultyNewForm({ isEdit, facultyData }) {
  const [open, setOpen] = useState(false);

  const [openSent, setOpenSent] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hodsList, setHodsList] = useState([]);
  const navigate = useNavigate();

  const { record } = useSelector((state) => {
    return state.user;
  });

  const { enqueueSnackbar } = useSnackbar();
  const sortHodsList = (a, b) => {
    if (a.id === facultyData?.facilitator) return -1;
    if (b.id === facultyData?.facilitator) return 1;
    return 0;
  };
  const [edit, setEdit] = useState(false);
  const NewCourseSchema = Yup.object().shape({
    name: Yup.string().required('Faculty name is required'),
    facilitator: Yup.string(),
  });

  const defaultValues = useMemo(() => ({
    name: facultyData?.name || '',
    facilitator: facultyData?.facilitator || ''
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

  useEffect(() => {
    const getHODS = async () => {
      const hods = await axios.get(`/v1/hod`);

      setHodsList(hods.data.hods);
    };
    getHODS();
  }, []);

  useEffect(() => {
    if (isEdit && facultyData) reset(defaultValues);
    if (!isEdit) reset(defaultValues);
    if (facultyData) reset(defaultValues);
    if (!facultyData) reset(defaultValues);
  }, [facultyData, reset, isEdit]);

  const values = watch();

  const onSubmit = async (e) => {
    e.preventDefault();

    if (isEdit) updateFaculty();
    else createFaculty();
  };

  const updateFaculty = async () => {
    try {
      await axios
        .patch(`/v1/faculties/${facultyData.id}`, {
          ...values,
        })
        .then(() => {
          enqueueSnackbar('Faculty updated successfully!');
          navigate(PATH_DASHBOARD.superAdmin.facultyList);
        });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error updating course!', { variant: 'error' });
    }
  };

  const createFaculty = async () => {
    try {
      await axios
        .post('/v1/faculties', {
          ...values,
        })
        .then((response) => {
          const selectedHod = hodsList.find((record) => record.id === values.facilitator);

          axios.patch(`/v1/users/${selectedHod.user_id}`, {
            faculty_id: response.data.id,
          });

          enqueueSnackbar('Faculty created successfully!');
          navigate(PATH_DASHBOARD.superAdmin.facultyList);
          // setOpenSent(true);
          // setVisible(true);
        })
        .catch((error) => {
          console.error(error);
          enqueueSnackbar('Error creating course!', { variant: 'error' });
        });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error creating course!', { variant: 'error' });
    }
  };

  if ((isEdit && !facultyData) || !hodsList) {
    return null;
  }

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
                <RHFTextField name="name" label="Faculty Name" />
                <RHFSelect name="facilitator" label="Facilitator">
                  {!isEdit && <option value="" />}
                  {hodsList.sort(sortHodsList).map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </RHFSelect>
              </Box>
              <Stack spacing={3} mt={2} mb={2} />

              <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
                {record.role !== 'returningGuest' ? (
                  <Button
                    type="button"
                    color="inherit"
                    variant="outlined"
                    size="large"
                    onClick={() => {
                      navigate(PATH_DASHBOARD.superAdmin.facultyList);
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
