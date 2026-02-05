import { useState, useEffect } from 'react';
// @mui
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { useTheme } from '@mui/material/styles';
import {
  Card,
  Table,
  Avatar,
  Tab,
  Box,
  Button,
  InputBase,
  Stack,
  Divider,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  DialogTitle,
  TableContainer,
  TablePagination,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { TabContext, LoadingButton, TabList, TabPanel } from '@mui/lab';
// routes

import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'notistack';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { FormProvider, RHFTextField, RHFSwitch } from '../../components/hook-form';
import Iconify from '../../components/Iconify';
import Label from '../../components/Label';
import { addResults } from '../../redux/slices/studentResults';
import { PATH_DASHBOARD } from '../../routes/paths';
import { DialogAnimate } from '../../components/animate';

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
import { UserListHead, UserListToolbar, StudentListMenu } from '../../sections/@dashboard/admissions/list';
import { tabColor } from '../../utils/setProgressionStatusTabColor';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'Student No', alignRight: false },
  { id: 'name', label: 'Student Name', alignRight: false },
    { id: 'courseWork', label: 'Course Name', alignRight: false },
  { id: 'duration', label: 'Year', alignRight: false },
  { id: 'supplement', label: 'Phone Number', alignRight: false },
  { id: 'progression', label: 'Progression Status', alignRight: false },
];

// ----------------------------------------------------------------------

