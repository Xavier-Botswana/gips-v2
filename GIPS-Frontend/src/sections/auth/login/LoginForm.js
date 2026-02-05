import * as Yup from 'yup';
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, Stack, Alert, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useDispatch } from 'react-redux';
import axios from '../../../utils/axios';
import { PATH_AUTH } from '../../../routes/paths';
import useIsMountedRef from '../../../hooks/useIsMountedRef';
import Iconify from '../../../components/Iconify';
import { FormProvider, RHFTextField, RHFCheckbox } from '../../../components/hook-form';
import { login, loginSuccess } from '../../../redux/slices/auth';

// ----------------------------------------------------------------------

export default function LoginForm() {
  const dispatch = useDispatch();
  const isMountedRef = useIsMountedRef();
  const { enqueueSnackbar } = useSnackbar();

  const [showPassword, setShowPassword] = useState(false);

  const LoginSchema = Yup.object().shape({
    identity: Yup.string().email('Email must be a valid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
    remember: Yup.bool(), // Remember me checkbox
  });

  const defaultValues = {
    identity: '', // Ensure the field name matches the form field
    password: '',
    remember: false,
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  // Load the remembered email from local storage on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      reset({
        identity: rememberedEmail,
        password: '',
        remember: true,
      });
    }
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('/v1/users/login', {
        identity: data.identity,
        password: data.password,
      });
      dispatch(loginSuccess(response.data));
      // Save email to local storage if "Remember Me" is checked
      if (data.remember) {
        localStorage.setItem('rememberedEmail', data.identity);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
    } catch (error) {
      console.error(error);
      // Reset the password field only
      reset({
        ...data, // retain email (identity) value
        password: '', // clear the password field
      });

      enqueueSnackbar('Unable to authenticate. Please verify your credentials and try again.', { variant: 'error' });

      if (isMountedRef.current) {
        setError('afterSubmit', error);
      }
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField name="identity" label="Email address" />
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
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        <RHFCheckbox name="remember" label="Remember me" />
        <Link component={RouterLink} variant="subtitle2" to={PATH_AUTH.resetPassword}>
          Forgot password?
        </Link>
      </Stack>

      <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
        Login
      </LoadingButton>
    </FormProvider>
  );
}
