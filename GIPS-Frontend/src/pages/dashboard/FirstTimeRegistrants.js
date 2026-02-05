import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, CircularProgress, Alert, Box } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import FirstTimeRegForm from '../../sections/@dashboard/user/FirstTimeRegForm';
import axios from '../../utils/axios';

// ----------------------------------------------------------------------

export default function FirstTimeRegistrants() {
  const { themeStretch } = useSettings();
  const { record } = useSelector((state) => state.user);
  const email = record?.email;
  const { pathname } = useLocation();
  const isEdit = pathname.includes('edit');
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const guestsRes = await axios.get('/v1/guests');
        const guest = guestsRes.data.data.find((item) => item.user_id === record.id);
        if (!guest) {
          if (mounted) setError('Guest record not found for current user');
          return;
        }

        const usersRes = await axios.get('/v1/users');
        const user = usersRes.data.users.find((item) => item.id === record.id);

        const applicationsRes = await axios.get('v1/applications', {
          params: { q: guest.national_id },
        });
        const application = applicationsRes.data.data.find((item) => item.expand?.guest_id?.id === guest.id);

        const registrationRes = await axios.get('/v1/registration/mine');
        const latestRegistration = registrationRes.data.data.find(
          (reg) => reg.email === email && reg.registration_type === '',
        );

        const merged = {
          ...guest,
          ...user,
          userid: user?.id,
          ...(latestRegistration || application || {}),
        };

        if (mounted) setDetails(merged);
      } catch (err) {
        if (mounted) setError('Failed to load registration data');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (record?.id) {
      fetchData();
    } else {
      setLoading(false);
      setError('User not available');
    }

    return () => {
      mounted = false;
    };
  }, [email, record?.id]);

  if (loading) {
    return (
      <Page title="Registration: Semester Registration">
        <Container maxWidth={themeStretch ? false : 'lg'}>
          <HeaderBreadcrumbs
            heading="Please update the form to register for a new Semester"
            links={[{ name: 'Semester', href: PATH_DASHBOARD.root }, { name: 'Enrollment' }]}
          />
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={24} />
            <span>Loading registration data...</span>
          </Box>
        </Container>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="Registration: Semester Registration">
        <Container maxWidth={themeStretch ? false : 'lg'}>
          <HeaderBreadcrumbs
            heading="Please update the form to register for a new Semester"
            links={[{ name: 'Semester', href: PATH_DASHBOARD.root }, { name: 'Enrollment' }]}
          />
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        </Container>
      </Page>
    );
  }

  return (
    <Page title="Registration: Semester Registration">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Please update the form to register for a new Semester"
          links={[{ name: 'Semester', href: PATH_DASHBOARD.root }, { name: 'Enrollment' }]}
        />
        <FirstTimeRegForm isEdit={isEdit} currentUser={details} applicantDetails={details} />
      </Container>
    </Page>
  );
}
