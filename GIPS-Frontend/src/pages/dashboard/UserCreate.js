import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
// @mui
import { Container } from '@mui/material';
// routes
// hooks
import axios from 'axios';
import UserNewForm from '../../sections/@dashboard/user/UserNewForm';
import useSettings from '../../hooks/useSettings';
// _mock_
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections

// ----------------------------------------------------------------------

export default function UserCreate() {
  const [userData, setUserData] = useState();

  const { themeStretch } = useSettings();
  const { pathname } = useLocation();
  const { name = '' } = useParams();
  const isEdit = pathname.includes('update');
  const titleText = isEdit ? 'Edit User' : 'Create A New User';

  const userId = pathname.split('/').slice(-2, -1)[0];

  useEffect(() => {
    const getUserDetails = async () => {
      await axios.get(`/v1/users/${userId}`).then((response) => {
        setUserData(response?.data);
      });
    };

    if (isEdit) getUserDetails();
  }, [isEdit]);

  return (
    <Page title={`User: ${titleText}`}>
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={!isEdit ? 'Create a new user' : 'Edit user'}
          links={[{ name: 'Dashboard' }, { name: 'Manage User' }, { name: !isEdit ? 'Create' : 'Edit' }]}
        />

        <UserNewForm isEdit={isEdit} userData={userData} />
      </Container>
    </Page>
  );
}
