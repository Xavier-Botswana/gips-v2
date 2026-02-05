import { paramCase } from 'change-case';
import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
// @mui
import { Container } from '@mui/material';
// routes
import axioss from 'axios';
// hooks
import useSettings from '../../hooks/useSettings';
// _mock_
import { _userList } from '../../_mock';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import StudentDetailsForm from '../../sections/@dashboard/admissions/StudentDetailsForm';
import axios from '../../utils/axios';

// ----------------------------------------------------------------------

export default function UserCreate() {
  const { themeStretch } = useSettings();
  const { pathname } = useLocation();
  const { name = '' } = useParams();
  const [studentData, setStudentData] = useState();

  const isEdit = pathname.includes('edit');

  useEffect(async () => {
    axios.get(`/v1/students/${name}`).then(async (res) => {
      const data = res.data;

      await axios.get(`/v1/semesters/${data.semester_id}`).then(async (semester) => {
        const semesterName = semester.data.name;

        // await axios.get(`api/v1/guests/${data.user_id}`).then(async (response) => {
        await axios.get(`/v1/guests`).then(async (res) => {
          const guest = res.data.data.find((re) => {
            return re.user_id === data.user_id;
          });

          await axios.get(`/v1/users/${data.user_id}`).then(async (response) => {
            const userD = response.data;

            const details = {
              ...userD,
              ...data,
              semesterName,
              date_of_birth: data.date_of_birth,
            };
            setStudentData(details);

            console.log('aaaa');
            console.log(details);
          });
        });
      });
    });
  }, []);

  // const currentUser = _userList.find((user) => paramCase(user.name) === name);

  return (
    <Page title="Admissions: Manage Student">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={!isEdit ? 'Apply For The New Semester' : 'Edit Student Details'}
          links={[{ name: 'Dashboard' }, { name: 'Manage Student' }]}
        />

        <StudentDetailsForm isEdit={isEdit} currentUser={studentData} />
      </Container>
    </Page>
  );
}
