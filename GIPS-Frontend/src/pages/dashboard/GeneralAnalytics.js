// // // @mui
// // import { Grid, Container, Typography } from '@mui/material';
// // // hooks
// // import useSettings from '../../hooks/useSettings';
// // // components
// // import Page from '../../components/Page';
// // // sections
// // import {
// //   AnalyticsTasks,
// //   AnalyticsNewsUpdate,
// //   AnalyticsOrderTimeline,
// //   AnalyticsCurrentVisits,
// //   AnalyticsWebsiteVisits,
// //   AnalyticsTrafficBySite,
// //   AnalyticsWidgetSummary,
// //   AnalyticsCurrentSubject,
// //   AnalyticsConversionRates,
// // } from '../../sections/@dashboard/general/analytics';

// // // ----------------------------------------------------------------------

// // export default function GeneralAnalytics() {
// //   const { themeStretch } = useSettings();

// //   return (
// //     <Page title="General: Analytics">
// //       <Container maxWidth={themeStretch ? false : 'xl'}>
// //         <Typography variant="h4" sx={{ mb: 5 }}>
// //           Hi, Welcome back
// //         </Typography>

// //         <Grid container spacing={3}>

// //           <Grid item xs={12} sm={6} md={3}>
// //             <AnalyticsWidgetSummary title="Lecturers" total={172} color="warning" icon={'icon-[ant-design--rise-outlined]'}/>
// //           </Grid>

// //           <Grid item xs={12} sm={6} md={3}>
// //             <AnalyticsWidgetSummary title="Students" total={400} icon={'icon-[ant-design--rise-outlined]'} />
// //           </Grid>

// //           <Grid item xs={12} sm={6} md={3}>
// //             <AnalyticsWidgetSummary title="Courses" total={831} color="info" icon={'icon-[ant-design--rise-outlined]'} />
// //           </Grid>

// //             <Grid item xs={12} sm={6} md={3}>
// //             <AnalyticsWidgetSummary title="Faculties" total={331} color="info" icon={'icon-[ant-design--rise-outlined]'} />
// //           </Grid>

// //           {/* <Grid item xs={12} sm={6} md={3}>
// //             <AnalyticsWidgetSummary title="Bug Reports" total={234} color="error" icon={'ant-design:bug-filled'} />
// //           </Grid>

// //           <Grid item xs={12} md={6} lg={8}>
// //             <AnalyticsWebsiteVisits />
// //           </Grid> */}

// //           <Grid item xs={12} md={6} lg={4}>
// //             <AnalyticsCurrentVisits />
// //           </Grid>

// //           <Grid item xs={12} md={6} lg={8}>
// //             <AnalyticsConversionRates />
// //           </Grid>

// //           {/* <Grid item xs={12} md={6} lg={4}>
// //             <AnalyticsCurrentSubject />
// //           </Grid>

// //           <Grid item xs={12} md={6} lg={8}>
// //             <AnalyticsNewsUpdate />
// //           </Grid> */}

// //           {/* <Grid item xs={12} md={6} lg={4}>
// //             <AnalyticsOrderTimeline />
// //           </Grid> */}

// //           {/* <Grid item xs={12} md={6} lg={4}>
// //             <AnalyticsTrafficBySite />
// //           </Grid>

// //           <Grid item xs={12} md={6} lg={8}>
// //             <AnalyticsTasks />
// //           </Grid> */}
// //         </Grid>
// //       </Container>
// //     </Page>
// //   );
// // }
// // @mui
// import { useState, useEffect } from 'react';
// import { Grid, Container, Typography } from '@mui/material';

// import { useSelector } from 'react-redux';
// // hooks
// import axios from '../../utils/axios';
// import useSettings from '../../hooks/useSettings';

// // components
// import Page from '../../components/Page';
// // sections
// import {
//   AnalyticsCurrentVisits,
//   AnalyticsWebsiteVisits,
//   AnalyticsWidgetSummary,
//   AnalyticsConversionRates,
//   AnalyticsFacultyTable,
// } from '../../sections/@dashboard/general/analytics';

// // ----------------------------------------------------------------------

// export default function GeneralAnalytics() {
//   const [byProgram, setPrograms] = useState();
//   const [faculties, setFaculties] = useState(0);
//   const [courses, setCourses] = useState(0);
//   const [students, setStudents] = useState(0);
//   const [lecturers, setLecturers] = useState(0);

//   const { record } = useSelector((state) => {
//     return state.user;
//   });

//   useEffect(() => {
//     // Make a GET request for each endpoint
//     axios
//       .get(`/v1/lecturers`)
//       .then((response) => {
//         console.log('Lecturers:', response.data);
//         setLecturers(response.data.totalRecords);
//       })
//       .catch((error) => {
//         console.error('Error fetching faculty data:', error);
//       });

