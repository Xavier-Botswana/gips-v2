import { useState, useEffect } from 'react';
// @mui
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { useTheme } from '@mui/material/styles';
import {
  Card,
  Table,
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
  DialogTitle,
  TableContainer,
   TablePagination,
   DialogActions,
   CircularProgress,
   Alert,
 } from '@mui/material';

import { TabContext, LoadingButton, TabList, TabPanel } from '@mui/lab';
// routes

import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'notistack';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FormProvider, RHFTextField } from '../../components/hook-form';
import Iconify from '../../components/Iconify';
import Label from '../../components/Label';
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
import { UserListHead } from '../../sections/@dashboard/admissions/list';
import { tabColor } from '../../utils/setProgressionStatusTabColor';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'Student ID', alignRight: false },
  { id: 'module_name', label: 'Module Name', alignRight: false },
  { id: 'name', label: 'Student Name', alignRight: false },
  { id: 'supplement', label: 'Supplement Mark', alignRight: false },
  { id: 'module', label: 'Module Mark', alignRight: false },
  { id: 'progression', label: 'Progression Status', alignRight: false },
];

// ----------------------------------------------------------------------

export default function ManageResultsList() {
  const theme = useTheme();
  const { token } = useSelector((state) => {
    return state.user;
  });

  const { themeStretch } = useSettings();

  const params = useParams();
  const { id } = params;

  const { enqueueSnackbar } = useSnackbar();
  const [resultsList, setResultsList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleAddEvent = () => {
    setOpenModal(true);
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

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const values = watch();
      rejectResults(values);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchSupplements = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await axios.get('/v1/results', {
          params: {
            page: page + 1,
            limit: rowsPerPage,
            progressionStatus: 'Fail + Supplement',
            search: (filterName || _searchQuery) ? (filterName || _searchQuery) : undefined,
            sortBy: 'created',
            sortDir: 'desc',
          },
        });

        setResultsList(res.data.data || []);
        setTotalRecords(res.data.totalRecords || res.data.data?.length || 0);
      } catch (err) {
        setError('Failed to load supplementary results');
        setResultsList([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplements();
  }, [page, rowsPerPage, filterName, _searchQuery]);

  useEffect(() => {
    const getCourses = async () => {
      const response = await axios.get('/v1/modules');
      const allSemesterModules = response.data[parseInt(id, 10)];
      // console.log(
      //   response.data.filter((a) => {
      //     return a.year_level === parseInt(id, 10);
      //   })
      // );
      setCourseList(response.data.courses);
      setFilterOptions(
        response.data.filter((a) => {
          return a.year_level === parseInt(id, 10);
        })
      );
    };

    getCourses();
  }, []);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (filterName) => {
    setFilterName(filterName);
    setPage(0);
  };

  const approveResults = async (results) => {
    try {
      await Promise.all(
        results.map((result) =>
          axios.patch(`/v1/results/${result.id}`, {
            ...result,
            status: 'approved',
          }),
        ),
      );
      enqueueSnackbar('Results have been published successfully!');
    } catch (error) {
      console.error('Error approving results:', error);
      enqueueSnackbar('Failed to publish results. Please try again.', { variant: 'error' });
    }
  };

  const rejectResults = async (_data) => {
    try {
      if (resultsList.length === 0) {
        throw new Error('No results to reject.');
      }
      setOpenModal(false);

      resultsList.map(async (record) => {
        const response = await axios.patch(`/v1/results/${record.id}`, {
          ...record,
          status: 'in-review',
        });
      });

      const results = resultsList.map((record) => record.id);
      const { batchId, lecturerId, courseId, facultyId } = resultsList[0];

      const data = {
        lecturerId,
        facultyId,
        courseId,
        results,
        submissionDate: new Date(),
        status: 'rejected',
        reviewMessage: _data.reason,
      };

      const response = await axios.patch(`/v1/results/batch/${batchId}`, data);

      enqueueSnackbar('Results have been rejected successfully!');
    } catch (error) {
      console.error('Error rejecting results:', error);
      enqueueSnackbar('Failed to reject results. Please try again.', { variant: 'error' });
    }
  };

  const emptyRows = Math.max(0, rowsPerPage - resultsList.length);

  const filteredResults = applySortFilter(resultsList, getComparator(order, orderBy), filterName || _searchQuery);

  const isNotFound = !filteredResults.length && Boolean(filterName || _searchQuery);

  return (
    <Page title="Students Results: Supplement List">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="View Students Supplements Here"
          links={[{ name: 'Results Manager' }, { name: 'Module Name' }, { name: 'List' }]}
        />

        <Card>
          {(() => {
            if (loading) {
              return (
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress />
                </Box>
              );
            }

            if (error) {
              return (
                <Box sx={{ p: 3 }}>
                  <Alert severity="error">{error}</Alert>
                </Box>
              );
            }

            return (
              <TabContext value={value}>
            <Box sx={{ px: 3, bgcolor: 'background.neutral' }}>
              <TabList onChange={(e, value) => setValue(value)}>
                {/* <Tab disableRipple value="0" label="All" /> */}
              </TabList>
            </Box>
            <Divider />
            <TabPanel value="0" key="0">
              {' '}
              <Box sx={{ p: 3 }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2.5fr 2fr 2.5fr', // Adjust column sizes
                    gap: '10px', // Space between grid items
                    marginBottom: '20px',
                    alignItems: 'center', // Align items vertically
                  }}
                >
                  <select
                    key={1}
                    style={{
                      color: '#919eab',
                      fontStyle: 'semibold',
                      fontSize: '14px',
                      border: '1px solid #dce0e4',
                      borderWidth: `1px !important`,
                      height: '54px',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      borderRadius: '8px',
                      background: 'transparent',
                      width: '100%',
                      outline: 'none',
                      borderColor: `${theme.palette.grey[500_32]} !important`,
                    }}
                    onChange={(e) => setQuery(e.target.value)}
                  >
                    {filterOptions.map((course, index) => (
                      <option key={index} value={course.name}>
                        {course.name}
                      </option>
                    ))}
                  </select>

                  <select
                    key={2}
                    style={{
                      color: '#919eab',
                      fontStyle: 'semibold',
                      fontSize: '14px',
                      border: '1px solid #dce0e4',
                      borderWidth: `1px !important`,
                      height: '54px',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      borderRadius: '8px',
                      background: 'transparent',
                      width: '100%',
                      outline: 'none',
                      borderColor: `${theme.palette.grey[500_32]} !important`,
                    }}
                    onChange={(e) => setQuery(e.target.value)}
                  >
                    {[
                      { name: 'All', value: '' },

                      { name: 'Year 1', value: 'Year 1' },
                      { name: 'Year 2', value: 'Year 2' },
                      { name: 'Year 3', value: 'Year 3' },
                      { name: 'Year 4', value: 'Year 4' },
                    ].map(({ name, value }) => (
                      <option key={value} value={value}>
                        {name}
                      </option>
                    ))}
                  </select>
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
                        // onSelectAllClick={handleSelectAllClick}
                      />

                      <TableBody>
                        {filteredResults.map((row) => {
                          const { id, progressionStatus } = row;

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
                                <Checkbox
                                  checked={isItemSelected}
                                  // onClick={() => handleClick(id)}
                                />
                              </TableCell>
                              <TableCell align="left">{row.studentId}</TableCell>
                              <TableCell align="left">{row.expand.moduleId.name}</TableCell>
                              <TableCell align="left">
                                {row.expand.studentId.firstname} {row.expand.studentId.lastname}
                              </TableCell>
                              <TableCell align="left">{row.supplementaryMark}</TableCell>
                              <TableCell align="left">{row.moduleMark} </TableCell>
                              <TableCell align="left">
                                <Label
                                  variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                  color={tabColor(progressionStatus)}
                                >
                                  {progressionStatus === '' ? 'Pending' : progressionStatus}
                                </Label>
                              </TableCell>

                              {/* <TableCell align="right">
                                <StudentListMenu
                                  // onDelete={() => handleDeleteUser(id)}
                                  id={row.studentId}
                                />
                              </TableCell> */}
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
                  count={totalRecords}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, page) => setPage(page)}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </TabPanel>
          </TabContext>
            );
          })()}
        </Card>

        <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
          <Button
            sx={{ background: '#aebd37', color: 'white' }}
            variant="contained"
            size="large"
            onClick={() => {
              approveResults(filteredResults);
            }}
          >
            Publish
          </Button>
          <Button
            sx={{ background: '#e21e26', color: 'white' }}
            variant="contained"
            onClick={handleAddEvent}
            size="large"
          >
            Reject
          </Button>
        </Stack>

        <DialogAnimate open={open} onClose={handleCloseModal}>
          <DialogTitle>Rejection Form</DialogTitle>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Stack spacing={3} sx={{ p: 3 }}>
              <RHFTextField name="moduleName" label="Module Name" />

              <RHFTextField name="reason" label="Reason for rejecting results" multiline rows={4} />
            </Stack>
            <DialogActions>
              <Box sx={{ flexGrow: 1 }} />

              <Button variant="outlined" color="inherit" onClick={handleCloseModal}>
                Cancel
              </Button>

              <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Loading...">
                Submit
              </LoadingButton>
            </DialogActions>
          </FormProvider>
        </DialogAnimate>
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
  // const stabilizedThis = array.map((el, index) => [el, index]);
  // stabilizedThis.sort((a, b) => {
  //   const order = comparator(a[0], b[0]);
  //   if (order !== 0) return order;
  //   return a[1] - b[1];
  // });
  // if (query && !query.includes('Semester')) {
  //   return array.filter((object) => {
  //     return (
  //       (object.studentId?.toLowerCase() || '').indexOf(query.toLowerCase()) !== -1 ||
  //       (object.semester?.toLowerCase() || '').indexOf(query.toLowerCase()) !== -1 ||
  //       (object.expand?.courseId?.course_name?.toLowerCase() || '').indexOf(query.toLowerCase()) !== -1 ||
  //       (object.expand?.studentId?.firstname?.toLowerCase() || '').indexOf(query.toLowerCase()) !== -1 ||
  //       (object.expand?.studentId?.lastname?.toLowerCase() || '').indexOf(query.toLowerCase()) !== -1 ||
  //       (object.expand?.studentId?.tr_number?.toLowerCase() || '').indexOf(query.toLowerCase()) !== -1 ||
  //       (object.expand?.moduleId?.name?.toLowerCase() || '').indexOf(query.toLowerCase()) !== -1
  //     );
  //   });
  // }
  // if (query.includes('Semester')) {
  //   return array.filter((object) => {
  //     return (object.semester?.toLowerCase() || '').indexOf(query.slice(-1).toLowerCase()) !== -1;
  //   });
  // }

  // return stabilizedThis.map((el) => el[0]);

  return array;
}
