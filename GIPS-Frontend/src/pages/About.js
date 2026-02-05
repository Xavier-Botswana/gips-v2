// @mui
import { styled } from '@mui/material/styles';
// components
import Page from '../components/Page';
import { AboutWhat } from '../sections/about';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  paddingTop: theme.spacing(8),
  [theme.breakpoints.up('md')]: {
    paddingTop: theme.spacing(11),
  },
}));

// ----------------------------------------------------------------------

export default function About() {
  return (
    <Page title="About us">
      <RootStyle>
       

        <AboutWhat />

      
      
      
      </RootStyle>
    </Page>
  );
}
