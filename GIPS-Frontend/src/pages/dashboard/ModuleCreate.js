import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
// @mui
import { Container } from '@mui/material';
// routes
// hooks
import useSettings from '../../hooks/useSettings';
import axios from '../../utils/axios';
// _mock_
import { _userList } from '../../_mock';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import ModuleNewForm from '../../sections/@dashboard/super-admin/ModuleNewForm';

// ----------------------------------------------------------------------

export default function ModuleCreate() {
  const { themeStretch } = useSettings();
  const { pathname } = useLocation();
  const { name = '' } = useParams();
  const [moduleData, setModuleData] = useState();
  const isEdit = pathname.includes('update');
  const titleText = isEdit ? 'Edit Module' : 'Create A Program Module Here';

  const moduleId = pathname.split('/').slice(-2, -1)[0];

  useEffect(() => {
    const getModuleDetails = async () => {
      const response = await axios.get(`/v1/modules/${moduleId}`);
      setModuleData(response.data);

      console.log(moduleData);
    };
    if (isEdit) getModuleDetails();
  }, [isEdit]);

  return (
    <Page title={`${titleText}`}>
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={!isEdit ? 'Create A Program Module Here' : 'Edit Module'}
          links={[{ name: 'Dashboard' }, { name: 'Modules' }, { name: !isEdit ? 'Create' : 'Edit' }]}
        />

        <ModuleNewForm isEdit={isEdit} moduleData={moduleData} />
      </Container>
    </Page>
  );
}
