import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Card, Box, Container, Typography, Stack, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PATH_DASHBOARD } from '../../routes/paths';
import axios from '../../utils/axios';
import useSettings from '../../hooks/useSettings';
import Iconify from '../../components/Iconify';
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';

const WorkloadManager = () => {
  const [faculties, setFaculties] = useState();

  useEffect(() => {
    const getFaculties = async () => {
      const response = await axios.get('/v1/faculties');
      setFaculties(response.data);
    };

    console.log({ faculties });

    getFaculties();
  }, []);

  const theme = useTheme();
  const { themeStretch } = useSettings();
  return (
    <Page title="Workload Manger">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Manage Academia Workload Here"
          links={[{ name: 'Dashboard', href: PATH_DASHBOARD.hod.workloadManager }, { name: 'Workload Manager' }]}
        />

        <Grid container spacing={3}>
          {faculties?.map((faculty) => (
            <Grid key={faculty.id} item xs={12} md={4}>
              <FacultyCard key={faculty.id} faculty={faculty} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Page>
  );
};

const FacultyCard = ({ faculty }) => {
  const navigate = useNavigate();
  const buildPath = (path) => {
    const newPath = path.replace(':faculty_id', faculty.id);
    return navigate(newPath);
  };

  return (
    <Card
      sx={{ display: 'flex', alignItems: 'center', p: 3, height: '150px', cursor: 'pointer' }}
      onClick={() => {
        navigate(`/dashboard/hod/workload_manager/faculty/${faculty.id}`);
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Stack direction="row" alignItems="start" justifyContent="space-between" paddingBottom="10px">
          <Stack sx={{ flexDirection: 'row' }}>
            <Typography
              sx={{ color: '#437ba6', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center' }}
            >
              Semester 1 |{/* {faculty.id} */}
            </Typography>
            <Typography sx={{ color: '#b0be3b', fontSize: '14px', display: 'flex', paddingLeft: '2px' }}>
              Open
            </Typography>
          </Stack>
          <Typography sx={{ color: 'text.secondary', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
            <Iconify icon="eva:arrow-ios-forward-fill" width={20} height={20} />
          </Typography>
        </Stack>
        <Typography variant="h5" sx={{ color: '#2b308c' }}>
          {faculty.name}
        </Typography>
      </Box>
    </Card>
  );
};

export default WorkloadManager;
