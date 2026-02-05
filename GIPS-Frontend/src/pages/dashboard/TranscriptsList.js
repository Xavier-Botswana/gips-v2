import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';

import { TabContext, TabList, TabPanel, LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
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
import { UserListHead, TranscriptsMoreMenu } from '../../sections/@dashboard/admissions/list';
import Iconify from '../../components/Iconify';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'course_name', label: 'Student Name', alignRight: false },
  { id: 'faculty', label: 'Identity Number', alignRight: false },
  { id: 'type', label: 'Course', alignRight: false },
  { id: 'duration', label: 'Sponsor', alignRight: false },
  { id: 'facilitator', label: 'Level', alignRight: false },
  { id: 'action', label: '', alignRight: false },
];

// ----------------------------------------------------------------------

export default function StudentsResultsList() {
  const { record } = useSelector((state) => {
    return state.user;
  });
  const theme = useTheme();
  const { themeStretch } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [studentList, setStudentList] = useState([]);
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
  const [totalItems, setTotalItems] = useState(0);

  // Handler to update the state when the input changes
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    const getCourses = async () => {
      let response = await axios.get('/v1/students');
      console.log({ response });
      setTotalItems(response.data.totalRecords);

      setStudentList(response.data.data);

      response = await axios.get('/v1/courses');
      setFilterOptions([{ name: 'All', value: '' }, ...response.data.courses]);
    };

    const getFaculties = async () => {
      const response = await axios.get('/v1/faculties');

      setFacultyList(response.data);

      setFilterOptions([{ name: 'All', value: '' }, ...response.data]);
    };

    getCourses();
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - studentList.length) : 0;

  const filteredCourses = applySortFilter(studentList, getComparator(order, orderBy), filterName || _searchQuery);

  const isNotFound = !filteredCourses.length && Boolean(filterName || _searchQuery);

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

    let filteredArray = stabilizedThis.map((el) => el[0]);

    if (filter) {
      filteredArray = filteredArray.filter((course) => course.faculty === filter);
    }

    if (query) {
      filteredArray = filteredArray.filter((object) => {
        return (
          object.firstname.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
          object.lastname.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
          object.prog_name.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
          object.national_id.toLowerCase().indexOf(query.toLowerCase()) !== -1
        );
      });
    }

    return filteredArray;
  }

  const handleCourseDelete = (courseId) => {
    try {
      axios.delete(`/v1/courses/${courseId}`).then(() => {
        setSelected([]);
        setStudentList(studentList.filter((user) => user.id !== courseId));
        setIsDeleteModalOpen(false);
        enqueueSnackbar('Course Deleted', { variant: 'success' });
      });
    } catch (error) {
      setIsDeleteModalOpen(false);
      enqueueSnackbar('Error Deleting Course', { variant: 'error' });
    }
  };

  const handleSelect = (name) => {
    const selectedIdx = selected.indexOf(name);
    let newSelected = [];
    if (selectedIdx === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIdx === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIdx === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIdx > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIdx), selected.slice(selectedIdx + 1));
    }
    setSelected(newSelected);
  };

  // NOTE: NEED AXIOS CALL TO DELETE MULTIPLE COURSES
  const handleMultiCourseDelete = (selected) => {
    setSelected([]);
    setStudentList(studentList.filter((course) => !selected.includes(course.id)));
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
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="View all Transcripts"
          links={[{ name: 'Dashboard' }, { name: 'Transcripts' }, { name: 'List' }]}
          action={
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(1s, 1fr)' },
              }}
            >
              <Button
                align="end"
                variant="contained"
                onClick={
                  record.role === 'hod'
                    ? () => navigate(PATH_DASHBOARD.hod.transcriptCreate)
                    : () => navigate(PATH_DASHBOARD.superAdmin.transcriptCreate)
                }
              >
                + Generate Transcript
              </Button>
            </Box>
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
                      borderColor: `${theme.palette.grey[500_32]} !important`,
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
                        rowCount={studentList.length}
                        numSelected={selected.length}
                        // onRequestSort={handleRequestSort}
                        // onSelectAllClick={handleSelectAllClick}
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
                                  {row?.firstname} {row?.lastname}
                                </Typography>
                              </TableCell>
                              <TableCell align="left">{row?.national_id}</TableCell>
                              <TableCell align="left">{row?.prog_name}</TableCell>
                              <TableCell align="left">{row?.sponsor}</TableCell>
                              <TableCell align="left">{row?.year_of_study} </TableCell>
                              <TableCell align="right">
                                <TranscriptsMoreMenu
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
                  count={totalItems}
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
