import { useLocation, Link as RouterLink } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Button, Container, Typography } from '@mui/material';
// layouts
import Register from '../../sections/auth/register/RegistrationFormOriginal';
import LogoOnlyLayout from '../../layouts/LogoOnlyLayout';
// routes
import { PATH_AUTH } from '../../routes/paths';
// components
import Page from '../../components/Page';
// assets
import passwordIcon from '../../backimages/password.png';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  minHeight: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function ConfirmResetPassword() {
  const location = useLocation();
  const data = location.state ? location.state.data : null;


  return (
    <Page title="Account Creation" sx={{ height: 1 }}>
      <RootStyle>
        <LogoOnlyLayout />

        <Container>
          <Box sx={{ maxWidth: 480, mx: 'auto' }}>
           
              <>
                <Box sx={{ mb: 2, mx: 'auto', justifyContent: 'center', display: 'flex' }}>
                  <img alt='' src={passwordIcon} />
                </Box>
                <Typography variant="h3" paragraph align="center">
                Create Account
                </Typography>
                <Typography sx={{ color: 'text.secondary', mb: 5 }} align="center">
                  Please enter the email address associated with your account and We will email you a link to reset your
                  password.
                </Typography>

                <Register  applicantData={data} />

                {/* <NextLink href={PATH_AUTH.login} passHref> */}
                <Button fullWidth size="medium" component={RouterLink} to={PATH_AUTH.login} sx={{ mt: 1 }}>
                    Return to sign in
                  </Button>
                {/* </NextLink> */}
              </>
           
          </Box>
        </Container>
      </RootStyle>
    </Page>
  );
}