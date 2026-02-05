// import { useState, useEffect } from 'react';

// import { useSelector } from 'react-redux';
// import { Card, Box, Stack, Container, Typography, Grid } from '@mui/material';
// import { useSnackbar } from 'notistack';
// import { useNavigate, useParams } from 'react-router-dom';
// import Iconify from '../../components/Iconify';
// import { PATH_DASHBOARD } from '../../routes/paths';
// import axios from '../../utils/axios';
// import useSettings from '../../hooks/useSettings';
// import Page from '../../components/Page';
// import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';

// export default function ManageResultsModuleSelect() {
//   const { record: user } = useSelector((state) => {
//     return state.user;
//   });
//   const { themeStretch } = useSettings();
//   const navigate = useNavigate();
//   const params = useParams();
//   const { year } = params;

//   const { enqueueSnackbar } = useSnackbar();
//   const [moduleList, setModuleList] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const batchResponse = await axios.get('/v1/results/batch');
//         const batchData = batchResponse.data.data;


//         const modulesResponse = await axios.get('/v1/modules');
//         const allModules = modulesResponse.data;

//         const batchMap = new Map();
//         batchData.forEach((batch) => {
//           batchMap.set(batch.moduleId, batch);
//         });

//         const filteredModules = allModules
//           .filter(
//             (module) =>
//               module.year_level === parseInt(year, 10) && module.faculty === user.faculty_id && batchMap.has(module.id)
//           )
//           .map((module) => {
//             const matchedBatch = batchMap.get(module.id);

//             const pendingCount = matchedBatch.expand.results
//               ? matchedBatch.expand.results.filter((result) => result.status === 'pending').length
//               : 0;

//             return {
//               ...module,
//               batchResults: matchedBatch,
//               pendingResultsCount: pendingCount,
//             };
//           });

//         console.log('Filtered & Enriched Modules:', filteredModules);
//         setModuleList(filteredModules);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     };

//     fetchData();
//   }, [year, user.faculty_id]);

//   return (
//     <Page title="Manage Results: Choose Module">
//       <Container maxWidth={themeStretch ? false : 'lg'}>
//         <HeaderBreadcrumbs
//           heading="Select A Module"
//           links={[{ name: 'Results Manager' }, { name: 'Module Name' }, { name: 'List' }]}
//         />
//         <Grid container spacing={3}>
//           {moduleList.map((moduleData) => {
//             console.log(moduleData);
//             return (
//               <Grid key={moduleData.id} item xs={12} md={4}>
//                 <Card
//                   sx={{ display: 'flex', alignItems: 'center', p: 3, height: '150px', cursor: 'pointer' }}
//                   onClick={() => {
//                     navigate(`${PATH_DASHBOARD.hod.manageResultsChooseLecturer}/${moduleData.id}`);
//                   }}
//                 >
//                   <Box sx={{ flexGrow: 1 }}>
//                     <Stack direction="row" alignItems="center" justifyContent="space-between" paddingBottom="10px">
//                       <Typography
//                         sx={{
//                           color: '#437ba6',
//                           fontWeight: 'bold',
//                           fontSize: '14px',
//                           display: 'flex',
//                           alignItems: 'center',
//                         }}
//                       >
//                         Semester {moduleData.expand.semester.study_semester}
//                       </Typography>
//                       <Typography
//                         sx={{ color: 'text.secondary', fontSize: '14px', display: 'flex', alignItems: 'center' }}
//                       >
//                         <Iconify icon="eva:arrow-ios-forward-fill" width={20} height={20} />
//                       </Typography>
//                     </Stack>

//                     <Typography variant="h6" sx={{ color: '#2b308c' }}>
//                       {moduleData.name}
//                     </Typography>

//                     <Typography
//                       sx={{
//                         color: moduleData.pendingResultsCount > 0 ? 'orange' : 'green',
//                         fontSize: '14px',
//                         fontWeight: 'bold',
//                         marginTop: '5px',
//                       }}
//                     >
//                       {moduleData.pendingResultsCount > 0
//                         ? `${moduleData.pendingResultsCount} result${
//                             moduleData.pendingResultsCount > 1 ? 's' : ''
//                           } pending`
//                         : 'All results processed'}
//                     </Typography>
//                   </Box>
//                 </Card>
//               </Grid>
//             );
//           })}
//         </Grid>
//       </Container>
//     </Page>
//   );
// }


import { useState, useEffect } from 'react';

import { useSelector } from 'react-redux';
import { Card, Box, Stack, Container, Typography, Grid, CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../utils/axios';
import Iconify from '../../components/Iconify';
import { PATH_DASHBOARD } from '../../routes/paths';

import useSettings from '../../hooks/useSettings';
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';

export default function ManageResultsModuleSelect() {
  const { record: user } = useSelector((state) => {
    return state.user;
  });
  const { themeStretch } = useSettings();
  const navigate = useNavigate();
  const params = useParams();
  const { year } = params;

  const { enqueueSnackbar } = useSnackbar();
  const [moduleList, setModuleList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const fetchAllBatches = async () => {
          const all = [];
          let currentPage = 1;
          let totalPages = 1;

          while (currentPage <= totalPages) {
            // eslint-disable-next-line no-await-in-loop
            const res = await axios.get('/v1/results/batch', {
              params: {
                page: currentPage,
                limit: 500,
              },
            });

            all.push(...(res.data.data || []));
            totalPages = res.data.totalPages || 1;
            currentPage += 1;
          }

          return all;
        };

        const batchData = await fetchAllBatches();

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

            const pendingCount = matchedBatch.expand.results
              ? matchedBatch.expand.results.filter((result) => result.status === 'pending').length
              : 0;

            return {
              ...module,
              batchResults: matchedBatch,
              pendingResultsCount: pendingCount,
            };
          });

        console.log('Filtered & Enriched Modules:', filteredModules);
        setModuleList(filteredModules);
      } catch (error) {
        console.error('Error fetching data:', error);
        enqueueSnackbar('Failed to load modules. Please try again.', { variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [year, user.faculty_id]);

  return (
    <Page title="Manage Results: Choose Module">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Select A Module"
          links={[{ name: 'Results Manager' }, { name: 'Module Name' }, { name: 'List' }]}
        />
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {moduleList.map((moduleData) => {
              console.log(moduleData);
              return (
                <Grid key={moduleData.id} item xs={12} md={4}>
                  <Card
                    sx={{ display: 'flex', alignItems: 'center', p: 3, height: '150px', cursor: 'pointer' }}
                    onClick={() => {
                      navigate(`${PATH_DASHBOARD.hod.manageResultsChooseLecturer}/${moduleData.id}`);
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
                          Semester {moduleData.expand.semester?.study_semester || ''}
                        </Typography>
                        <Typography
                          sx={{ color: 'text.secondary', fontSize: '14px', display: 'flex', alignItems: 'center' }}
                        >
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
                          ? `${moduleData.pendingResultsCount} result${
                              moduleData.pendingResultsCount > 1 ? 's' : ''
                            } pending`
                          : 'All results processed'}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Page>
  );
}

