import PropTypes from 'prop-types';
// @mui
import { styled } from '@mui/material/styles';
import { Card, Button, Typography, Box, Stack } from '@mui/material';
// components
import Label from '../../components/Label';
import Iconify from '../../components/Iconify';

const RootStyle = styled(Card)(({ theme }) => ({
    maxWidth: 480,
    margin: 'auto',
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
    flexDirection: 'column',
    padding: theme.spacing(3),
    [theme.breakpoints.up(414)]: {
        padding: theme.spacing(5),
    },
}));

