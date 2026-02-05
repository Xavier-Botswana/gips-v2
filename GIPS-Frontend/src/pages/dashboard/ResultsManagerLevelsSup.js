// @mui
import { useTheme } from '@mui/material/styles';
import { Container, Grid, Stack, Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from '../../redux/store';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
// sections

import LevelsWidgetSup from '../../sections/@dashboard/general/Cards/LevelsCardSup';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { PATH_DASHBOARD } from '../../routes/paths';
import ModulesNotFound from '../../components/ModulesNotFound';
// ----------------------------------------------------------------------

export default function ResultsManagerLevels() {
  const { record, isAuthenticated } = useSelector((state) => {
    return state.user;
  });
  const [modules, setModules] = useState();
  const [year, setYear] = useState('All');

  const theme = useTheme();
  const { themeStretch } = useSettings();

  return (
    <Page title="Select Module">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading=" Select Year/Level"
          links={[{ name: 'Results Manager', href: '#' }, { name: 'Selection Levels' }]}
        />

        <Grid container spacing={3}>
          {[
            { year: '1', name: 'Year One' },
            { year: '2', name: 'Year Two' },
            { year: '3', name: 'Year Three' },
            { year: '4', name: 'Year Four' },
          ]?.map(({ name, year }) => (
            <Grid key={name} item xs={12} md={4}>
              {/* here make sure to send the id of the course here  */}
              <LevelsWidgetSup title="Semester 1 |" name={name} year={year} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Page>
  );
}
