import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { Link as RouterLink } from 'react-router-dom';

import {
  Card,
  Table,
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
  Alert,
  LinearProgress,
} from '@mui/material';
import { useSelector } from 'react-redux';

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
import { UserListHead, StudentMoreMenu } from '../../sections/@dashboard/admissions/list';
import Iconify from '../../components/Iconify';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'course_name', label: 'Course Name', alignRight: false },
  { id: 'faculty', label: 'Faculty', alignRight: false },
  { id: 'type', label: 'Type', alignRight: false },
  { id: 'duration', label: 'Duration ', alignRight: false },
  { id: 'facilitator', label: 'Facilitator', alignRight: false },
  { id: 'action', label: '', alignRight: false },
];

// ----------------------------------------------------------------------

export default function StudentsResultsList() {
  const { themeStretch } = useSettings();
  const { enqueueSnackbar } = useSnackbar();

  const [courseList, setCourseList] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('desc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('course_name');
  const [filterName, setFilterName] = useState('');
  const [filter, setFilter] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [value, setValue] = useState('0');
  const [idToDelete, setIdToDelete] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteModalOpen_, setIsDeleteModalOpen_] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const { record } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [coursesRes, facultiesRes] = await Promise.all([
          axios.get('/v1/courses', {
            params: {
              page: page + 1,
              perPage: rowsPerPage,
              facultyId: filter || undefined,
              search: filterName || undefined,
              sortBy: orderBy,
              sortDir: order,
            },
          }),
          axios.get('/v1/faculties'),
        ]);

        setCourseList(coursesRes.data.courses || []);
        setTotalRecords(coursesRes.data.totalItems || coursesRes.data.courses?.length || 0);
        setFacultyList(facultiesRes.data || []);
      } catch (err) {
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, rowsPerPage, filter, filterName, orderBy, order]);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (filterName) => {
    setFilterName(filterName);
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const emptyRows = Math.max(0, rowsPerPage - courseList.length);

    const filteredCourses = courseList;

  const isNotFound = !filteredCourses.length && Boolean(filterName);

  const handleCourseDelete = (courseId) => {
    try {
      axios.delete(`/v1/courses/${courseId}`).then(() => {
        setSelected([]);
        setCourseList(courseList.filter((user) => user.id !== courseId));
        setIsDeleteModalOpen(false);
        enqueueSnackbar('Course Deleted', { variant: 'success' });
      });
    } catch (error) {
      setIsDeleteModalOpen(false);
      enqueueSnackbar('Error Deleting Course', { variant: 'error' });
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = courseList.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleSelect = (id) => {
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

  // NOTE: NEED AXIOS CALL TO DELETE MULTIPLE COURSES
  const handleDeleteMulti = () => {
    // Keep users NOT in the selected array (those we don't want to delete)
    const remainingCourses = courseList.filter((row) => !selected.includes(row.id));

    // Track successful deletions
    let successCount = 0;

    // Delete each selected user from the backend
    Promise.all(
      selected.map(async (row) => {
        try {
          await axios.delete(`/v1/courses/${row}`);
          successCount += 1;
        } catch (error) {
          enqueueSnackbar('Unable to delete course, try again later', { variant: 'error' });
          console.error(error);
        }
      })
    ).then(() => {
      // Show success alert after all deletion attempts complete
      if (successCount > 0) {
        enqueueSnackbar(`Successfully deleted ${successCount} course${successCount > 1 ? 's' : ''}`, {
          variant: 'success',
        });
      }
    });

    // Update state after deletion
    setCourseList(remainingCourses);
    setSelected([]);
    setIsDeleteModalOpen_(false);
  };

  return (
    <Page title="Courses: List">
      <Dialog fullWidth maxWidth="sm" open={isDeleteModalOpen}>
        <DialogTitle>Delete Course?</DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              This action cannot be undone. Are you sure you want to delete the selected course?
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
                handleCourseDelete(idToDelete);
              }}
            >
              Delete
            </LoadingButton>
          </>
        </DialogActions>
      </Dialog>

      <Dialog fullWidth maxWidth="sm" open={isDeleteModalOpen_}>
        <DialogTitle>Delete Course?</DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              This action cannot be undone. Are you sure you want to delete the selected course?
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
                handleDeleteMulti();
              }}
            >
              Delete
            </LoadingButton>
          </>
        </DialogActions>
      </Dialog>
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="View all Courses Here"
          links={[
            {
              name: 'Courses',
              href: record?.role === 'hod' ? PATH_DASHBOARD.hod.courseList : PATH_DASHBOARD.superAdmin.courseList,
            },
            {
              name: 'Course',
              // href: record?.role === 'hod' ? PATH_DASHBOARD.hod.courseList : PATH_DASHBOARD.superAdmin.courseList,
            },
            { name: 'List' },
          ]}
          action={
            <div>
              <Button
                style={{ marginRight: 10 }}
                variant="contained"
                component={RouterLink}
                to={record.role === 'hod' ? PATH_DASHBOARD.hod.courseCreate : PATH_DASHBOARD.superAdmin.courseCreate}
                startIcon={<Iconify icon={'eva:plus-fill'} />}
              >
                New Course
              </Button>
              {selected.length !== 0 && (
                <Button
                  style={{ backgroundColor: '#e34563' }}
                  variant="contained"
                  onClick={() => setIsDeleteModalOpen_(true)}
                  startIcon={<Iconify icon={'eva:trash-fill'} />}
                >
                  Delete
                </Button>
              )}
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
              {loading && <LinearProgress sx={{ mb: 2 }} />}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <Box sx={{ p: 3 }}>
                <div

                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 4.5fr ', // Adjust column sizes
                    gap: '10px', // Space between grid items
                    marginBottom: '20px',
                    alignItems: 'center', // Align items vertically
                  }}
                >
                  <select
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
                      borderColor: '#dce0e4',
                    }}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="">All Faculties</option>
                    {facultyList.map((faculty) => (
                      <option value={faculty.id} key={faculty.id}>
                        {faculty.name}
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
                        rowCount={courseList.length}
                        numSelected={selected.length}
                        onRequestSort={handleRequestSort}
                        onSelectAllClick={handleSelectAllClick}
                      />


                      <TableBody>
                        {filteredCourses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
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
                                <Typography variant="subtitle2" noWrap>
                                  {row.course_name}
                                </Typography>
                              </TableCell>
                              <TableCell align="left">{row.expand?.faculty?.name || 'No Faculty'}</TableCell>
                              <TableCell align="left">{row.type}</TableCell>
                              <TableCell align="left">{row.duration} Years</TableCell>
                              <TableCell align="left">{row?.facilitator || 'No Facilitator'} </TableCell>
                              <TableCell align="right">
                                <StudentMoreMenu
                                  onDelete={() => {
                                    setIsDeleteModalOpen(true);
                                    setIdToDelete(id);
                                  }}
                                  id={id}
                                  userName={id}
                                  fromRoute="courses"
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
                  count={totalRecords}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
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
