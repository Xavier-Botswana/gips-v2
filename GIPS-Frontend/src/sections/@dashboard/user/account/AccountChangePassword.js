import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
// @mui
import { Stack, Card } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from '../../../../utils/axios';

// components
import { FormProvider, RHFTextField } from '../../../../components/hook-form';

// ----------------------------------------------------------------------

export default function AccountChangePassword() {
  const { enqueueSnackbar } = useSnackbar();
  const { record } = useSelector((state) => state.user);

  // Validation schema
  const ChangePassWordSchema = Yup.object().shape({
    oldPassword: Yup.string().required('Old Password is required'),
    newPassword: Yup.string().min(6, 'Password must be at least 6 characters').required('New Password is required'),
    confirmNewPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Please confirm your password'),
  });

  const defaultValues = {
    newPassword: '',
    confirmNewPassword: '',
  };

  const methods = useForm({
    resolver: yupResolver(ChangePassWordSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const onSubmit = async (data) => {
    try {
      const id = record.id;
      if (data.newPassword !== data.confirmNewPassword) {
        enqueueSnackbar('Passwords do not match!', { variant: 'error' });
        return;
      }

      await axios
        .patch(`/v1/users/${id}`, {
          oldPassword: data.oldPassword,
          password: data.newPassword,
          passwordConfirm: data.confirmNewPassword,
        })
        .then((res) => {
          console.log({ res });
          reset();
          enqueueSnackbar('Password updated successfully!', { variant: 'success' });
        });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to update password!', { variant: 'error' });
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3} alignItems="flex-end">
          <RHFTextField name="oldPassword" type="password" label="Old Password" />
          <RHFTextField name="newPassword" type="password" label="New Password" />
          <RHFTextField name="confirmNewPassword" type="password" label="Confirm New Password" />
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Save Changes
          </LoadingButton>
        </Stack>
      </FormProvider>
    </Card>
  );
}
