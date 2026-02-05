import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Card,
  Table,
  Avatar,
  Button,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
  Box,
  InputBase,
} from '@mui/material';
import { TabContext, TabList, TabPanel, LoadingButton } from '@mui/lab';
import axios from '../../utils/axios';

// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// _mock_
import { _userList } from '../../_mock';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Iconify from '../../components/Iconify';
import Scrollbar from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import { UserListHead, UserListToolbar, UserMoreMenu } from '../../sections/@dashboard/user/list';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'email', label: 'Email Address', alignRight: false },
  { id: 'role', label: 'Role', alignRight: false },
  { id: 'department', label: 'Department', alignRight: false },
  { id: 'action', label: '', alignRight: false },
];

// ----------------------------------------------------------------------

export default function UserList() {
  const theme = useTheme();
  const { themeStretch } = useSettings();
  const { enqueueSnackbar } = useSnackbar();

  const [userList, setUserList] = useState([]);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [idToDelete, setIdToDelete] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteModalOpen_, setIsDeleteModalOpen_] = useState(false);

  useEffect(() => {
    const getUsers = async () => {
      const response = await axios.get('/v1/users');
      setUserList(response.data.users);
    };

    getUsers();
  }, []);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

 const handleSelectAllClick = (event) => {
  if (event.target.checked) {
    const newSelecteds = userList.map((n) => n.id);
    setSelected(newSelecteds);
    return;
  }
  setSelected([]);
};

 const handleClick = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (filterName) => {
    setFilterName(filterName);
    setPage(0);
  };

  const handleDeleteUser = async (userId) => {
    await axios
      .delete(`/v1/users/${userId}`)
      .then(() => {
        enqueueSnackbar('User has been deleted', { variant: 'success' });
        setSelected([]);
        setUserList(userList.filter((user) => user.id !== userId));
        setIsDeleteModalOpen(false);
      })
      .catch((error) => {
        enqueueSnackbar('Unable to delete user, try again later', { variant: 'error' });
        console.error(error);
      });
  };


  const handleDeleteMultiUser = () => {
  // Keep users NOT in the selected array (those we don't want to delete)
  const remainingUsers = userList.filter((user) => !selected.includes(user.id));
  
  // Track successful deletions
  let successCount = 0;
  const totalToDelete = selected.length;
  
  // Delete each selected user from the backend
  Promise.all(selected.map(async (row) => {
    try {
      await axios.delete(`/v1/users/${row}`);
     successCount += 1;
    } catch (error) {
      enqueueSnackbar('Unable to delete user, try again later', { variant: 'error' });
      console.error(error);
    }
  })).then(() => {
    // Show success alert after all deletion attempts complete
    if (successCount > 0) {
      enqueueSnackbar(`Successfully deleted ${successCount} user${successCount > 1 ? 's' : ''}`, { variant: 'success' });
    }
  });
  
  // Update state after deletion
  setUserList(remainingUsers);
  setSelected([]);
  setIsDeleteModalOpen_(false);
};

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - userList.length) : 0;

  const filteredUsers = applySortFilter(userList, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && Boolean(filterName);

  return (
    <Page title="User: List">
      <Dialog fullWidth maxWidth="sm" open={isDeleteModalOpen}>
        <DialogTitle>Delete User?</DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              This action cannot be undone. Are you sure you want to delete the selected user?
            </Typography>
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions>
          <>
            <Button
              color="inherit"
              variant="outlined"
              onClick={() => {
                setIsDeleteModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <LoadingButton
              color="error"
              variant="contained"
              onClick={async () => {
                handleDeleteUser(idToDelete);
              }}
            >
              Delete
            </LoadingButton>
          </>
        </DialogActions>
      </Dialog>

 <Dialog fullWidth maxWidth="sm" open={isDeleteModalOpen_}>
        <DialogTitle>Delete Users?</DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              This action cannot be undone. Are you sure you want to delete the selected users?
            </Typography>
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions>
          <>
            <Button
              color="inherit"
              variant="outlined"
              onClick={() => {
                setIsDeleteModalOpen_(false);
              }}
            >
              Cancel
            </Button>
           
            <LoadingButton
              color="error"
              variant="contained"
              onClick={async () => {
                handleDeleteMultiUser();
              }}
            >
              Delete
            </LoadingButton>
          </>
        </DialogActions>
      </Dialog>
                
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="View All System Users"
          links={[
            { name: 'Users', href: PATH_DASHBOARD.superAdmin.userList },
            { name: 'Manage User', href: PATH_DASHBOARD.superAdmin.userList },
            { name: 'List' },
          ]}
         
           action={
            <div>
              <Button
                style={{ marginRight: 10 }}
                variant="contained"
                component={RouterLink}
                to={PATH_DASHBOARD.user.newUser}
                startIcon={<Iconify icon={'eva:plus-fill'} />}
              >
                New User
              </Button>
             {selected.length !== 0 && <Button
                style={{backgroundColor:"#e34563"}}
                variant="contained"
                onClick={() => setIsDeleteModalOpen_(true)}
                startIcon={<Iconify icon={'eva:trash-fill'} />}
              >
                Delete
              </Button>}
            </div>
          }
          
        />

        <Card>
          <Box sx={{ p: 3, pb: 0 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '10px',
                marginBottom: '20px',
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '8px',
                  border: '1px solid #dce0e4',
                  width: '100%',
                }}
              >
                <Iconify
                  icon={'eva:search-fill'}
                  sx={{ color: 'text.disabled', width: 20, height: 20, marginLeft: '10px' }}
                />

                <InputBase
                  key={2}
                  placeholder="Search..."
                  style={{
                    color: '#919eab',
                    fontStyle: 'semibold',
                    fontSize: '14px',
                    padding: '10px 5px',
                    width: '100%',
                    height: '54px',
                  }}
                  onChange={(e) => handleFilterByName(e.target.value)}
                />
              </Box>
            </div>
          </Box>

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={userList.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, name, role, email, avatarUrl, department } = row;
                    const isItemSelected = selected.indexOf(id) !== -1;

                    return (
                      <TableRow
                        hover
                        key={id}
                        tabIndex={-1}
                        role="checkbox"
                        selected={isItemSelected}
                        aria-checked={isItemSelected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox checked={isItemSelected} onClick={() => handleClick(id)} />
                        </TableCell>
                        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar alt={name} src={avatarUrl} sx={{ mr: 2 }} />
                          <Typography variant="subtitle2" noWrap>
                            {name}
                          </Typography>
                        </TableCell>
                        <TableCell align="left">{email}</TableCell>
                        <TableCell align="left">{role}</TableCell>
                        <TableCell align="left">{department || 'No Department'}</TableCell>
                        <TableCell align="right">
                          <UserMoreMenu
                            onDelete={() => {
                              setIdToDelete(id);
                              setIsDeleteModalOpen(true);
                            }}
                            userId={id}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={userList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, page) => setPage(page)}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </Page>
  );
}

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}
function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  if (query) {
    const lowercasedQuery = query.toLowerCase();
    return array.filter(
      (_user) =>
        (_user.name && _user.name.toLowerCase().includes(lowercasedQuery)) ||
        (_user.email && _user.email.toLowerCase().includes(lowercasedQuery)) ||
        (_user.role && _user.role.toLowerCase().includes(lowercasedQuery)) ||
        (_user.department && _user.department.toLowerCase().includes(lowercasedQuery))
    );
  }

  return stabilizedThis.map((el) => el[0]);
}
