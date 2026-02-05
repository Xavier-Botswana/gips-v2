import { useEffect, useState, useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { Box, Button, Container, Typography } from '@mui/material';
// routes
import { PATH_AUTH } from '../../routes/paths';
// components
import Page from '../../components/Page';
import LogoOnlyLayout from '../../layouts/LogoOnlyLayout';
import { IDNumberForm } from '../../sections/auth/idNumber';
import passwordIcon from '../../backimages/password.png';
import axios from '../../utils/axios';
import { logout } from '../../redux/slices/auth';


// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  minHeight: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function IDNumber() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const idRef = useRef('');
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!sent) return;

    const fetchAndRedirect = async () => {
      try {
        const guestsRes = await axios.get('/v1/guests');
        const userDetails = guestsRes.data.data.find((item) => item.national_id === idRef.current);

        if (!userDetails) {
          enqueueSnackbar('ID Number not found. Please check and try again.', { variant: 'error' });
          setSent(false);
          return;
        }

        const appsRes = await axios.get('/v1/applications');
        const application = appsRes.data.data.find((item) => item.expand.guest_id.id === userDetails?.id);

        const applicantDetails = {
          id: userDetails.expand?.user_id?.id,
          email: userDetails.expand?.user_id?.email,
          applicationStatus: application?.status,
        };

        dispatch(logout());

        navigate(PATH_AUTH.registerUnprotected, {
          state: { data: applicantDetails },
        });
      } catch (error) {
        enqueueSnackbar('Failed to fetch ID information', { variant: 'error' });
        setSent(false);
      }
    };

    fetchAndRedirect();
  }, [dispatch, enqueueSnackbar, navigate, sent]);


  return (
    <Page title="ID Number" sx={{ height: 1 }}>
      <RootStyle>
        <LogoOnlyLayout />

        <Container>
          <Box sx={{ maxWidth: 480, mx: 'auto' }}>
            <>
              <Box
                sx={{
                  mb: 2,
                  mx: 'auto',
                  justifyContent: 'center',
                  display: 'flex',
                }}
              >
                <img alt="" src={passwordIcon} />
              </Box>
              <Typography variant="h3" paragraph align="center">
                ID Number
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 5 }} align="center">
                Please provide your ID number to get your 1st time credentials. Note that these credentials can be
                updated later <br /> on the 'Profile' menu.
              </Typography>
              <IDNumberForm onSent={() => setSent(true)} onGetID={(value) => (idRef.current = value)} />

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
