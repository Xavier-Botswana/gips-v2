import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Button, Container, Typography } from '@mui/material';
// layouts
import LogoOnlyLayout from '../../layouts/LogoOnlyLayout';
// routes
import { PATH_AUTH } from '../../routes/paths';
// components
import Page from '../../components/Page';
// sections
import { UpdatePasswordForm } from '../../sections/auth/update-password';
// assets
import sentIcon from '../../backimages/sent.png';
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
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
// Get the URL parameters
const urlParams = new URLSearchParams(window.location.search);

// Get the value of the 'token' parameter
const token = urlParams.get('token');

// Now 'token' variable holds the token value
  return (
    <Page title="Reset Password" sx={{ height: 1 }}>
      <RootStyle>
        <LogoOnlyLayout />

        <Container>
          <Box sx={{ maxWidth: 480, mx: 'auto' }}>
            {!sent ? (
              <>
                <Box sx={{ mb: 2, mx: 'auto', justifyContent: 'center', display: 'flex' }}>
                  <img alt='' src={passwordIcon} />
                </Box>
                <Typography variant="h3" paragraph align="center">
                  Forgot Password?
                </Typography>
                <Typography sx={{ color: 'text.secondary', mb: 5 }} align="center">
                 Please enter a new password and confirm it below to reset your account password.
                </Typography>

                <UpdatePasswordForm onSent={() => setSent(true)} onGetEmail={(value) => setEmail(value)} token={token}/>

                {/* <NextLink href={PATH_AUTH.login} passHref> */}
                <Button fullWidth size="medium" component={RouterLink} to={PATH_AUTH.login} sx={{ mt: 1 }}>
                    Return to sign in
                  </Button>
                {/* </NextLink> */}
              </>
                ) : (
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ mb: 2, mx: 'auto', justifyContent: 'center', display: 'flex' }}>
                  <img alt='' src={sentIcon} />
                </Box>

                <Typography variant="h3" gutterBottom>
                  Request sent successfully
                </Typography>
                <Typography>
                  We have sent a confirmation email to &nbsp;
                  <strong>{email}</strong>
                  <br />
                  Please check your email.
                </Typography>

                {/* <NextLink href={PATH_AUTH.login} passHref> */}
                  <Button fullWidth size="medium" component={RouterLink} to={PATH_AUTH.login} sx={{ mt: 1 }}>
                  
                    Return to sign in
                  </Button>
                {/* </NextLink> */}
              </Box>
            )}
          </Box>
        </Container>
      </RootStyle>
    </Page>
  );
}