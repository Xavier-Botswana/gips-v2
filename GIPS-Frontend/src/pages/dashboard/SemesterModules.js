import { paramCase, capitalCase } from 'change-case';
import { useParams, useLocation } from 'react-router-dom';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// _mock_
import { _userList } from '../../_mock';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import { Modules } from '../../sections/@dashboard/admissions/account';

// ----------------------------------------------------------------------

export default function SemesterModules() {
  const { themeStretch } = useSettings();
  const { pathname, state } = useLocation();
  const { name = '' } = useParams();
  const isEdit = pathname.includes('edit');

  return (
    <Page title="Semester Registration">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={'Register For The New Semester'}
          links={[
            { name: 'Semester', href: `${PATH_DASHBOARD.student.register}` },
            // { name: 'Registration',href:`${PATH_DASHBOARD.student.semester_registration}`},
            { name: state.data?.expand?.course_id?.course_name || 'Course' },
          ]}
        />
        <Modules state={state} />
      </Container>
    </Page>
  );
}
