import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Container, Grid } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import CourseWidget from '../../sections/@dashboard/general/Cards/CourseCard';
import axios from '../../utils/axios';
import useSettings from '../../hooks/useSettings';
import { PATH_DASHBOARD } from '../../routes/paths';

import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';

const WorkLoadManagerFaculty = () => {
  const { pathname } = useLocation();
  const theme = useTheme();
  const { themeStretch } = useSettings();

  const [courses, setCourses] = useState([]);

  const facultyId = pathname.split('/')[5];

  useEffect(() => {
    const getCourses = async () => {
      const response = await axios.get(`v1/courses/faculty/${facultyId}`);
      setCourses(response.data.courses);
    };

    getCourses();
  }, []);
  return (
    <Page title="Workload Manger">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Select the Program Here"
          links={[
            { name: 'List', href: PATH_DASHBOARD.hod.workloadManager },
            { name: 'Workload Manager' },
            { name: 'Faculty Name' },
          ]}
        />
        <Grid container spacing={3}>
          {courses?.map((course) => {
            return (
              <Grid key={course.id} item xs={12} md={4}>
                <CourseWidget
                  title="Semester 1 |"
                  name={course.course_name}
                  courseId={course.id}
                  facultyId={facultyId}
                />
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Page>
  );
};

export default WorkLoadManagerFaculty;
