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
// hooks
import useIsMountedRef from '../../../hooks/useIsMountedRef';
// components
import { FormProvider, RHFTextField } from '../../../components/hook-form';

// ----------------------------------------------------------------------

ResetPasswordForm.propTypes = {
  onSent: PropTypes.func,
  onGetEmail: PropTypes.func,
};

export default function ResetPasswordForm({ onSent, onGetEmail }) {
  const isMountedRef = useIsMountedRef();
  const { enqueueSnackbar } = useSnackbar();

  const ResetPasswordSchema = Yup.object().shape({
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
  });

  const methods = useForm({
    resolver: yupResolver(ResetPasswordSchema),
    defaultValues: { email: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      axios.get(`/v1/users`).then((res) => {
        const email = res.data.users.find((user) => user.email === data.email);

        if (email) {
          axios.post(`/v1/users/request-password-reset`, { email: data.email }).then(() => {
            enqueueSnackbar('We have sent a reset-password link to your email,Thank you');

            if (isMountedRef.current) {
              onSent();
              onGetEmail(data.email);
            }
          });
        } else {
          enqueueSnackbar(`We couldn't find an account with that email address.`, { variant: 'error' });
        }
      });

      // axios
      //   .post('api/v1/emails/email', {
      //     from: 'enquiries@gips.ac.bw ,<GIPS ADMISSIONS>',
      //     to: data.email,
      //     subject: 'GIPS Account Password Reset',
      //     html: `
      //   <p>Good day,<br/>
      //   Forgot your password?<br/>
      //   We received a request to reset the password for your account.<br/><br/>
      //   To reset your password,click on the button below:<br/>

      //     <a  href="https://applications.gips.ac.bw/auth/confirm-password-reset" target="_blank" rel="noopener"><button style="background:black;color:white;border-radius:5px">Reset password</button></a>
      //   </p>
      //   <p><i>If you didn't ask / apply to study at GIPS you can ignore this email.</i></p>
      //   <p>
      //     Thanks,<br/>
      //     GIPS Support Team
      //   </p>
      //   `,
      //   })
      //   .then((res) => {
      //     // console.log(res.data);
      //     enqueueSnackbar('We have sent a reset-password link to your email,Thank you');
      //   });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField name="email" label="Email address" />

        <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
          Reset Password
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
