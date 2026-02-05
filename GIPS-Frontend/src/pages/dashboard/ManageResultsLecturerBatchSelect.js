import { useState, useEffect } from 'react';

import { Alert, Card, Box, Stack, Container, Typography, Grid, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import Iconify from '../../components/Iconify';
import { PATH_DASHBOARD } from '../../routes/paths';
import axios from '../../utils/axios';
import useSettings from '../../hooks/useSettings';
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';

export default function ManageResultsLecturerBatchSelect() {
  const { themeStretch } = useSettings();
  const navigate = useNavigate();
  const params = useParams();
  const { module_id: moduleId } = params;

  const [batchList, setBatchList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBatchByModuleId = async () => {
      try {
        setLoading(true);
        setError('');

        const all = [];
        let currentPage = 1;
        let totalPages = 1;

        while (currentPage <= totalPages) {
          // eslint-disable-next-line no-await-in-loop
          const res = await axios.get(`/v1/results/batch/${moduleId}`, {
            params: { page: currentPage, limit: 500 },
          });

          all.push(...(res.data.data || []));
          totalPages = res.data.totalPages || 1;
          currentPage += 1;
        }

        setBatchList(all);
      } catch (err) {
        setError('Failed to load batches');
        setBatchList([]);
      } finally {
        setLoading(false);
      }
    };

    if (moduleId) {
      fetchBatchByModuleId();
    }
  }, [moduleId]);

  return (
    <Page title="Manage Results: Choose Batch">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Select A Batch"
          links={[{ name: 'Results Manager' }, { name: 'Batch Selection' }, { name: 'List' }]}
        />

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {!loading && !error && (
          <Grid container spacing={3}>
            {batchList.map((batch) => (
              <Grid key={batch.id} item xs={12} md={4}>
                <Card
                  sx={{ display: 'flex', alignItems: 'center', p: 3, height: '150px', cursor: 'pointer' }}
                  onClick={() => {
                    navigate(`${PATH_DASHBOARD.hod.manageResults}/${batch.id}`, {
                      state: batch.expand?.results,
                    });
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
                        {batch.expand?.moduleId?.name || 'Module'}
                      </Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                        <Iconify icon="eva:arrow-ios-forward-fill" width={20} height={20} />
                      </Typography>
                    </Stack>

                    <Typography variant="h6" sx={{ color: '#2b308c' }}>
                      {batch.expand?.lecturerId?.name || 'Lecturer'}
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
