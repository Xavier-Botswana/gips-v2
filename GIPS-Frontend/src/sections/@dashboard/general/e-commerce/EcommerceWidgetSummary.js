import PropTypes from 'prop-types';
import merge from 'lodash/merge';
import { Link as RouterLink, useNavigate} from 'react-router-dom';
// @mui
import { alpha, styled } from '@mui/material/styles';
import { Box, Card, Typography, Stack,Link, IconButton } from '@mui/material';
// utils
import { fNumber, fPercent } from '../../../../utils/formatNumber';
// components
import Iconify from '../../../../components/Iconify';
import { BaseOptionChart } from '../../../../components/chart';
import { PATH_DASHBOARD } from '../../../../routes/paths';
// ----------------------------------------------------------------------

const IconWrapperStyle = styled('div')(({ theme }) => ({
  width: 24,
  height: 24,
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(1),
  color: theme.palette.success.main,
  backgroundColor: alpha(theme.palette.success.main, 0.16),
}));

// ----------------------------------------------------------------------

EcommerceWidgetSummary.propTypes = {
  chartColor: PropTypes.string,
  chartData: PropTypes.arrayOf(PropTypes.number),
  percent: PropTypes.number,
  title: PropTypes.string,
  total: PropTypes.number,
};

export default function EcommerceWidgetSummary({ title,course, name}) {
  const navigate = useNavigate();


  return (
  //  here also send the id of that course and make it to be the first option in the form
    <Card sx={{ display: 'flex', alignItems: 'center', p: 3, height: '150px' ,cursor:"pointer"}} onClick={()=>{
      const serializedObject = JSON.stringify(course);
      const encodedObject = encodeURIComponent(serializedObject);
      navigate(`${PATH_DASHBOARD.general.application}?course=${encodedObject}`);
    }
    }>
      <Box sx={{ flexGrow: 1 }}>
       
       
       
        <Stack direction="row" alignItems="center" justifyContent="space-between" paddingBottom="10px">
          <Typography
            sx={{ color: '#437ba6', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center' }}
          >
            {title}
            <Typography sx={{ color: '#b0be3b', fontSize: '14px', display: 'flex', paddingLeft: '2px' }}>
              Open
            </Typography>
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
            36 pts required <Iconify icon="eva:arrow-ios-forward-fill" width={20} height={20} />
          </Typography>
        </Stack>

        <Typography variant="h6" sx={{ color: '#2b308c' }} >
          {name}
        </Typography>
      </Box>
    </Card>
   
  );
}
