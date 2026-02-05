import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { Card, Container, Grid, Box, Stack, Button } from '@mui/material';

import { LoadingButton } from '@mui/lab';
import useSettings from '../../hooks/useSettings';

import { FormProvider, RHFSelect } from '../../components/hook-form';

import { PATH_DASHBOARD } from '../../routes/paths';
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import axios from '../../utils/axios';

const YEAR_LEVEL_OPTIONS = [
  { id: 'viokg5kyd0zf4pq', name: '1' },
  { id: 'n16x2oory115gwv', name: '2' },
  { id: 'f7woqbgg5kbegbz', name: '3' },
  { id: 'l6jkg9f0lr0tcmi', name: '4' },
];

const AssignLecturerToModule = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [lecturers, setLecturers] = useState([]);
  const { themeStretch } = useSettings();
  const { enqueueSnackbar } = useSnackbar();

  const moduleId = useMemo(() => {
    const segments = pathname.split('/');
    return segments[segments.length - 2];
  }, [pathname]);
  const ModuleLecturerSchema = Yup.object().shape({
    lecturer_id: Yup.string().required('Lecturer is required'),
    level: Yup.string().required('Level is required'),
  });

  const defaultValues = useMemo(
    () => ({
      lecturer_id: '',
      level: '',
    }),
    [],
  );

  const methods = useForm({
    resolver: yupResolver(ModuleLecturerSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    const payload = {
      module_id: moduleId,
      lecturer_id: data.lecturer_id,
      level: data.level,
    };

    try {
      await axios.post('/v1/modules/lecturer', payload);
      enqueueSnackbar('Lecturer has been assigned to module successfully!');
      navigate(`${PATH_DASHBOARD.hod.workloadManager}`);
    } catch (error) {
      enqueueSnackbar(`Failed to assign lecturer: ${error.response?.data?.message || error.message}`, {
        variant: 'error',
      });
    }
  };

  useEffect(() => {
    const getLecturers = async () => {
      try {
        const response = await axios('/v1/lecturers');
        setLecturers(response.data.data);
      } catch (err) {
        enqueueSnackbar('Failed to load lecturers', { variant: 'error' });
      }
    };

    getLecturers();
  }, [enqueueSnackbar]);

  return (
    <Page title="Assign Lecturer To Module">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Assign Facilitators Here"
          links={[{ name: 'Workload Manager', href: PATH_DASHBOARD.hod.workloadManager }, { name: 'Module Name ' }]}
        />
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
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
                  <RHFSelect name="lecturer_id" label="Lecturer">
                  <option value="" />
                    {lecturers?.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option?.name}
                      </option>
                    ))}
                  </RHFSelect>
                  <RHFSelect name="level" label="Level">
                    {YEAR_LEVEL_OPTIONS?.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option?.name}
                      </option>
                    ))}
                  </RHFSelect>
                </Box>
                <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
                  <Button
                    type="button"
                    color="inherit"
                    variant="outlined"
                    size="large"
                    // onClick={() => {
                    //   navigate(PATH_DASHBOARD.general.apply);
                    // }}
                  >
                    Discard
                  </Button>
                  <LoadingButton type="submit" variant="contained" loading={isSubmitting} size="large">
                    Submit
                  </LoadingButton>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </FormProvider>
      </Container>
    </Page>
  );
};

export default AssignLecturerToModule;
