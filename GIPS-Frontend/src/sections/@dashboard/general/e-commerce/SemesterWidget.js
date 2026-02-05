import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import merge from 'lodash/merge';
import { useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// @mui
import { alpha, styled } from '@mui/material/styles';
import { Box, Card, Typography, Stack, Link, IconButton } from '@mui/material';
// utils
import axios from '../../../../utils/axios';
import useAuth from '../../../../hooks/useAuth';
import { fNumber, fPercent } from '../../../../utils/formatNumber';
// components
import Iconify from '../../../../components/Iconify';
import { BaseOptionChart } from '../../../../components/chart';
import { PATH_DASHBOARD } from '../../../../routes/paths';

SemesterRegWidget.propTypes = {
  chartColor: PropTypes.string,
  chartData: PropTypes.arrayOf(PropTypes.number),
  percent: PropTypes.number,
  title: PropTypes.string,
  status: PropTypes.string,
  total: PropTypes.number,
};

export default function SemesterRegWidget({ title, status, name, registered, chartData }) {
  const navigate = useNavigate();
  const [student, setStudent] = useState();
  const { record, isAuthenticated } = useSelector((state) => {
    return state.user;
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const [studentRes, appsRes, semestersRes] = await Promise.all([
          axios.get('/v1/students/me'),
          axios.get('/v1/applications/mine', { params: { page: 1, limit: 1 } }),
          axios.get('/v1/semesters'),
        ]);

        const studentDetails = studentRes.data.data;
        const application = appsRes.data.data?.[0];
        const guestDetails = application?.expand?.guest_id;

        const semesters = semestersRes.data || [];
        const openSemester = semesters.find((sm) => sm.active === true);

        const studentData = {
          ...studentDetails,
          ...(guestDetails || {}),
          physical_address: application?.physical_address || studentDetails?.physical_address,
          trnumber: studentDetails?.tr_number,
          email: record?.email,
          id: studentDetails?.id,
          name,
          copy_of_id: application?.copy_of_id,
          openSemester,
        };

        setStudent(studentData);
      } catch (error) {
        console.error('Failed to load semester widget data:', error);
        setStudent(undefined);
      }
    };

    if (record?.id) {
      fetch();
    }
  }, [name, record?.email, record?.id]);

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 3,
        height: '150px',
        cursor: 'pointer',
      }}
      onClick={() => {
        if (status.toLowerCase().trim().includes('open')) {
          navigate(PATH_DASHBOARD.student.semester_registration, {
            state: student,
          });
        }
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" paddingBottom="10px">
          <Typography
            component="div"
            sx={{
              color: '#437ba6',
              fontWeight: 'bold',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {title}
            <Box
              component="span"
              sx={{
                color: '#b0be3b',
                fontSize: '14px',
                display: 'flex',
                paddingLeft: '2px',
              }}
            >
              {status}{' '}
              <Box
                component="span"
                sx={{
                  color: registered === 'Registered' ? '#449955' : '#eac500',
                  fontWeight: 'bold',
                  paddingLeft: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {registered}
              </Box>
            </Box>
          </Typography>
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Iconify icon="eva:arrow-ios-forward-fill" width={20} height={20} />
          </Typography>
        </Stack>

        <Typography variant="h6" sx={{ color: '#2b308c' }}>
          {name}
        </Typography>
      </Box>
    </Card>
  );
}
