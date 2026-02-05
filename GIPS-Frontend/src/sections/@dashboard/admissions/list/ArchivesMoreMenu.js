import PropTypes from 'prop-types';
import { paramCase } from 'change-case';
import { useEffect, useState } from 'react';
import { Link as RouterLink,useNavigate } from 'react-router-dom';
// @mui
import { MenuItem, IconButton } from '@mui/material';
import axios from '../../../../utils/axios';

import Iconify from '../../../../components/Iconify';
import MenuPopover from '../../../../components/MenuPopover';

// ----------------------------------------------------------------------


export default function ArchivesListMenu({ id }) {
  const [route, setRoute] = useState('');
  const navigate = useNavigate();



  const [open, setOpen] = useState(null);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const ICON = {
    mr: 2,
    width: 20,
    height: 20,
  };

 
// Function to download the archived file(s)
const handleDownload = async (recordId) => {
  try {
    const res = await axios.get(`/v1/archives/download/${recordId}`);
    const urls = res.data.data?.fileUrls || (res.data.data?.fileUrl ? [res.data.data.fileUrl] : []);

    for (let i = 0; i < urls.length; i += 1) {
      setTimeout(() => {
        try {
          window.open(urls[i], '_blank', 'noopener,noreferrer');
        } catch (error) {
          console.error(`Failed to open ${urls[i]}:`, error);
        }
      }, i * 1000);
    }
  } catch (error) {
    console.error('Error in handleDownload:', error);
  }
};




  return (
    <>
      <IconButton onClick={handleOpen}>
        <Iconify icon={'eva:more-vertical-fill'} width={20} height={20} />
      </IconButton>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        arrow="right-top"
        sx={{
          mt: -1,
          width: 160,
          '& .MuiMenuItem-root': { px: 1, typography: 'body2', borderRadius: 0.75 },
        }}
      >
       

         <MenuItem onClick={async () => handleDownload(id)}>

          <Iconify icon={'eva:cloudDownload-fill'} sx={{ ...ICON }} />
          Download
        </MenuItem>
        {/* {showDelete && (
          <MenuItem onClick={onDelete} sx={{ color: 'error.main' }}>
            <Iconify icon={'eva:trash-2-outline'} sx={{ ...ICON }} />
            Delete
          </MenuItem>
        )} */}
      </MenuPopover>
    </>
  );
}
