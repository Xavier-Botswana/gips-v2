import { useState, useEffect } from 'react';

import { useSelector } from 'react-redux';
import { Alert, Card, Box, Stack, Container, Typography, Grid, CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useNavigate, useParams } from 'react-router-dom';
import Iconify from '../../components/Iconify';
import { PATH_DASHBOARD } from '../../routes/paths';
import axios from '../../utils/axios';
import useSettings from '../../hooks/useSettings';
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';

async function fetchAllPages(fetchPage) {
  const all = [];
  let currentPage = 1;
  let totalPages = 1;

  while (currentPage <= totalPages) {
    // eslint-disable-next-line no-await-in-loop
    const res = await fetchPage(currentPage);
    all.push(...(res.data.data || []));
    totalPages = res.data.totalPages || 1;
    currentPage += 1;
  }

  return all;
}

export default function ManageResultsModuleSelectSup() {
  const { record: user } = useSelector((state) => state.user);
  const { themeStretch } = useSettings();
  const navigate = useNavigate();
  const params = useParams();
  const { year } = params;

  const { enqueueSnackbar } = useSnackbar();
  const [moduleList, setModuleList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');

      try {
        const batchData = await fetchAllPages((p) =>
          axios.get('/v1/results/batch', {
            params: { page: p, limit: 500 },
          })
        );

        const modulesResponse = await axios.get('/v1/modules');
        const allModules = modulesResponse.data;

        const batchMap = new Map();
        batchData.forEach((batch) => {
          batchMap.set(batch.moduleId, batch);
        });

        const filteredModules = allModules
          .filter(
            (module) =>
              module.year_level === parseInt(year, 10) && module.faculty === user.faculty_id && batchMap.has(module.id)
          )
          .map((module) => {
            const matchedBatch = batchMap.get(module.id);
            const pendingCount = matchedBatch.expand?.results
              ? matchedBatch.expand.results.filter((result) => result.status === 'pending').length
              : 0;

            return {
              ...module,
              batchResults: matchedBatch,
              pendingResultsCount: pendingCount,
            };
          });

        setModuleList(filteredModules);
      } catch (err) {
        setError('Failed to load modules');
        enqueueSnackbar('Failed to load modules. Please try again.', { variant: 'error' });
        setModuleList([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (year && user?.faculty_id) {
      fetchData();
    }
  }, [year, user?.faculty_id]);

  return (
    <Page title="Manage Results: Choose Module">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Select A Module"
          links={[{ name: 'Results Manager' }, { name: 'Module Name' }, { name: 'List' }]}
        />

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!isLoading && error && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {!isLoading && !error && (
          <Grid container spacing={3}>
            {moduleList.map((moduleData) => (
              <Grid key={moduleData.id} item xs={12} md={4}>
                <Card
                  sx={{ display: 'flex', alignItems: 'center', p: 3, height: '150px', cursor: 'pointer' }}
                  onClick={() => {
                    navigate(`${PATH_DASHBOARD.hod.manageResultsChooseLecturerSup}/${moduleData.id}`);
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" paddingBottom="10px">
                      <Typography
                        sx={{
                          color: '#437ba6',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        Semester {moduleData.expand?.semester?.study_semester || ''}
                      </Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                        <Iconify icon="eva:arrow-ios-forward-fill" width={20} height={20} />
                      </Typography>
                    </Stack>

                    <Typography variant="h6" sx={{ color: '#2b308c' }}>
                      {moduleData.name}
                    </Typography>

                    <Typography
                      sx={{
                        color: moduleData.pendingResultsCount > 0 ? 'orange' : 'green',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        marginTop: '5px',
                      }}
                    >
                      {moduleData.pendingResultsCount > 0
                        ? `${moduleData.pendingResultsCount} result${moduleData.pendingResultsCount > 1 ? 's' : ''} pending`
                        : 'All results processed'}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Page>
  );
}
