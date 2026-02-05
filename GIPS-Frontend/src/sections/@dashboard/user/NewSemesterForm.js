import { useEffect, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton, DesktopDateTimePicker } from '@mui/lab';
import { Grid, Card, Box, TextField, Stack } from '@mui/material';

import { FormProvider, RHFTextField, RHFSelect } from '../../../components/hook-form';
import axios from '../../../utils/axios';
import { PATH_DASHBOARD } from '../../../routes/paths';

const NewSemesterForm = ({ isEdit, data }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const Schema = Yup.object().shape({
    semester: Yup.string().required('Semester is required'),
    start: Yup.string().required('Start date is required'),
    end: Yup.string().required('End date is required'),
    code: Yup.string().required('Academic year is required'),
  });

  const defaultValues = useMemo(
    () => ({
      semester: data?.study_semester || '',
      start: data?.start_date || '',
      end: data?.end_date || '',
      code: data?.code || '',
    }),
    [data],
  );

  const methods = useForm({
    resolver: yupResolver(Schema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset, isEdit]);

  const updateSemester = async () => {
    if (!data?.id) return;

    try {
      const payload = {
        name: values.code,
        code: data.code,
        start_date: values.start,
        end_date: values.end,
        active: true,
        study_semester: values.semester,
      };

      await axios.patch(`/v1/semesters/${data.id}`, payload);
      enqueueSnackbar('Update successful');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error updating semester!', { variant: 'error' });
    }
  };

  const createNewSemester = async () => {
    try {
      const activeStudySemester = parseInt(values.semester, 10);

      const res = await axios.post('/v1/semesters/rollover', {
        activeStudySemester,
        startDate: values.start,
        endDate: values.end,
      });

      enqueueSnackbar(
        `New semester created. Updated ${res.data.data.updatedStudents} students (skipped ${res.data.data.skippedStudents}).`,
      );
      navigate(PATH_DASHBOARD.superAdmin.newSemester, { replace: true });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Semester rollover failed', { variant: 'error' });
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (isEdit && values.semester?.toString() === data?.study_semester?.toString()) {
      await updateSemester();
    } else {
      await createNewSemester();
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={submit}>
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
              <RHFTextField name="code" label="Academic Year" disabled />

              <RHFSelect name="semester" label="Semester">
                <option value="" />
                {['1', '2'].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </RHFSelect>

              <Controller
                name="start"
                control={control}
                render={({ field }) => (
                  <DesktopDateTimePicker
                    {...field}
                    label="Start date"
                    inputFormat="dd/MM/yyyy"
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                )}
              />

              <Controller
                name="end"
                control={control}
                render={({ field }) => (
                  <DesktopDateTimePicker
                    {...field}
                    label="End date"
                    inputFormat="dd/MM/yyyy"
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                )}
              />
            </Box>

            <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
                {values.semester?.toString() === data?.study_semester?.toString() ? 'Edit Semester' : 'New Semester'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default NewSemesterForm;
