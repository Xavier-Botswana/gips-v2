// @mui
import PropTypes from 'prop-types';
import { Box, Typography, Stack } from '@mui/material';
// assets

// ----------------------------------------------------------------------

BlockContent.propTypes = {
  onFileChange: PropTypes.func.isRequired,
};

export default function BlockContent({ onFileChange }) {
  return (
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      direction={{ xs: 'column', md: 'row' }}
      sx={{ width: 1, textAlign: { xs: 'center', md: 'left' } }}
    >
      <Box sx={{ p: 3 }}>
        <Typography gutterBottom variant="h5">
          Drop or Select file
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Drop files here or click&nbsp;
          <Typography
            variant="body2"
            component="span"
            sx={{ color: 'primary.main', textDecoration: 'underline' }}
          >
            browse
          </Typography>
          &nbsp;through your machine
        </Typography>

        <input
          type="file"
          accept=".csv, .xlsx"
          onChange={onFileChange}
        />
      </Box>
    </Stack>
  );
}