//     axios
//       .get(`/v1/students`)
//       .then((response) => {
//         console.log('Students:', response.data);
//         setStudents(response.data.totalRecords);
//       })
//       .catch((error) => {
//         console.error('Error fetching program data:', error);
//       });

//     axios
//       .get(`/v1/courses`)
//       .then((response) => {
//         console.log('Courses:', response);
//         setCourses(response.data.courses.length);
//       })
//       .catch((error) => {
//         console.error('Error fetching module data:', error);
//       });

//     axios
//       .get(`/v1/faculties`)
//       .then((response) => {
//         console.log('Faculties:', response);
//         setFaculties(response.data.length);
//       })
//       .catch((error) => {
//         console.error('Error fetching year of study data:', error);
//       });
//   }, []);

//   const { themeStretch } = useSettings();

//   return (
//     <Page title="General: Analytics">
//       <Container maxWidth={themeStretch ? false : 'xl'}>
//         <Typography variant="h4" sx={{ mb: 5 }}>
//           Hi, Welcome back
//         </Typography>

//         <Grid container spacing={3}>
//           <Grid item xs={12} sm={6} md={3}>
//             <AnalyticsWidgetSummary
//               title="Lecturers"
//               total={lecturers}
//               color="warning"
//               icon={'icon-[ant-design--rise-outlined]'}
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <AnalyticsWidgetSummary title="Students" total={students} icon={'icon-[ant-design--rise-outlined]'} />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <AnalyticsWidgetSummary
//               title="Courses"
//               total={courses}
//               color="info"
//               icon={'icon-[ant-design--rise-outlined]'}
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <AnalyticsWidgetSummary
//               title="Faculties"
//               total={faculties}
//               color="info"
//               icon={'icon-[ant-design--rise-outlined]'}
//             />
//           </Grid>
//           <Grid item xs={12} md={6} lg={12}>
//             <AnalyticsCurrentVisits />
//           </Grid>

//           {record.role === 'superAdmin' && (
//             <Grid item xs={12} md={6} lg={12}>
//               <AnalyticsConversionRates />
//             </Grid>
//           )}
//           {/* <Grid item xs={12} md={6} lg={4}>
//             <AnalyticsCurrentSubject />
//           </Grid> */}
//           {/* <Grid item xs={12} md={6} lg={8}>
//             <AnalyticsNewsUpdate />
//           </Grid> */}
//           {/* <Grid item xs={12} md={6} lg={4}>
//             <AnalyticsOrderTimeline />
//           </Grid>

//            <Grid item xs={12} md={6} lg={4}>
//             <AnalyticsTrafficBySite />
//           </Grid> */}
//           {record.role === 'superAdmin' && (
//             <Grid item xs={12} md={12} lg={12}>
//               <AnalyticsFacultyTable />
//             </Grid>
//           )}
//           <Grid item xs={12} md={12} lg={12}>
//             <AnalyticsWebsiteVisits />
//           </Grid>
//         </Grid>
//       </Container>
//     </Page>
//   );
// }

// // @mui
// import { Grid, Container, Typography } from '@mui/material';
// // hooks
// import useSettings from '../../hooks/useSettings';
// // components
// import Page from '../../components/Page';
// // sections
// import {
//   AnalyticsTasks,
//   AnalyticsNewsUpdate,
//   AnalyticsOrderTimeline,
//   AnalyticsCurrentVisits,
//   AnalyticsWebsiteVisits,
//   AnalyticsTrafficBySite,
//   AnalyticsWidgetSummary,
//   AnalyticsCurrentSubject,
//   AnalyticsConversionRates,
// } from '../../sections/@dashboard/general/analytics';

// // ----------------------------------------------------------------------

// export default function GeneralAnalytics() {
//   const { themeStretch } = useSettings();

//   return (
//     <Page title="General: Analytics">
//       <Container maxWidth={themeStretch ? false : 'xl'}>
//         <Typography variant="h4" sx={{ mb: 5 }}>
//           Hi, Welcome back
//         </Typography>

//         <Grid container spacing={3}>

//           <Grid item xs={12} sm={6} md={3}>
//             <AnalyticsWidgetSummary title="Lecturers" total={172} color="warning" icon={'icon-[ant-design--rise-outlined]'}/>
//           </Grid>

//           <Grid item xs={12} sm={6} md={3}>
//             <AnalyticsWidgetSummary title="Students" total={400} icon={'icon-[ant-design--rise-outlined]'} />
//           </Grid>

//           <Grid item xs={12} sm={6} md={3}>
//             <AnalyticsWidgetSummary title="Courses" total={831} color="info" icon={'icon-[ant-design--rise-outlined]'} />
//           </Grid>

//             <Grid item xs={12} sm={6} md={3}>
//             <AnalyticsWidgetSummary title="Faculties" total={331} color="info" icon={'icon-[ant-design--rise-outlined]'} />
//           </Grid>

