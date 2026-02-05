// @mui
import { useTheme } from '@mui/material/styles';
import { Container, Grid, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
// import axios from 'axios';
import axios from '../../utils/axios';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
// sections
import { EcommerceWidgetSummary } from '../../sections/@dashboard/general/e-commerce';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { PATH_DASHBOARD } from '../../routes/paths';

// ----------------------------------------------------------------------
export default function GeneralEcommerce() {
  const [courses, setCourse] = useState();
  const [semester, setSemester] = useState();

  useEffect(() => {
    const fetch = async () => {
      await axios.get('/v1/courses').then((response) => {
        console.log(response.data.courses);
        setCourse(response.data.courses);
      });
      await axios.get('/v1/semesters').then((response) => {
        // console.log(response.data.filter((item) => item.active === true));
        const semester = response.data.find((item) => item.active === true)?.name;
        setSemester(semester);
      });
    };
    fetch();
  }, [semester]);

  const theme = useTheme();
  const { themeStretch } = useSettings();

  return (
    <Page title="Courses">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading=" Pick a course and Enroll"
          links={[{ name: 'Courses', href: PATH_DASHBOARD.general.apply }, { name: 'Enrollment' }]}
        />
        <Grid container spacing={3}>
          {courses?.map((course) => (
            <Grid item xs={12} md={4}>
              {/* here make sure to send the id of the course here  */}
              <EcommerceWidgetSummary
                title={`${semester || 'Semester'} | `}
                name={course.course_name}
                course={course}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Page>
  );
}
