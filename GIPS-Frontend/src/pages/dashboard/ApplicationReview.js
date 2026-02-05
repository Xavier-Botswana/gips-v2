import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

// @mui
import { Container } from '@mui/material';
import axios from '../../utils/axios';
// sections
import ApplicationsDetails from '../../sections/@dashboard/admissions/ApplicationsDetails';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// ----------------------------------------------------------------------

export default function ApplicationReview() {
  const { themeStretch } = useSettings();
  const { pathname } = useLocation();
  const { name = '' } = useParams();
  const [details, setDetails] = useState({});

  const isEdit = pathname.includes('edit');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`/v1/applications/${name}/details`);
        setDetails(res.data.data?.combined || {});
      } catch (error) {
        console.error('Failed to load application details:', error);
        setDetails({});
      }
    };

    if (name) {
      load();
    }
  }, [name]);
  return (
    <Page title="Admissions: Manage Applications">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={'Application Details'}
          links={[{ name: 'Dashboard' }, { name: 'Manage Application' }]}
        />

        <ApplicationsDetails isEdit={isEdit} currentUser={details} applicantDetails={details} />
      </Container>
    </Page>
  );
}
