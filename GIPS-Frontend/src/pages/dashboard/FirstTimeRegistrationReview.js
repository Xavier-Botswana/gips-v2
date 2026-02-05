import { paramCase, capitalCase } from 'change-case';
import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

// @mui
import { Container } from '@mui/material';
import axios from '../../utils/axios';
// routes
import ApplicationsDetails from '../../sections/@dashboard/admissions/ApplicationsDetails';
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// _mock_
import { _userList } from '../../_mock';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import FirstRegistrationDetails from '../../sections/@dashboard/admissions/FirstRegistrationDetails';
// sections

// ----------------------------------------------------------------------

export default function FirstTimeRegistrationReview() {
  const { themeStretch } = useSettings();
  const { pathname } = useLocation();
  const { name = '' } = useParams();
  const [applicationList, setApplicationList] = useState({});
  const [details, setDetails] = useState({});

  const isEdit = pathname.includes('edit');

  useEffect(async () => {
    await axios.get(`/v1/registration/${name}`).then(async (response) => {
      await axios.get(`/v1/guests`).then(async (res) => {
        const user = res.data.data.find((item) => {
          return item.national_id === response.data.idNumber;
        });

        await axios.get(`/v1/semesters`).then((res) => {
          const semesterResponse = res.data;

          const semeste = semesterResponse.find((sm) => {
            return sm.id === response.data.semester_id;
          });

          const semesterName = semeste.name;

          const details = { ...user, ...response.data, semesterName };
          setApplicationList(details);
          console.log(details);
        });
      });
    });
  }, []);
  return (
    <Page title="Admissions: Manage Applications">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={'View Registrant Details Here'}
          links={[{ name: 'Applications', href: PATH_DASHBOARD.root }, { name: 'Manage Registrations' }]}
        />
        <FirstRegistrationDetails isEdit="true" currentUser={applicationList} applicantDetails={applicationList} />
      </Container>
    </Page>
  );
}
