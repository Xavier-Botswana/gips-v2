import { Link as RouterLink, useNavigate } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Link, Container, Typography, Button, Stack } from '@mui/material';
// hooks
import { useDispatch } from 'react-redux';
import useResponsive from '../hooks/useResponsive';
import mage from '../images/guest_img_1.png';
// routes
import { PATH_DASHBOARD, PATH_AUTH } from '../routes/paths';
// components
import Page from '../components/Page';
import Image from '../components/Image';
import { logout, login } from '../redux/slices/auth';
// sections


const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

// const {
//   reset,
//   watch,
//   control,
//   setValue,
//   handleSubmit,
//   formState: { isSubmitting },
// } = methods;


const SectionStyle = styled('div')(() => ({
  width: 'auto',
  height: 'auto',
  itemAlign: 'center',
  border: 'none',
  maxWidth: '90%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const smUp = useResponsive('up', 'sm');
  const mdUp = useResponsive('up', 'md');


  const defaultValues = {
    identity: 'guest@gmail.com',
    password: 'YdRqPle6EA86tre',
  };





  const onApplyNow = async () => {
    try {
      dispatch(logout());
      await login(defaultValues.identity, defaultValues.password);
      navigate(PATH_DASHBOARD.general.apply);
    } catch (error) {
      console.error(error);
    }
  };

  const goToLogin = () => navigate(PATH_AUTH.login);


  
  return (
    <Page title="Register">

      <RootStyle>
        <Container>
          <ContentStyle>
            <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" gutterBottom align="center">
                  Welcome to the <br />
                  GIPS Registration Platform
                </Typography>
                <Typography sx={{ color: 'text.secondary' }} align="center">
                  GIPS offers broad and balanced faculties to equip students <br />
                  with up-to-date, high quality and relevant knowledge based <br /> and practical courses.
                </Typography>
              </Box>

            </Box>
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                type="button"
                variant="contained"
                size="large"
                onClick={onApplyNow}
                fullWidth
              >
                Apply Now
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="large"
                onClick={goToLogin}
                fullWidth
                component={RouterLink}
                to={PATH_AUTH.login}
              >
                Track Application
              </Button>
            </Stack>


        

            {!smUp && (
              <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
                Already have an account?{' '}
                <Link variant="subtitle2" to={PATH_AUTH.login} component={RouterLink}>
                  Login
                </Link>
              </Typography>
            )}
          </ContentStyle>
        </Container>



        <div style={{ display: 'flex', marginRight: '80px' }}>
          {mdUp && (
            <SectionStyle>
              <Image alt="register" src={mage} />
            </SectionStyle>
          )}
        </div>
      </RootStyle>
    </Page>
  );
}
