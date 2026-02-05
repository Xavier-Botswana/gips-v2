import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { Link as RouterLink, useNavigate} from 'react-router-dom';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import { Box,Radio,FormControlLabel,FormControl,RadioGroup,FormLabel, Card,Button, Typography, Stack,Link, IconButton } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import { FormProvider, RHFTextField } from '../../../../components/hook-form';
import { PATH_DASHBOARD } from '../../../../routes/paths';

// ----------------------------------------------------------------------

export default function AccountChangePassword() {
  const { enqueueSnackbar } = useSnackbar();

  const ChangePassWordSchema = Yup.object().shape({
    oldPassword: Yup.string().required('Old Password is required'),
    newPassword: Yup.string().min(6, 'Password must be at least 6 characters').required('New Password is required'),
    confirmNewPassword: Yup.string().oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
  });

  const defaultValues = {
    oldPassword: '',
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
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      enqueueSnackbar('Update success!');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card sx={{ p: 4 }}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>

      <Typography
            sx={{ color: '#437ba6', fontWeight: 'bold', fontSize: '24px', display: 'flex', alignItems: 'center' }}
          >
           First Year Students
          
          </Typography>
          <FormLabel  sx={{ ml:4 }} id="demo-form-control-label-placement">Modules | Semester 2</FormLabel>
      <RadioGroup
        aria-labelledby="demo-form-control-label-placement"
        name="position"
         // value={value}
    // onChange={handleChange}
        defaultValue="top"
        sx={{ pl: 8 }}
      >
       
       
       <FormControlLabel value="" control={<Radio />} label="Costing 1" />
       <FormControlLabel value="" control={<Radio />} label="Principles of Human Resources" />
       <FormControlLabel value="" control={<Radio />} label="Risk and Control Strategy" />
       <FormControlLabel value="" control={<Radio />} label="Business Organisation" />
       <FormControlLabel value="" control={<Radio />} label="ResearchMethodology" />
     
      </RadioGroup>
  
          <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
              <Button
                type="button"
                color="inherit"
                // component={RouterLink}
                // to={PATH_DASHBOARD.student.register}
                variant="outlined"
                size="large"
              >
                Discard
              </Button>
            
                <Button type="submit" variant="contained" loading={isSubmitting}
                component={RouterLink}
                to={PATH_DASHBOARD.student.semester_registration}
                size="large">
                  Finish
                </Button>
            
            </Stack>
        {/* </Stack> */}
      </FormProvider>
    </Card>
  );
}
