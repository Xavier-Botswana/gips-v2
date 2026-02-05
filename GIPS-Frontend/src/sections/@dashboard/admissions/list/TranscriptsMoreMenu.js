import PropTypes from 'prop-types';
import { paramCase } from 'change-case';
import { useEffect, useState } from 'react';
import { Link as RouterLink,useNavigate } from 'react-router-dom';
// @mui
import { MenuItem, IconButton } from '@mui/material';
import axios  from '../../../../utils/axios';

// routes
import { PATH_DASHBOARD } from '../../../../routes/paths';
// components
import Iconify from '../../../../components/Iconify';
import MenuPopover from '../../../../components/MenuPopover';

// ----------------------------------------------------------------------

TranscriptsListMenu.propTypes = {
  onDelete: PropTypes.func,
  userName: PropTypes.string,
  fromRoute: PropTypes.string,
  showDelete: PropTypes.bool,
};

export default function TranscriptsListMenu({ onDelete, userName, fromRoute, id, showDelete = true }) {
  const [route, setRoute] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    switch (fromRoute) {
      case 'transcripts':
        setRoute(`${PATH_DASHBOARD.superAdmin.root}/transcript/${paramCase(id)}/update`);
        break;
      case 'modules':
        setRoute(`${PATH_DASHBOARD.superAdmin.root}/modules/${paramCase(userName)}/update`);
        break;
      case 'faculties':
        setRoute(`${PATH_DASHBOARD.superAdmin.root}/faculty/${paramCase(id)}/update`);
        break;
      default:
        setRoute(`${PATH_DASHBOARD.admissions.root}/${paramCase(userName)}/edit`);
    }
  }, [fromRoute]);

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

  // Binary data of the PDF file as a base64 string
const pdfBase64 = "JVBERi0xLjcKJSzwnZqU..."; // Replace with your actual base64 encoded PDF data

// Function to download the PDF file
function downloadPDF(base64String) {
    // Decode the base64 string to binary data
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    
    // Convert binary string to bytes array
    for (let i = 0; i < len; i+=1) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create a blob from the bytes array and download it as a PDF file
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'document.pdf'; // File name for the downloaded PDF
    link.click();
}



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
        {/* <MenuItem onClick={()=> navigate(`${PATH_DASHBOARD.hod.root}/transcript/${paramCase(id)}/update`)}>
          <Iconify icon={'eva:edit-fill'} sx={{ ...ICON }} />
          View
        </MenuItem> */}

        <MenuItem onClick={ async ()=> axios.get(`v1/transcripts/${id}`, { responseType: 'blob' })
  .then(async (res) => {
    console.log("Response received:", res);
    // You can now work with the blob data, for example, create a URL for it.
    const blob = res.data;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transcript-${id}.pdf`); // Adjust file name and extension as needed
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Clean up the link
  })
  .catch(error => {
    console.error("Error fetching the transcript:", error);
  })}>
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
