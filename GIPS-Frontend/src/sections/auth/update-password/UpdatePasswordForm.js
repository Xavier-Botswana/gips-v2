import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
// form
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// import { useRouter } from 'next/router';
// @mui
import { Link, Stack, Alert, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { PATH_AUTH } from '../../../routes/paths';
import axios from '../../../utils/axios';
import { logout } from '../../../redux/slices/auth';

// hooks
import useIsMountedRef from '../../../hooks/useIsMountedRef';
// components
import { FormProvider, RHFTextField } from '../../../components/hook-form';
import Iconify from '../../../components/Iconify';

// ----------------------------------------------------------------------

UpdatePasswordForm.propTypes = {
  onSent: PropTypes.func,
  onGetEmail: PropTypes.func,
};

export default function UpdatePasswordForm({ onSent, onGetEmail, token }) {
  const { enqueueSnackbar } = useSnackbar();
  const isMountedRef = useIsMountedRef();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordconfirm, setShowPasswordConfirm] = useState(false);
  const UpdatePasswordSchema = Yup.object().shape({
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
  });
  const navigate = useNavigate();
  const dispatch  = useDispatch();

  // useEffect(()=>{
  //   if(!token){
  //     navigate(PATH_AUTH.login)
  //   }
  // },[]);

  const methods = useForm({
    resolver: yupResolver(UpdatePasswordSchema),
    defaultValues: { email: '' },
  });

  const {
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      if (token) {
        if (values.password !== values.passConfirm) {
          enqueueSnackbar('Password provided do not match', { variant: 'error' });
        } else if (values.password.length <= 8) {
          enqueueSnackbar('Password is too short', { variant: 'error' });
        } else {
          axios.get('/v1/users').then(() => {
            axios
              .post(`/v1/users/confirm-password-reset`, {
                token,
                password: values.password,
                passwordConfirm: values.passConfirm,
              })
              .then(() => {
                enqueueSnackbar('Password Updated successfully!');
                dispatch(logout());

                navigate(PATH_AUTH.login);
              });
          });
        }
      } else {
        navigate(PATH_AUTH.login);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        <RHFTextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <RHFTextField
          name="passConfirm"
          label="Confirm new password"
          type={showPasswordconfirm ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPasswordConfirm(!showPasswordconfirm)} edge="end">
                  <Iconify icon={showPasswordconfirm ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
          Update Password
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
