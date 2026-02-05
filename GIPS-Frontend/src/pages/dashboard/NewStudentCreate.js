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
import NewStudentForm from '../../sections/@dashboard/admissions/NewStudentForm';
// import axios from '../../utils/axios';

// ----------------------------------------------------------------------

export default function UserCreate() {
  const { themeStretch } = useSettings();
  const { pathname } = useLocation();
  const { name = '' } = useParams();
  const [studentData, setStudentData] = useState();


  return (
    <Page title="Admissions: Manage Student">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={'New student Details'}
          links={[{ name: 'Dashboard' }, { name: 'Manage Student' }]}
        />

        <NewStudentForm />
      </Container>
    </Page>
  );
}
