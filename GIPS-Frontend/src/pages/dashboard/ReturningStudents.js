// @mui
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { Container, Grid, Typography, Paper, Box, Stack, Button } from '@mui/material';
import Iconify from '../../components/Iconify';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
// sections
import { SemesterRegWidget } from '../../sections/@dashboard/general/e-commerce';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import axios from '../../utils/axios';

// ----------------------------------------------------------------------

// Component for displaying payment status message
const PaymentStatusMessage = () => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 6,
        textAlign: 'center',
        backgroundColor: theme.palette.grey[50],
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Iconify
          icon="material-symbols:payment-off"
          sx={{
            width: 80,
            height: 80,
            color: theme.palette.warning.main,
            mb: 2,
          }}
        />
      </Box>

      <Typography variant="h5" sx={{ mb: 2, color: theme.palette.text.primary }}>
        Registration Suspended
      </Typography>

      <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary, maxWidth: 400, mx: 'auto' }}>
       Registration is currently unavailable due to pending payment obligations. 
       Please settle any outstanding fees with the finance office to complete your course registration.
      </Typography>

      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="eva:phone-call-fill" />}
          onClick={() => {
            // Add your contact logic here
            window.open('tel:+1234567890', '_self');
          }}
        >
          Contact Finance Office
        </Button>

        <Button
          variant="outlined"
          color="primary"
          startIcon={<Iconify icon="eva:refresh-fill" />}
          onClick={() => {
            // Add refresh logic here
            window.location.reload();
          }}
        >
          Refresh Status
        </Button>
      </Stack>
    </Paper>
  );
};

export default function RegisterSemester() {
  const theme = useTheme();
  const [courses, setCourses] = useState([]);
  const [student, setStudent] = useState();
  const [currentSemester, setCurrentSemester] = useState();
  const { themeStretch } = useSettings();
  const { record, isAuthenticated } = useSelector((state) => {
    return state.user;
  });

  useEffect(() => {
    const fetch = async () => {
      await axios.get(`v1/students/all`).then(async (res) => {
        const data = res.data.data;
        const studentDetails = data.find((info) => {
          return info.user_id === record.id;
        });

        setStudent(studentDetails);
        console.log({studentDetails})

        await axios.get(`v1/courses`).then((res) => {
          const courses = res.data.courses;
          const filterCourse = courses.filter((course) => {
            return course.id === studentDetails?.course_id;
          });
          setCourses(filterCourse);
        });
        await axios.get(`v1/semesters`).then((response) => {
          const semesterResponse = response.data;
          const currentSemester = semesterResponse.filter((sm) => {
            return sm.active === true;
          });
          const openSemester = currentSemester[0];
          setCurrentSemester(openSemester);
        });
      });
    };
    fetch();
  }, []);

  return (
    <Page title="Courses">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading="Register For The New Semester"
          links={[
            { name: 'Semester', key: '1' },
            { name: 'Registration', key: '2' },
          ]}
        />
        {!student?.withhold_results ? (
          <Grid container spacing={3}>
            {courses.map((item, index) => (
              <Grid item xs={12} md={4} key={item.id || index}>
                <SemesterRegWidget
                  title={`Semester ${student?.expand?.semester_id?.study_semester} |`}
                  status={`${
                    student?.expand?.semester_id?.study_semester === currentSemester?.study_semester
                      ? 'Open |'
                      : 'Closed |'
                  } `}
                  registered={`${student?.reg_status === 'approved' ? 'Registered' : 'Pending'}`}
                  name={item.name}
                />
              </Grid>
            ))}
          </Grid>
        ) : 
          PaymentStatusMessage()
        }
      </Container>
    </Page>
  );
}