//           {/* <Grid item xs={12} sm={6} md={3}>
//             <AnalyticsWidgetSummary title="Bug Reports" total={234} color="error" icon={'ant-design:bug-filled'} />
//           </Grid>

//           <Grid item xs={12} md={6} lg={8}>
//             <AnalyticsWebsiteVisits />
//           </Grid> */}

//           <Grid item xs={12} md={6} lg={4}>
//             <AnalyticsCurrentVisits />
//           </Grid>

//           <Grid item xs={12} md={6} lg={8}>
//             <AnalyticsConversionRates />
//           </Grid>

//           {/* <Grid item xs={12} md={6} lg={4}>
//             <AnalyticsCurrentSubject />
//           </Grid>

//           <Grid item xs={12} md={6} lg={8}>
//             <AnalyticsNewsUpdate />
//           </Grid> */}

//           {/* <Grid item xs={12} md={6} lg={4}>
//             <AnalyticsOrderTimeline />
//           </Grid> */}

//           {/* <Grid item xs={12} md={6} lg={4}>
//             <AnalyticsTrafficBySite />
//           </Grid>

//           <Grid item xs={12} md={6} lg={8}>
//             <AnalyticsTasks />
//           </Grid> */}
//         </Grid>
//       </Container>
//     </Page>
//   );
// }
// @mui
import { useState, useEffect } from 'react';
import { Grid, Container, Typography } from '@mui/material';

import { useSelector } from 'react-redux';
// hooks
import axios from '../../utils/axios';
import useSettings from '../../hooks/useSettings';

// components
import Page from '../../components/Page';
// sections
import {
  AnalyticsCurrentVisits,
  AnalyticsWebsiteVisits,
  AnalyticsWidgetSummary,
  AnalyticsConversionRates,
  AnalyticsFacultyTable,
  AnalyticsDepartmentPerformance,
} from '../../sections/@dashboard/general/analytics';

// ----------------------------------------------------------------------

export default function GeneralAnalytics() {
  const [byProgram, setPrograms] = useState();
  const [faculties, setFaculties] = useState(0);
  const [courses, setCourses] = useState(0);
  const [students, setStudents] = useState(0);
  const [lecturers, setLecturers] = useState(0);

  const { record } = useSelector((state) => {
    return state.user;
  });

  useEffect(() => {
    // Make a GET request for each endpoint
    axios
      .get(`/v1/lecturers`)
      .then((response) => {
        console.log('Lecturers:', response.data);
        setLecturers(response.data.totalRecords);
      })
      .catch((error) => {
        console.error('Error fetching faculty data:', error);
      });

    axios
      .get(`/v1/students`)
      .then((response) => {
        console.log('Students:', response.data);
        setStudents(response.data.totalRecords);
      })
      .catch((error) => {
        console.error('Error fetching program data:', error);
      });

    axios
      .get(`/v1/courses`)
      .then((response) => {
        console.log('Courses:', response);
        setCourses(response.data.courses.length);
      })
      .catch((error) => {
        console.error('Error fetching module data:', error);
      });

    axios
      .get(`/v1/faculties`)
      .then((response) => {
        console.log('Faculties:', response);
        setFaculties(response.data.length);
      })
      .catch((error) => {
        console.error('Error fetching year of study data:', error);
      });
  }, []);

  const { themeStretch } = useSettings();

  return (
    <Page title="General: Analytics">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Lecturers"
              total={lecturers}
              color="warning"
              icon={'icon-[ant-design--rise-outlined]'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary title="Students" total={students} icon={'icon-[ant-design--rise-outlined]'} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Courses"
              total={courses}
              color="info"
              icon={'icon-[ant-design--rise-outlined]'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Faculties"
              total={faculties}
              color="info"
              icon={'icon-[ant-design--rise-outlined]'}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={12}>
            <AnalyticsCurrentVisits />
          </Grid>

          {record.role === 'superAdmin' && (
            <Grid item xs={12} md={6} lg={12}>
              <AnalyticsConversionRates />
            </Grid>
          )}
          <Grid item xs={12} md={12} lg={12}>
            <AnalyticsDepartmentPerformance />
          </Grid>
          {/* <Grid item xs={12} md={6} lg={4}>
            <AnalyticsCurrentSubject />
          </Grid> */}
          {/* <Grid item xs={12} md={6} lg={8}>
            <AnalyticsNewsUpdate />
          </Grid> */}
          {/* <Grid item xs={12} md={6} lg={4}>
            <AnalyticsOrderTimeline />
          </Grid>

           <Grid item xs={12} md={6} lg={4}>
            <AnalyticsTrafficBySite />
          </Grid> */}
          {record.role === 'superAdmin' && (
            <Grid item xs={12} md={12} lg={12}>
              <AnalyticsFacultyTable />
            </Grid>
          )}
          <Grid item xs={12} md={12} lg={12}>
            <AnalyticsWebsiteVisits />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}

