import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
// @mui
import { Container } from '@mui/material';
// routes
// hooks
import axios from '../../utils/axios';
import { PATH_DASHBOARD } from '../../routes/paths';
import SuperUserNewForm from '../../sections/@dashboard/user/SuperUserNewForm';
import useSettings from '../../hooks/useSettings';
// _mock_
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections

// ----------------------------------------------------------------------

export default function SuperUserCreate() {
  const [userData, setUserData] = useState();

  const { themeStretch } = useSettings();
  const { pathname } = useLocation();
  const { name = '' } = useParams();
  const isEdit = pathname.includes('update');
  const titleText = isEdit ? 'Edit User' : 'Create A New User';

  const userId = pathname.split('/').slice(-2, -1)[0];

  useEffect(() => {
    const getUserDetails = async () => {
      await axios.get(`v1/users/${userId}`).then((res) => {
        axios.get('/v1/faculties').then((response) => {
          const facultyName = response.data?.find((faculty) => faculty.id === res.data?.faculty_id)?.name;
          const user = res.data;
          setUserData({ ...user, facultyName });
        });
      });
    };

    if (isEdit) getUserDetails();
  }, [isEdit]);

  return (
    <Page title={`User: ${titleText}`}>
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={!isEdit ? 'Create a new user' : 'Edit user'}
          links={[
            { name: 'List', href: PATH_DASHBOARD.superAdmin.userList },
            { name: 'Manage User' },
            { name: !isEdit ? 'Create' : 'Edit' },
          ]}
        />

        <SuperUserNewForm isEdit={isEdit} userData={userData} />
      </Container>
    </Page>
  );
}