export default function ManageResultsList() {
  const theme = useTheme();
  const { record, token, isAuthenticated, isInitialized } = useSelector((state) => {
    return state.user;
  });
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const navigate = useNavigate();
  const params = useParams();
  const { id: batchId } = params;

  const { state } = useLocation();

  const { enqueueSnackbar } = useSnackbar();
  const [resultsList, setResultsList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [filterOptions, setFilterOptions] = useState([]);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [filter, setFilter] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [value, setValue] = useState('0');
  const [_searchQuery, setQuery] = useState('');
  const [open, setOpenModal] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isWithholdModalOpen_, setIsWithholdModalOpen_] = useState(false);

  const handleAddEvent = () => {
    setOpenModal(true);
    // console.log(open);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const EventSchema = Yup.object().shape({
    title: Yup.string().max(255).required('Title is required'),
    description: Yup.string().max(5000),
  });

  const methods = useForm({
    resolver: yupResolver(EventSchema),
    // defaultValues: getInitialValues(event,),
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

 

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`/v1/students`, {
          params: {
            page: 1,
            limit: 500,
            withholdResults: true,
          },
        });

        setResultsList(res.data.data || []);
      } catch (error) {
        console.error('Error fetching student details:', error);
      }
    };

    fetchStudents();
  }, [state]);



  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (filterName) => {
    setFilterName(filterName);
    setPage(0);
  };

  const handleWithholdMulti = () => {
    // Keep users NOT in the selected array (those we don't want to delete)
    const remainingResults = resultsList.filter((row) => !selected.includes(row.id));

    // Track successful deletions
    let successCount = 0;
    const totalToDelete = selected.length;

    // Delete each selected user from the backend
    Promise.all(
      selected.map(async (row) => {
        try {
          console.log({ row });
          await axios.patch(`/v1/students/${row}`, { withhold_results: false });
          successCount += 1;
        } catch (error) {
          enqueueSnackbar('Unable to withhold results, try again later', { variant: 'error' });
          console.error(error);
        }
      })
    ).then(() => {
      // Show success alert after all deletion attempts complete
      if (successCount > 0) {
        enqueueSnackbar(`Successfully published ${successCount} result${successCount > 1 ? 's' : ''}`, {
          variant: 'success',
        });
      }
    });

    // Update state after deletion
    setResultsList(remainingResults);
    setSelected([]);
    setIsWithholdModalOpen_(false);
  };


  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - resultsList.length) : 0;

  const filteredResults = applySortFilter(resultsList, getComparator(order, orderBy), filterName || _searchQuery);

  const isNotFound = !filteredResults.length && Boolean(filterName || _searchQuery);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredResults.map((n) => n.student.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleSelect = (student) => {
    const id = student.id;
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

  return (
    <Page title="Students Results: List">
      <Dialog fullWidth maxWidth="sm" open={isWithholdModalOpen_}>
        <DialogTitle>Publish Results?</DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              This action cannot be undone. Are you sure you want to publish the selected student results?
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
                setIsWithholdModalOpen_(false);
              }}
            >
              Cancel
            </Button>
            <LoadingButton
              color="error"
              variant="contained"
              onClick={async () => {
                handleWithholdMulti();
              }}
            >
              Pubish
            </LoadingButton>
          </>
        </DialogActions>
      </Dialog>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="View Students Results Here"
          links={[{ name: 'Results Manager' }, { name: 'Module Name' }, { name: 'List' }]}
          action={
            <div>
              {selected.length !== 0 && (
                <Button
                  // sx={{ background: 'green', color: 'white' }}
                  variant="contained"
                  onClick={() => setIsWithholdModalOpen_(true)}
                  startIcon={<Iconify icon={'eva:checkmark-circle-2-fill'} />}
                >
                  Publish Results
                </Button>
              )}
            </div>
          }
        />

        <Card>
          <TabContext value={value}>
            <Divider />
            <TabPanel value="0" key="0">
              {' '}
              <Box sx={{ p: 3 }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2.5fr', // Adjust column sizes
                    gap: '10px', // Space between grid items
                    marginBottom: '20px',
                    alignItems: 'center', // Align items vertically
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
                      placeholder="Search..." // You can add a placeholder if needed
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
                        rowCount={resultsList.length}
                        numSelected={selected.length}
                        // onRequestSort={handleRequestSort}
                        onSelectAllClick={handleSelectAllClick}
                      />

                      <TableBody>
                        {filteredResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                          const { id, progressionStatus } = row;

                          const isItemSelected = selected.indexOf(row.id) !== -1;
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
                                <Checkbox checked={isItemSelected} onClick={() => handleSelect(row)} />
                              </TableCell>
                              <TableCell align="left">{row?.studentNo ||row.national_id}</TableCell>
                              <TableCell align="left">
                                {row.firstname} {row.lastname}
                              </TableCell>
                                                            <TableCell align="left">{row.prog_name}</TableCell>

                           
                              <TableCell align="left">{row.year_of_study}</TableCell>
                              <TableCell align="left">{row?.phoneNumber || row?.phone_number}</TableCell>

                              {!row.withhold_results ? (
                                <TableCell align="left">
                                  <Label
                                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                    color={tabColor(progressionStatus)}
                                  >
                                    {progressionStatus === '' ? 'Pending' : progressionStatus}
                                  </Label>
                                </TableCell>
                              ) : (
                                <TableCell align="left">
                                  <Label
                                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                    color={'warning'}
                                  >
                                    Withheld
                                  </Label>
                                </TableCell>
                              )}
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
                  count={resultsList.length}
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
  if (query && !query.includes('Semester')) {
    return array.filter((object) => {
      return (
        (object.national_id?.toLowerCase() || '').indexOf(query.toLowerCase()) !== -1 ||
        (object.semester?.toLowerCase() || '').indexOf(query.toLowerCase()) !== -1 ||
        (object.firstname?.toLowerCase() || '').indexOf(query.toLowerCase()) !== -1 ||
        (object.lastname?.toLowerCase() || '').indexOf(query.toLowerCase()) !== -1 ||
        (object.tr_number?.toLowerCase() || '').indexOf(query.toLowerCase()) !== -1 
      );
    });
  }
  if (query.includes('Semester')) {
    return array.filter((object) => {
      return (object.semester?.toLowerCase() || '').indexOf(query.slice(-1).toLowerCase()) !== -1;
    });
  }

  return stabilizedThis.map((el) => el[0]);
}
