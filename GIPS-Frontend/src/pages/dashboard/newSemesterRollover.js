import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
// @mui
import { Container } from '@mui/material';
// routes
// hooks
import axios from '../../utils/axios';
import { PATH_DASHBOARD } from '../../routes/paths';
import NewSemesterForm from '../../sections/@dashboard/user/NewSemesterForm';
import useSettings from '../../hooks/useSettings';
// _mock_
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections

// ----------------------------------------------------------------------

export default function NewSemester() {
  const [semester, setSemester] = useState([]);
  const { themeStretch } = useSettings();
  const { pathname } = useLocation();
  const { name = '' } = useParams();
  const isEdit = pathname.includes('update');
  const titleText = isEdit ? 'Edit User' : 'Create A New User';

  useEffect(() => {
    const getDetails = async () => {
      await axios.get(`/v1/semesters`).then((res) => {
        const response = res.data;
        const activeSemester = response.find((sm) => {
          return sm.active === true;
        });
        setSemester(activeSemester);
      });
    };
    getDetails();
  }, []);

  return (
    <Page title={`User: ${titleText}`}>
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={!isEdit ? 'Start A New Semester' : 'Edit user'}
          links={[{ name: 'Semester', href: PATH_DASHBOARD.superAdmin.userList }, { name: 'New Semester' }]}
        />

        <NewSemesterForm isEdit={!false} data={semester} />
      </Container>
    </Page>
  );
}
