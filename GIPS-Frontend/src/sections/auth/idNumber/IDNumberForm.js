import PropTypes from 'prop-types';
import * as Yup from 'yup';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import { Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// hooks
import useIsMountedRef from '../../../hooks/useIsMountedRef';
// components
import { FormProvider, RHFTextField } from '../../../components/hook-form';

// ----------------------------------------------------------------------

IDNumberForm.propTypes = {
  onSent: PropTypes.func,
  onGetID: PropTypes.func,
};

export default function IDNumberForm({ onSent, onGetID }) {
  const isMountedRef = useIsMountedRef();

  const IDNumberFormSchema = Yup.object().shape({
    idNumber: Yup.string().required('ID Number is required'),
  });

  const methods = useForm({
    resolver: yupResolver(IDNumberFormSchema),
    defaultValues: { idNumber: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (isMountedRef.current) {

        onSent();
        onGetID(data.idNumber);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField name="idNumber" label="ID Number" />

        <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
          Submit
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
