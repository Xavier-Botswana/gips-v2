import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import { Container, Alert, LinearProgress } from '@mui/material';
// hooks
import useSettings from '../../hooks/useSettings';
import axios from '../../utils/axios';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import CourseNewForm from '../../sections/@dashboard/super-admin/CourseNewForm';

// ----------------------------------------------------------------------

export default function CourseCreate() {
  const { themeStretch } = useSettings();
  const { pathname } = useLocation();
  const isEdit = pathname.includes('update');
  const [courseData, setCourseData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const courseId = pathname.split('/').slice(-2, -1)[0];

  useEffect(() => {
    const getCourseDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get(`v1/courses/${courseId}`);
        setCourseData(response.data);
      } catch (err) {
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    if (isEdit && courseId) getCourseDetails();
  }, [isEdit, courseId]);
  return (
    <Page title="Create a new course">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={!isEdit ? 'Create a New Course' : 'Edit Course'}
          links={[{ name: 'Dashboard' }, { name: 'Course' }, { name: !isEdit ? 'Create' : 'Edit' }]}
        />
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <CourseNewForm isEdit={isEdit} courseData={courseData} />
      </Container>
    </Page>
  );
}
