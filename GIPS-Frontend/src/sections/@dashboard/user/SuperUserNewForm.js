import { useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Grid, Card, Box, Stack } from '@mui/material';
import { FormProvider, RHFTextField, RHFSelect } from '../../../components/hook-form';
import axios from '../../../utils/axios';
import { PATH_DASHBOARD } from '../../../routes/paths';

const ROLE_OPTION = ['Super Admin', 'Administrator', 'Admissions', 'Academia'];
const DEPARTMENT_ROLE = ['Admissions', 'Academia', 'Registry', 'Accounting', 'Marketing'];

// SuperUserNewForm.propTypes = {
//   isEdit: PropTypes.bool,
//   userData: PropTypes.object,
// };

const mapRole = (role) => {
  switch (role) {
    case 'Super Admin':
      return 'superAdmin';
    case 'Administrator':
      return 'admin';
    case 'Admissions':
      return 'hod';
    case 'Academia':
      return 'lecturer';
    default:
      return 'super_admin';
  }
};

const unMapRole = (role) => {
  switch (role) {
    case 'superAdmin':
      return 'Super Admin';
    case 'super_admin':
      return 'Super Admin';
    case 'admin':
      return 'Administrator';
    case 'hod':
      return 'Admissions';
    case 'lecturer':
      return 'Academia';
    case 'student':
      return 'Student';
    default:
      return 'super_admin';
  }
};

const SuperUserNewForm = ({ isEdit, userData }) => {
  const [faculties, setFaculties] = useState([]);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    // email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    faculty: Yup.string().required('Faculty is required'),
    role: Yup.string().required('Role is required'),
  });

  const facultyName = faculties?.find((faculty) => faculty.id === userData?.faculty_id)?.name;

  const defaultValues = useMemo(() => ({
    name: userData?.name || '',
    email: userData?.email || '',
    faculty: userData?.facultyName || '',
    role: unMapRole(userData?.role) || '',
    department: userData?.department || '',
  }));

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (isEdit && userData) reset(defaultValues);
    if (!isEdit) reset(defaultValues);
  }, [userData, reset, isEdit]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (isEdit) {
      updateUser();
    } else {
      createUser();
    }
  };

    const createUser = async () => {
    try {
      await axios.post('/v1/users', {
        ...values,
        emailVisibility: true,
        role: mapRole(values.role),
        faculty_id: faculties?.find((faculty) => faculty.name === values?.faculty)?.id || '',
      });

      axios
        .post(`/v1/users/request-password-reset`, {
          email: values.email,
        })
        .then(() => {
          enqueueSnackbar('User created successfully!');
          navigate(PATH_DASHBOARD.superAdmin.userList);
        });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error creating user!', { variant: 'error' });
    }
  };


  const updateUser = async () => {
    try {
      await axios
        .patch(`/v1/users/${userData?.id}`, {
          ...values,
          role: mapRole(values.role),
          faculty_id: faculties.find((faculty) => faculty.name === values.faculty).id,
        })
        .then((res) => {
          enqueueSnackbar('User updated successfully!');
          navigate(PATH_DASHBOARD.superAdmin.userList);
        });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error updating user!', { variant: 'error' });
    }
  };

  useEffect(() => {
    axios.get('/v1/faculties').then((response) => {
      setFaculties(response.data);
    });
  }, []);

  return (
    <>
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
                <RHFTextField name="name" label="Full Name" />
                <RHFTextField disabled={isEdit} name="email" label="Email" />
                <RHFSelect name="faculty" label="Faculty">
                  <option value="" />
                  {faculties?.map((option) => (
                    <option key={option.id} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </RHFSelect>
                <RHFSelect name="role" label="Role">
                  <option value="" />
                  {ROLE_OPTION.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </RHFSelect>
                <RHFSelect name="department" label="Department">
                  <option value="" />
                  {DEPARTMENT_ROLE.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </RHFSelect>
              </Box>
              <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
                <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
                  Submit
                </LoadingButton>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
};

export default SuperUserNewForm;
