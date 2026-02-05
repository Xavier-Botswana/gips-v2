import * as Yup from 'yup';
import { useState, useEffect, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Stack, IconButton, InputAdornment, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from 'notistack';
import axios from '../../../utils/axios';

// hooks
import { PATH_AUTH } from '../../../routes/paths';

import useIsMountedRef from '../../../hooks/useIsMountedRef';
// components
import Iconify from '../../../components/Iconify';
import { FormProvider, RHFTextField } from '../../../components/hook-form';

// ----------------------------------------------------------------------

export default function RegisterForm({ applicantData }) {

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const isMountedRef = useIsMountedRef();

  const [applicationDetails, setApplicationDetails] = useState({});
  const [guestDetails, setGuestDetails] = useState({});
  const RegisterSchema = Yup.object().shape({
    email: Yup.string().email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
    passConfirm: Yup.string().required('Password is required'),
  });

  const defaultValues = useMemo(
    () => ({
      email: '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;
  const values = watch();

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log(applicantData);

    const updateUser = {
      role: applicantData?.applicationStatus === 'approved' ? 'guestUser' : 'returningGuest',
    };

    try {
      if (values.email !== applicantData.email) {
        enqueueSnackbar('Email Address does not match the email for the applicant', { variant: 'error' });
      }
      if (applicantData.applicationStatus === 'approved' && values.email === applicantData.email) {
        
        axios.patch(`/v1/users/${applicantData.id}`, updateUser).then((res) => {
          console.log('Applicant Details');
          console.log(res.data);
          axios.post(`/v1/users/request-password-reset`,{email:values.email}).then(()=>{
            enqueueSnackbar('We have sent a reset-password link to your email,Thank you');
            navigate(PATH_AUTH.login);
          })
          console.log('Applicant Details');


        
        });
      } else if (applicantData.applicationStatus === 'declined' && values.email === applicantData.email) {
        axios.post(`/v1/users/request-password-reset`,{email:values.email}).then(()=>{
          enqueueSnackbar('We have sent a reset-password link to your email,Thank you');
        })
        axios.patch(`/v1/users/${applicantData.id}`, updateUser).then(() => {
        navigate(PATH_AUTH.login);
       
      
      });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        <RHFTextField name="email" label="Email address" />
        {/* <RHFTextField
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
        /> */}
        {/* <RHFTextField
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
            ),
          }}
        /> */}
        <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
          Next
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
