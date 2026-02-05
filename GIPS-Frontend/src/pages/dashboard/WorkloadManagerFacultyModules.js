import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Container, Grid } from '@mui/material';

import { PATH_DASHBOARD } from '../../routes/paths';
import LevelsWidget from '../../sections/@dashboard/general/Cards/LevelsCard';
import axios from '../../utils/axios';
import useSettings from '../../hooks/useSettings';

import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import LectureModuleWidget from '../../sections/@dashboard/general/Cards/LectureAssignModuleCard';

const WorkloadManagerFacultyModules = () => {
  const { pathname } = useLocation();
  const courseId = pathname.split('/').pop();
  const { themeStretch } = useSettings();

  const [modules, setModules] = useState([]);

  useEffect(() => {
    const getModules = async () => {
      const response = await axios.get(`v1/modules/course/${courseId}`);
      console.log(response.data);
     // Create a single array of all semester modules using map and flat
      const allModules = Object.values(response.data).flatMap(semesterData =>
        Object.values(semesterData).flat()
      );
      setModules(allModules);
    };
    getModules();
    console.log(modules);
  }, []);

  return (
    <Page title="Modules: List">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="View all Modules Here"
          links={[
            { name: 'Workload Manager', href: PATH_DASHBOARD.hod.workloadManager },
            // { name: `${}` },
            { name: 'List' },
          ]}
        />
        <Grid container spacing={3}>
          {modules?.map((_module) => {
            return (
              <Grid key={_module.id} item xs={12} md={4}>
                <LectureModuleWidget id={_module.id} title={_module.name} name={_module.name} />
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Page>
  );
};

export default WorkloadManagerFacultyModules;
