// @mui
import { useTheme } from '@mui/material/styles';
import { useEffect,useState } from 'react';
import { Container, Grid,Button, Stack } from '@mui/material';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import axios from '../../utils/axios';
// sections
import { ReportsWidgetSummary } from '../../sections/@dashboard/general/e-commerce';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { PATH_DASHBOARD } from '../../routes/paths';
import DtefList from './DtefList';

// ----------------------------------------------------------------------

export default function DtefReports() {
  const [dtefSubmitted, setDtefSubmitted] = useState();
  const [dtefPending, setDtefPending] = useState();
  const [dtef, setSubm] = useState([]);

  const theme = useTheme();
  const { themeStretch } = useSettings();


  useEffect(async () => {

  await axios.get(`/v1/students`).then(async (res) => {
    const data = res.data

    const submitted = data.filter((item)=>{
      return item.dtefStatus === true ;
    })

    const pending = data.filter((item)=>{
      return item.dtefStatus === false ;
    })
 
       setDtefSubmitted(submitted)  
       setDtefPending(pending)

});  

}, []);




  return (
    <Page title="Courses">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading="View All DTEF Reports Here"
          links={[{ name: 'Dashboard', href: PATH_DASHBOARD.root }, { name: 'DTEF Reports' }]}
         action={
            <Button
              variant="contained"
            //  onClick={}
            >
              Submit List
            </Button>
          }
        
        />
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <ReportsWidgetSummary
              title="Total DTEF Registered Students"
              percent={-0.1}
              total={dtefSubmitted?.length || 0}
              chartColor={theme.palette.chart.green[0]}
              chartData={[56, 47, 40, 62, 73, 30, 23, 54, 67, 68]}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <ReportsWidgetSummary
              title="Pending Registration"
              percent={-0.1}
              total={dtefPending?.length || 0}
              chartColor={theme.palette.chart.green[0]}
              chartData={[56, 47, 40, 62, 73, 30, 23, 54, 67, 68]}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <ReportsWidgetSummary
              title="DTEF Discontinued"
              percent={-0.1}
              total={0}
              chartColor={theme.palette.chart.green[0]}
              chartData={[56, 47, 40, 62, 73, 30, 23, 54, 67, 68]}
            />
          </Grid>

          <Grid item xs={12} md={12}>
            <DtefList />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
