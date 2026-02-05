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
import SemesterRegistrationForm from '../../sections/@dashboard/students/SesterRegistrationForm';

// ----------------------------------------------------------------------

export default function StudentSemesterReg() {
  const { themeStretch } = useSettings();
  const { pathname, state } = useLocation();
  const { name = '' } = useParams();
  const isEdit = pathname.includes('edit');

  const currentUser = _userList.find((user) => paramCase(user.name) === name);

  return (
    <Page title="Semester Registration">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={'Register For The New Semester'}
          links={[{ name: 'Register', href: `${PATH_DASHBOARD.student.register}` }, { name: state?.prog_name }]}
        />

        <SemesterRegistrationForm isEdit={isEdit} currentUser={currentUser} />
      </Container>
    </Page>
  );
}
