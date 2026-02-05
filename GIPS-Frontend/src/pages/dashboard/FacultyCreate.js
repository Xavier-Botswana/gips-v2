import { useEffect, useState } from 'react';
import { paramCase } from 'change-case';
import { useParams, useLocation } from 'react-router-dom';
// @mui
import { Container } from '@mui/material';
import FacultyNewForm from '../../sections/@dashboard/super-admin/FacultyNewForm';
// hooks
import useSettings from '../../hooks/useSettings';
import axios from '../../utils/axios';
// _mock_
import { _userList } from '../../_mock';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections

// ----------------------------------------------------------------------

export default function FacultyCreate() {
  const { themeStretch } = useSettings();
  const { pathname } = useLocation();
  const { name = '' } = useParams();
  const isEdit = pathname.includes('update');
  const [facultyData, setfacultyData] = useState();
  const segments = pathname.split('/');
  const facultyId = segments[segments.length - 2];
  useEffect(() => {
    const getCourseDetails = async () => {
      const response = await axios.get(`/v1/faculties/${facultyId}`);
      const hods = await axios.get(`/v1/hod`);
      const facilitator = hods.data.hods.find((hod) => hod.name === response.data?.expand?.facilitator?.name)?.id || '';

      setfacultyData({ ...response.data, facilitator });
    };
    if (isEdit) getCourseDetails();
  }, [isEdit]);
  return (
    <Page title="Super Admin: Create a new faculty">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={!isEdit ? 'Create a New Faculty' : 'Edit Faculty'}
          links={[{ name: 'Dashboard' }, { name: 'Faculty' }, { name: !isEdit ? 'Create' : 'Edit' }]}
        />
        <FacultyNewForm isEdit={isEdit} facultyData={facultyData} />
      </Container>
    </Page>
  );
}
