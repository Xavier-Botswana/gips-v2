import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
// @mui
import { Container } from '@mui/material';

// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import axios from '../../utils/axios';
import StudentResultsForm from '../../sections/@dashboard/admissions/StudentResultsForm';

// ----------------------------------------------------------------------

export default function StudentResultsUpdate() {
  const { themeStretch } = useSettings();
  const { id: studentId, moduleId } = useParams();
  const moduleResults = useSelector((state) => state.moduleResults);

  const [studentData, setStudentData] = useState(undefined);

  // This route is only used for updating
  const isEdit = true;

  useEffect(() => {
    const fromStore = moduleResults?.record?.find((r) => String(r.studentId) === String(studentId));

    if (fromStore) {
      setStudentData(fromStore);
      return;
    }

    const fetchFromApi = async () => {
      if (!studentId || !moduleId) return;

      try {
        const res = await axios.get('/v1/results', {
          params: {
            page: 1,
            limit: 1,
            studentId,
            moduleId,
            sortBy: 'created',
            sortDir: 'desc',
          },
        });

        setStudentData(res.data.data?.[0]);
      } catch (error) {
        console.error('Failed to fetch student result:', error);
        setStudentData(undefined);
      }
    };

    fetchFromApi();
  }, [moduleResults?.record, moduleId, studentId]);

  return (
    <Page title="Student Results">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs heading="Edit Student Results" links={[{ name: 'Dashboard' }, { name: 'Manage Student' }]} />

        <StudentResultsForm moduleId={moduleId} isEdit={isEdit} currentUser={studentData} />
      </Container>
    </Page>
  );
}
