import PropTypes from 'prop-types';
// @mui
import { useTheme, styled } from '@mui/material/styles';
import { Toolbar, Tooltip, IconButton, Typography, InputAdornment } from '@mui/material';
// components
import Iconify from '../../../../components/Iconify';
import InputStyle from '../../../../components/InputStyle';
import {
  RHFSelect,
} from '../../../../components/hook-form';
// ----------------------------------------------------------------------

const RootStyle = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: 'flex',
  gap: 15,
  justifyContent: '',
  padding: theme.spacing(0, 1, 0, 3),
}));

// ----------------------------------------------------------------------

UserListToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  onDeleteUsers: PropTypes.func,
};

export default function UserListToolbar({ numSelected, filterName, onFilterName, onDeleteUsers }) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const CATEGORY_OPTION = [
    { group: 'Clothing', classify: ['Shirts', 'T-shirts', 'Jeans', 'Leather'] },
    { group: 'Tailored', classify: ['Suits', 'Blazers', 'Trousers', 'Waistcoats'] },
    { group: 'Accessories', classify: ['Shoes', 'Backpacks and bags', 'Bracelets', 'Face masks'] },
  ];
  return (
    <RootStyle
      sx={{
        ...(numSelected > 0 && {
          color: isLight ? 'primary.main' : 'text.primary',
          bgcolor: isLight ? 'primary.lighter' : 'primary.dark',
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        <>
         {/* <InputStyle name="category" label="Category">
          <select>
                  {CATEGORY_OPTION.map((category) => (
                    <optgroup key={category.group} label={category.group}>
                      {category.classify.map((classify) => (
                        <option key={classify} value={classify}>
                          {classify}
                        </option>
                      ))}

                    </optgroup>
                  ))}
                </select>  
             </InputStyle> */}


          <InputStyle
            stretchStart={280}
            value={filterName}
            onChange={(event) => onFilterName(event.target.value)}
            placeholder="Search by name"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon={'eva:search-fill'} sx={{ color: 'text.disabled', width: 20, height: 20 }} />
                </InputAdornment>
              ),
            }}
          />

{/* <InputStyle
            stretchStart={240}
            value={filterName}
            onChange={(event) => onFilterName(event.target.value)}
            placeholder="Search ..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon={'eva:search-fill'} sx={{ color: 'text.disabled', width: 20, height: 20 }} />
                </InputAdornment>
              ),
            }}
          /> */}
        </>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton onClick={onDeleteUsers}>
            <Iconify icon={'eva:trash-2-outline'} />
          </IconButton>
        </Tooltip>
      ) :""}
    </RootStyle>
  );
}
