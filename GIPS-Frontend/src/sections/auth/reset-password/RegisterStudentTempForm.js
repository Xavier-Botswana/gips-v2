import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import { Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from '../../../utils/axios';
// import axios from 'axios';
// hooks
import useIsMountedRef from '../../../hooks/useIsMountedRef';
// components
import { FormProvider, RHFTextField } from '../../../components/hook-form';

// ----------------------------------------------------------------------

RegisterForm.propTypes = {
  onSent: PropTypes.func,
  onGetEmail: PropTypes.func,
  onGetStudentNo: PropTypes.func,
};

export default function RegisterForm({ onSent, onGetEmail, onGetStudentNo }) {
  const isMountedRef = useIsMountedRef();
  const { enqueueSnackbar } = useSnackbar();

  const Schema = Yup.object().shape({
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    studentNo: Yup.string('Email must be a valid email address').required('Student number is required'),
  });

  const methods = useForm({
    resolver: yupResolver(Schema),
    defaultValues: { email: '', studentNo: '' },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    console.log({ data });

    try {
      axios.get(`/v1/students`).then((res) => {
        const studentDetails = res.data.data.find((user) => user.studentNo === data.studentNo);
        if (studentDetails) {
          axios
            .post(`/v1/users`, {
              email: data.email,
              emailVisibility: true,
              name: `${studentDetails.firstname}_${studentDetails.lastname}`,
              password: 'password1234',
              passwordConfirm: 'password1234',
              role: 'student',
            })
            .then((response) => {
              const userid = response.data.id;
              axios
                .patch(`/v1/students/${studentDetails.id}`, {
                  user_id: userid,
                })
                .then((res) => {
                  enqueueSnackbar(`Student details updated successfully`);
                  reset();
                });
            });
        } else {
          enqueueSnackbar(`We couldn't find an account with that student number please confirm and try again.`, {
            variant: 'error',
          });
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField name="studentNo" label="Student Number" />
        <RHFTextField name="email" label="Email address" />

        <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
          Submit
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
