import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useTheme } from '@mui/material/styles';
import {
  Card,
  Table,
  Avatar,
  InputBase,
  Tab,
  Box,
  Divider,
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
  Button,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { TabContext, TabList, TabPanel, LoadingButton } from '@mui/lab';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import axios from '../../utils/axios';
import useSettings from '../../hooks/useSettings';
// _mock_
// import { _userList } from '../../_mock';
// components
import Page from '../../components/Page';
import Scrollbar from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import { UserListHead, UserListToolbar, StudentMoreMenu } from '../../sections/@dashboard/admissions/list';
import Iconify from '../../components/Iconify';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'faculty_name', label: 'Faculty Name', alignRight: false },
  { id: 'facilitator', label: 'Facilitator', alignRight: false },
  { id: 'action', label: '', alignRight: false },
];

// ----------------------------------------------------------------------

export default function FacultyList() {
  const theme = useTheme();
  const { themeStretch } = useSettings();
  const { enqueueSnackbar } = useSnackbar();

  const [facultyList, setFacultyList] = useState([]);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [filter, setFilter] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [value, setValue] = useState('0');
  const [_searchQuery, setQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [idToDelete, setIdToDelete] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteModalOpen_, setIsDeleteModalOpen_] = useState(false);

  // Handler to update the state when the input changes
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    const getFaculties = async () => {
      const response = await axios.get('/v1/faculties');
console.log({response})
      setFacultyList(response.data);
    };

    getFaculties();
  }, []);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (filterName) => {
    setFilterName(filterName);
    setPage(0);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - facultyList.length) : 0;

  const filteredFaculties = applySortFilter(facultyList, getComparator(order, orderBy), filterName || _searchQuery);

  const isNotFound = !filteredFaculties.length && Boolean(filterName || _searchQuery);

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

  function applySortFilter(array, comparator, query, filter) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });

    let filteredArray = stabilizedThis.map((el) => el[0]);

    if (filter) {
      filteredArray = filteredArray.filter((faculty) => faculty.name === filter);
    }

    if (query) {
      filteredArray = filteredArray.filter((faculty) => {
        const facilitatorName = faculty.expand?.facilitator?.name ?? '';
        return (
          faculty.name.toLowerCase().includes(query.toLowerCase()) ||
          facilitatorName.toLowerCase().includes(query.toLowerCase())
        );
      });
    }

    return filteredArray;
  }

  const handleFacultyDelete = (facultyId) => {
    try {
      axios
        .delete(`/v1/faculties/${facultyId}`)
        .then(() => {
          setSelected([]);
          setFacultyList(facultyList.filter((user) => user.id !== facultyId));

          setIsDeleteModalOpen(false);
          enqueueSnackbar('Faculty Deleted', { variant: 'success' });
        })
        .catch((error) => {
          const errorMessage = error?.error.response.message;
          const status = error?.error.response.code;

          // Check if the error message and status match the expected values
          if (
            status === 400 &&
            errorMessage.includes(
              'Failed to delete record. Make sure that the record is not part of a required relation reference.'
            )
          ) {
            setIsDeleteModalOpen(false);
            enqueueSnackbar('This faculty cannot be deleted because there are courses that rely on it.', {
              variant: 'error',
            });
          } else {
            setIsDeleteModalOpen(false);
            enqueueSnackbar('Error Deleting Faculty', { variant: 'error' });
          }
        });
    } catch (error) {
      setIsDeleteModalOpen(false);
      enqueueSnackbar('Error Deleting Faculty', { variant: 'error' });
    }
  };

  
  const handleDeleteMultiFaculty = () => {
  // Keep users NOT in the selected array (those we don't want to delete)
  const remainingFaculties = facultyList.filter((record) => !selected.includes(record.id));
  
  // Track successful deletions
  let successCount = 0;
  const totalToDelete = selected.length;


Promise.all(selected.map(async (row) => {
  try {
    await axios.delete(`/v1/faculties/${row}`);
    successCount += 1; // Only increment if delete succeeds
  } catch (error) {
   
     enqueueSnackbar(
        'This faculty cannot be deleted because there are courses that rely on it.',
        { variant: 'error' }
      );
      setIsDeleteModalOpen_(false);
     
    } 

 
})).then(() => {
  if (successCount > 0) {
    enqueueSnackbar(
      `Successfully deleted ${successCount} ${successCount > 1 ? 'faculties' : 'faculty'}`,
      { variant: 'success' }
      
    );
    // Update state after deletion
  setFacultyList(remainingFaculties);
  setSelected([]);
  setIsDeleteModalOpen_(false);
  }
});

  
  
};

   const handleSelect = (id) => {
    const selectedIdx = selected.indexOf(id);
    let newSelected = [];
    if (selectedIdx === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIdx === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIdx === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIdx > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIdx), selected.slice(selectedIdx + 1));
    }
    setSelected(newSelected);
  };


  const handleSelectAllClick = (event) => {
  if (event.target.checked) {
    const newSelecteds = facultyList.map((n) => n.id);
    setSelected(newSelecteds);
    return;
  }
  setSelected([]);
};


  

  return (
    <Page title="Faculties: List">
      <Dialog fullWidth maxWidth="sm" open={isDeleteModalOpen}>
        <DialogTitle>Delete Faculty?</DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              This action cannot be undone. Are you sure you want to delete the selected faculty?
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
                handleFacultyDelete(idToDelete);
              }}
            >
              Delete
            </LoadingButton>
          </>
        </DialogActions>
      </Dialog>


 <Dialog fullWidth maxWidth="sm" open={isDeleteModalOpen_}>
        <DialogTitle>Delete Faculties?</DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              This action cannot be undone. Are you sure you want to delete the selected faculties?
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
                handleDeleteMultiFaculty();
              }}
            >
              Delete
            </LoadingButton>
          </>
        </DialogActions>
      </Dialog>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="View all Faculties Here"
          links={[
            { name: 'Faculties', href: PATH_DASHBOARD.superAdmin.facultyList },
            { name: 'List' },
          ]}
  action={
                      <div>
                        <Button
                          style={{ marginRight: 10 }}
                          variant="contained"
                          component={RouterLink}
                          to={PATH_DASHBOARD.superAdmin.facultyCreate}
                          startIcon={<Iconify icon={'eva:plus-fill'} />}
                        >
                          New Faculty
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
          <TabContext value={value}>
            <Box sx={{ px: 3, bgcolor: 'background.neutral' }}>
              <TabList onChange={(e, value) => setValue(value)}>
                <Tab disableRipple value="0" label="All" />
              </TabList>
            </Box>
            <Divider />
            <TabPanel value="0" key="0">
              <Box sx={{ p: 3 }}>
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

                <Scrollbar>
                  <TableContainer sx={{ minWidth: 800 }}>
                    <Table>
                      <UserListHead
                        order={order}
                        orderBy={orderBy}
                        headLabel={TABLE_HEAD}
                        rowCount={facultyList.length}
                        numSelected={selected.length}
                        // onRequestSort={handleRequestSort}
                        onSelectAllClick={handleSelectAllClick}
                      />

                      <TableBody>
                        {filteredFaculties.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                          const { id } = row;
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
                                <Checkbox checked={isItemSelected} onClick={() => handleSelect(id)} />
                              </TableCell>

                              <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar alt={row.firstname} src={id} sx={{ mr: 2 }} />
                                <Typography variant="subtitle2" noWrap>
                                  {row.name}
                                </Typography>
                              </TableCell>
                              <TableCell align="left">{row.expand?.facilitator?.name || 'No Facilitator'}</TableCell>

                              <TableCell align="right">
                                <StudentMoreMenu
                                  onDelete={() => {
                                    setIsDeleteModalOpen(true);
                                    setIdToDelete(id);
                                  }}
                                  id={id}
                                  userName={id}
                                  fromRoute="faculties"
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
                              <SearchNotFound searchQuery={filterName || _searchQuery} />
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
                  count={facultyList.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, page) => setPage(page)}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </TabPanel>
          </TabContext>
        </Card>
      </Container>
    </Page>
  );
}
