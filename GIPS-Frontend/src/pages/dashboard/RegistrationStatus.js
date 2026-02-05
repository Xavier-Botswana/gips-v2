import { useEffect, useState } from 'react';
import orderBy from 'lodash/orderBy';
// form
import { useForm } from 'react-hook-form';

// @mui
import { Container, Typography, Grid, Stack } from '@mui/material';
// redux
import axios from '../../utils/axios';
import { useDispatch, useSelector } from '../../redux/store';

// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { RegistrationStatus } from '../../sections/@dashboard/general/e-commerce';
import useAuth from '../../hooks/useAuth';
// ----------------------------------------------------------------------

export default function EcommerceShop() {
  const { themeStretch } = useSettings();
  const [userRegistration, setRegistration] = useState();
  const dispatch = useDispatch();
  const { record, isAuthenticated } = useSelector((state) => {
    return state.user;
  });

  const { email, id } = record;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Prefer registration if present
        const regRes = await axios.get('/v1/registration/mine', {
          params: { page: 1, limit: 1 },
        });
        const reg = regRes.data.data?.[0];

        if (reg) {
          setRegistration(reg);
          return;
        }

        // Fallback to latest application for guests
        const appRes = await axios.get('/v1/applications/mine', {
          params: { page: 1, limit: 1 },
        });
        const app = appRes.data.data?.[0];

        setRegistration(app || undefined);
      } catch (error) {
        console.error('Data fetch failed:', error);
        setRegistration(undefined);
      }
    };

    if (record?.id) {
      fetchData();
    }
  }, [record?.id]);



  return (
    <Page title="My Registrations">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading="Registration Status"
          links={[{ name: 'Dashboard', href: PATH_DASHBOARD.general.apply }, { name: 'Enrollment' }]}
        />
        <Grid container spacing={3}>
          {/* {userRegistration?.map((registration) => ( */}
          <Grid item xs={12} md={4}>
            {/* here make sure to send the id of the course here  */}
            <RegistrationStatus
              title={`Semester ${userRegistration?.expand.semester_id?.study_semester} |`}
              name={userRegistration?.id}
              course={userRegistration?.expand?.course_id?.course_name || userRegistration?.expand?.option_one?.course_name}
              status={userRegistration?.reg_status || userRegistration?.status || 'Not Registered'}
              year={userRegistration?.year_of_study}
            />
          </Grid>
          {/* ))} */}
        </Grid>
      </Container>
    </Page>
  );
}
