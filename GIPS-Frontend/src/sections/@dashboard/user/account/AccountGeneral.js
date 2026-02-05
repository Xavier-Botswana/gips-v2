import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';

// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector, useDispatch } from 'react-redux';
// @mui
import { Box, Grid, Card, Stack, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from '../../../../utils/axios';
import MyAvatar from '../../../../components/MyAvatar';
// components
import { FormProvider,RHFTextField} from '../../../../components/hook-form';
import { updateProfile } from '../../../../redux/slices/auth';


// ----------------------------------------------------------------------

export default function AccountGeneral() {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const { record,  } = useSelector((state) => {
    return state.user;
  });

  const UpdateUserSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    email: Yup.string(),
    name: Yup.string(),
    role: Yup.string(),
  });

  const defaultValues = {
    name: record?.name || '',
    email: record?.email || '',
    role: record?.role || '',
    username: record?.username || '',
  };

  const methods = useForm({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues,
  });

  const {
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      const id = record.id;

      axios
        .patch(`/v1/users/${id}`, {
          username: data.username,
          email: data.email,
          name: data.name,
        })
        .then((res) => {
          console.log(res.data.user)
          dispatch(updateProfile(res.data));
          enqueueSnackbar('User details, update successful!');
        });
    } catch (error) {
      console.error(error);
    }
  };

  // const handleDrop = useCallback(
  //   (acceptedFiles) => {
  //     const file = acceptedFiles[0];

  //     if (file) {
  //       setValue(
  //         'photoURL',
  //         Object.assign(file, {
  //           preview: URL.createObjectURL(file),
  //         })
  //       );
  //     }
  //   },
  //   [setValue]
  // );

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ py: 10, px: 3, textAlign: 'center' }}>
            <MyAvatar
              sx={{
                mx: 'auto',
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: 'common.white',
                width: { xs: 80, md: 128 },
                height: { xs: 80, md: 128 },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                mt: 2,
                mx: 'auto',
                display: 'block',
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
              employeeUser image generated using the user's <br />
              initials
              <br />
            </Typography>
            {/* <RHFSwitch name="isPublic" labelPlacement="start" label="Public Profile" sx={{ mt: 5 }} /> */}
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'grid',
                rowGap: 3,
                columnGap: 2,
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <RHFTextField name="username" label="Username" />
              <RHFTextField name="email" label="Email Address" disabled />

              <RHFTextField name="name" label="Name" />
              <RHFTextField name="role" label="User Role" disabled />
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Save Changes
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
