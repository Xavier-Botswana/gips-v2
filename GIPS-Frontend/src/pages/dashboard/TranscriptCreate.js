import { useEffect, useState } from 'react';
import { paramCase } from 'change-case';
import { useParams, useLocation } from 'react-router-dom';
// @mui
import { Container,Box,Button } from '@mui/material';
// routes
// hooks
import useSettings from '../../hooks/useSettings';
import axios from '../../utils/axios';
// _mock_
import { _userList } from '../../_mock';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import TranscriptNewForm from '../../sections/@dashboard/super-admin/TranscriptNewForm';

// ----------------------------------------------------------------------

export default function TranscriptCreate() {
  const { themeStretch } = useSettings();
  const { pathname } = useLocation();
  const { name = '' } = useParams();
  const isEdit = pathname.includes('update');
  const [courseData, setCourseData] = useState();
  const [students, setStudents] = useState([]);
  const segments = pathname.split('/');
  const courseId = segments[segments.length - 2];
  useEffect(() => {
    const getStudentDetails = async () => {
      const response = await axios.get(`v1/courses/${courseId}`);
      setCourseData(response.data);
    };
    if (isEdit) getStudentDetails();
   
      axios.get('/v1/students').then((response) => {
        setStudents(response.data.data);
        console.log(response.data.data)
      });

      
   
  }, [isEdit]);
  return (
    <Page title="Super Admin: Create a new course">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={!isEdit ? 'Search & Generate Transcripts' : 'Search & Generate Transcripts '}
          links={[{ name: 'Results Manager' }, { name: 'Transcript' }, { name: !isEdit ? 'Create' : 'Edit' }]}

          // action={
          //   <Box
          //     sx={{
          //       display: 'grid',
          //       gap: 2,
          //       gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(1s, 1fr)' },
          //     }}
          //   >
          //     <Button align='end' variant="contained" onClick={null}>
          //       Generate Transcript
          //     </Button>
             
          //   </Box>
          // }
        />
        <TranscriptNewForm isEdit={isEdit} courseData={courseData} students= {students} />
      </Container>
    </Page>
  );
}
