import { sentenceCase } from 'change-case';
import * as Yup from 'yup';
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Papa from 'papaparse';
import { useSnackbar } from 'notistack';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Card,
  Table,
  Avatar,
  Tab,
  Box,
  Divider,
  Button,
  Checkbox,
  Stack,
  TableRow,
  TableBody,
  TableCell,
  DialogActions,
  DialogTitle,
  Container,
  InputBase,
  Typography,
  TableContainer,
  TablePagination,
} from '@mui/material';
import { TabContext, LoadingButton, TabList, TabPanel } from '@mui/lab'; // routes
import axioss from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import { UploadIllustration } from '../../assets';
import axios from '../../utils/axios';
import { FormProvider, RHFTextField, RHFSwitch, RHFUploadSingleFile } from '../../components/hook-form';
import BlockContent from '../../components/upload/BlockContent';

import useSettings from '../../hooks/useSettings';
// _mock_
// import { _userList } from '../../_mock';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Iconify from '../../components/Iconify';
import Scrollbar from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import { UserListHead, UserListToolbar, StudentMoreMenu } from '../../sections/@dashboard/admissions/list';
import { DialogAnimate } from '../../components/animate';
import FileUploadDropzone from '../../components/upload/fileUpload';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'user_id', label: 'Student Names', alignRight: false },
  { id: 'role', label: 'Program/Course', alignRight: false },
  { id: '', label: 'Level/Year', alignRight: false },
  { id: 'sponsorship', label: 'Sponsor ', alignRight: false },
  { id: '', label: 'DTEF Submitted', alignRight: false },
  { id: 'status', label: 'Registration Status', alignRight: false },
  { id: '' },
];

// ----------------------------------------------------------------------

export default function StudentList() {
  const theme = useTheme();
  const { themeStretch } = useSettings();
  const [data, setData] = useState(null);
  const [userList, setUserList] = useState([]);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [value, setValue] = useState('0');
  const [query, setQuery] = useState('');
  const [optionList, setOptions] = useState([]);
  const [coursesByName, setCoursesByName] = useState({});
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpenModal] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

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
    const loadCourses = async () => {
      try {
        const res = await axios.get('/v1/courses', { params: { page: 1, perPage: 100 } });
        const courses = res.data.courses || [];

        const nameMap = courses.reduce((acc, c) => {
          acc[String(c.course_name || '').toLowerCase()] = c.id;
          return acc;
        }, {});

        setCoursesByName(nameMap);
        setOptions(['Select course/program', 'All Courses', ...courses.map((c) => c.course_name)]);
      } catch (err) {
        setCoursesByName({});
        setOptions(['Select course/program', 'All Courses']);
      }
    };

    loadCourses();
  }, []);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        setError('');

        const selectedCourseName = String(query || '').toLowerCase();
        const courseId =
          selectedCourseName &&
          selectedCourseName !== 'all courses' &&
          selectedCourseName !== 'select course/program'
            ? coursesByName[selectedCourseName]
            : undefined;

        const yearLevel = value !== '0' ? value : undefined;

        const res = await axios.get('/v1/students', {
          params: {
            page: page + 1,
            limit: rowsPerPage,
            courseId,
            yearLevel,
            search: filterName || undefined,
            sortBy: 'created',
            sortDir: 'desc',
          },
        });

        setUserList(res.data.data || []);
        setTotalRecords(res.data.totalRecords || 0);
      } catch (err) {
        setError('Failed to load students');
        setUserList([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [coursesByName, filterName, page, query, rowsPerPage, value]);

  const handleAddEvent = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  let file;
  const handleFileChange = (event) => {
    file = event.target.files[0];
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (file) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: async (results) => {
          try {
            const parsedData = results.data;

            // Using Promise.all to wait for all async tasks inside the map
            const mappedData = await Promise.all(
              parsedData.map(async (student) => {
                const dobParts = student['DATE OF BIRTH'].split('/'); // Split by '/'
                const formattedDate = `${dobParts[2]}-${dobParts[0]}-${dobParts[1]}T00:00:00.000Z`; // Convert to YYYY-MM-DDTHH:mm:ss.sssZ

           
                return {
                  title: 'Mr.', // Adjust based on gender
                  national_id: student.OMANG,
                  date_of_birth: formattedDate,
                  phone_number: student['CONTACT NO'],
                  country: 'Your Country', // Add your country or derive from the data
                  physical_address: 'Your Address', // Placeholder
                  next_of_kin_name: 'Next of Kin', // Placeholder or additional data
                  next_of_kin_number: 'Next of Kin Phone', // Placeholder or additional data
                  sponsor: student['STUDENT STATUS OVC/REGULAR'], // Placeholder or derive from the data
                  tr_number: student['TR NO'],
                  firstname: student['FIRST NAME'],
                  lastname: student.SURNAME,
                  // semester_id:               this is going to be uncommented later
                  // course_id: courseId,   this is going to be uncommented later
                  program_code: student['PROGRAMME CODE'], // this is going to be removed later
                  year_of_study: student['STUDY YEAR'],
                  prog_name: student['PROGRAMME DESCRIPTION'],
                  dtefStatus: student['SPONSORSHIP STATUS'] === 'Fully sponsored', // Example condition
                  status: student['STUDENT STATUS'],
                  study_mode: student['ACCOMODATION STATUS'],
                  phoneNumber: student['CONTACT NO'],
                  reg_status: student['STUDENT STATUS'],
                  dtef_status: student['SPONSORSHIP STATUS'],
                  accomo: student['ACCOMODATION STATUS'],
                  relationship: 'N/A', // Placeholder or additional data
                  studentNo: student['STUDENT NO'],
                };
              })
            );

            // Send mapped data to the server
            await Promise.all(mappedData.map((student) => axios.post(`/v1/students`, student)));

            console.log({ mappedData });

            // Close modal after completion
            handleCloseModal();
            enqueueSnackbar('List has been uploaded successfully.');
          } catch (error) {
            console.error('Error processing data: ', error);
          }
        },
        error: (error) => {
          console.error('Error parsing CSV: ', error);
        },
      });
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (checked) => {
    if (checked) {
      const newSelecteds = userList.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
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

  useEffect(() => {
    setPage(0);
  }, [query, value]);

  const handleDeleteUser = (userId) => {
    axios.delete(`/v1/students/${userId}`);
    const deleteUser = userList.filter((user) => user.id !== userId);
    setSelected([]);
    setUserList(deleteUser);
  };

  const emptyRows = Math.max(0, rowsPerPage - userList.length);
  const year1Students = userList.filter((user) => user.year_of_study === 'Year 1'); // Assuming 'accepted' is the status for accepted users
  const filteredStudentsYear1 = applySortFilter(year1Students, getComparator(order, orderBy), filterName);
  const isNotFoundYear1 = !filteredStudentsYear1.length && Boolean(filterName);
  const year2Students = userList.filter((user) => user.year_of_study === 'Year 2'); // Assuming 'accepted' is the status for accepted users
  const filteredStudentsYear2 = applySortFilter(year2Students, getComparator(order, orderBy), filterName);
  const isNotFoundYear2 = !filteredStudentsYear2.length && Boolean(filterName);
  const year3Applications = userList.filter((user) => user.year_of_study === 'Year 3'); // Assuming 'accepted' is the status for accepted users
  const filteredStudentsYear3 = applySortFilter(year3Applications, getComparator(order, orderBy), filterName);
  const isNotFoundYear3 = !filteredStudentsYear3.length && Boolean(filterName);
  const year4Applications = userList.filter((user) => user.year_of_study === 'Year 4'); // Assuming 'accepted' is the status for accepted users
  const filteredStudentsYear4 = applySortFilter(year4Applications, getComparator(order, orderBy), filterName);
  const isNotFoundYear4 = !filteredStudentsYear4.length && Boolean(filterName);
  const filteredUsers = applySortFilter(userList, getComparator(order, orderBy), filterName);
  const isNotFound = !filteredUsers.length && Boolean(filterName);

  const getColorBasedOnStatus = (status) => {
    if (status.toLowerCase() === 'pending') {
      return 'warning'; // Set the color for 'Pending' status
    }
    if (status.toLowerCase() === 'declined') {
      return 'error'; // Set the color for 'Declined' status
    }
    if (status.toLowerCase() === 'approved') {
      return 'success'; // Set the color for 'Registered' status
    }
  };
  const getColorBasedOnStatusDtef = (status) => {
    if (status.toLowerCase() === 'pending') {
      return 'warning'; // Set the color for 'Pending' status
    }
    if (status.toLowerCase() === 'approved') {
      return 'success'; // Set the color for 'Registered' status
    }
  };
  return (
    <Page title="Students: List">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="View all Students Here"
          links={[{ name: 'Students', href: PATH_DASHBOARD.admissions.studentslist }, { name: 'Manage Students' }]}
          action={
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(1, 1fr)' },
              }}
            >
               <Button
                variant="contained"
                component={RouterLink}
                to={PATH_DASHBOARD.admissions.newStudent}
                startIcon={<Iconify icon={'eva:plus-fill'} />}
              >
                Add New Student
              </Button> 
              {/* <Button
                onClick={handleAddEvent}
                startIcon={<Iconify icon={'eva:plus-fill'} />}
                variant="contained"
                sx={{ background: '#ffab00' }}
              >
                Batch Upload
              </Button> */}
            </Box>
          }
        />

        <Card>
          <TabContext value={value}>
            <Box sx={{ px: 3, bgcolor: 'background.neutral' }}>
              <TabList onChange={(e, value) => setValue(value)}>
                <Tab disableRipple value="0" label="All" />
                <Tab disableRipple value="1" label="Year 1" />
                <Tab disableRipple value="2" label="Year 2" />
                <Tab disableRipple value="3" label="Year 3" />
                <Tab disableRipple value="4" label="Year 4" sx={{ '& .MuiTab-wrapper': { whiteSpace: 'nowrap' } }} />
              </TabList>
            </Box>
            <Divider />
            <TabPanel value="0" key="0">
              {' '}
              <Box sx={{ p: 3 }}>
                <div
                  key={43}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 3fr ', // Adjust column sizes
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
                    onChange={(e) => setFilterName(e.target.value)}
                  >
                    {optionList.map((name) => (
                      <option key={name} value={name}>
                        {name}
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
                    onChange={(e) => setFilterName(e.target.value)}
                  >
                    {[
                      { name: 'All', value: '' },
                      { name: 'Semester 1', value: 'Semester 1' },
                      { name: 'Semester 2', value: 'Semester 2' },
                    ].map(({ name, value }) => (
                      <option key={value} value={value}>
                        {name}
                      </option>
                    ))}
                  </select>

                  <Box
                    key={5468}
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
                        rowCount={userList.length}
                        numSelected={selected.length}
                        onRequestSort={handleRequestSort}
                        onSelectAllClick={handleSelectAllClick}
                      />

                      <TableBody>
                        {filteredUsers.map((row) => {
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
                                <Checkbox checked={isItemSelected} onClick={() => handleClick(id)} />
                              </TableCell>

                              <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar alt={row.firstname} src={id} sx={{ mr: 2 }} />
                                <Typography variant="subtitle2" noWrap>
                                  {row.firstname} {row.lastname}
                                </Typography>
                              </TableCell>

                              <TableCell align="left">{row.prog_name}</TableCell>
                              <TableCell align="left">{row.year_of_study}</TableCell>
                              <TableCell align="left">{row.sponsor}</TableCell>
                              <TableCell align="left">
                                <Label
                                  variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                  color={getColorBasedOnStatusDtef(row.dtef_status)}
                                >
                                  {row.dtef_status === 'pending' && 'Pending Submission'}
                                  {row.dtef_status === 'approved' && 'Submitted'}
                                </Label>
                              </TableCell>

                              <TableCell align="left">
                                <Label
                                  variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                  color={getColorBasedOnStatus(row.reg_status)}
                                >
                                  {row.reg_status.toLowerCase() === 'pending' && 'Pending'}{' '}
                                  {row.reg_status.toLowerCase() === 'declined' && 'Declined'}{' '}
                                  {row.reg_status.toLowerCase() === 'approved' && 'Registered'}
                                </Label>
                              </TableCell>

                              <TableCell align="right">
                                <StudentMoreMenu onDelete={() => handleDeleteUser(id)} userName={id} />
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
                  rowsPerPageOptions={[5, 10, 25, 100]}
                  component="div"
                  count={totalRecords}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, page) => setPage(page)}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </TabPanel>
            <TabPanel value="1" key="1">
              {' '}
              <Box sx={{ p: 3 }}>
                <div
                  key={470983}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 3fr ', // Adjust column sizes
                    gap: '10px', // Space between grid items
                    marginBottom: '20px',
                    alignItems: 'center', // Align items vertically
                  }}
                >
                  <select
                    key={17867}
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
                    onChange={(e) => setFilterName(e.target.value)}
                  >
                    {optionList.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>

                  <select
                    key={27887}
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
                    onChange={(e) => setFilterName(e.target.value)}
                  >
                    {[
                      { name: 'All', value: '' },
                      { name: 'Semester 1', value: 'Semester 1' },
                      { name: 'Semester 2', value: 'Semester 2' },
                    ].map(({ name, value }) => (
                      <option key={value} value={value}>
                        {name}
                      </option>
                    ))}
                  </select>

                  <Box
                    key={54688}
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
                      key={92}
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
                        rowCount={filteredStudentsYear1.length}
                        numSelected={selected.length}
                        onRequestSort={handleRequestSort}
                        onSelectAllClick={handleSelectAllClick}
                      />

                      <TableBody>
                        {filteredStudentsYear1
                          .filter((row) => row.year_of_study === 'Year 1')
                          .map((row) => {
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
                                  <Checkbox checked={isItemSelected} onClick={() => handleClick(id)} />
                                </TableCell>

                                <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar alt={row.firstname} src={id} sx={{ mr: 2 }} />
                                  <Typography variant="subtitle2" noWrap>
                                    {row.firstname} {row.lastname}
                                  </Typography>
                                </TableCell>

                                <TableCell align="left">{row.prog_name}</TableCell>
                                <TableCell align="left">{row.year_of_study}</TableCell>
                                <TableCell align="left">{row.sponsor}</TableCell>
                                <TableCell align="left">
                                  <Label
                                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                    color={getColorBasedOnStatusDtef(row.dtef_status)}
                                  >
                                    {row.dtef_status === 'pending' && 'Pending Submission'}
                                    {row.dtef_status === 'approved' && 'Submitted'}
                                  </Label>
                                </TableCell>

                                <TableCell align="left">
                                  <Label
                                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                    color={getColorBasedOnStatus(row.reg_status)}
                                  >
                                    {row.reg_status.toLowerCase() === 'pending' && 'Pending'}{' '}
                                    {row.reg_status.toLowerCase() === 'declined' && 'Declined'}{' '}
                                    {row.reg_status.toLowerCase() === 'approved' && 'Registered'}
                                  </Label>
                                </TableCell>

                                <TableCell align="right">
                                  <StudentMoreMenu onDelete={() => handleDeleteUser(id)} userName={id} />
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
                      {isNotFoundYear1 && (
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
                  rowsPerPageOptions={[5, 10, 25, 100]}
                  component="div"
                  count={totalRecords}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, page) => setPage(page)}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </TabPanel>
            <TabPanel value="2" key="2">
              {' '}
              <Box sx={{ p: 3 }}>
                <div
                  key={453}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 3fr ', // Adjust column sizes
                    gap: '10px', // Space between grid items
                    marginBottom: '20px',
                    alignItems: 'center', // Align items vertically
                  }}
                >
                  <select
                    key={61}
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
                    onChange={(e) => setFilterName(e.target.value)}
                  >
                    {optionList.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>

                  <select
                    key={20056}
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
                    onChange={(e) => setFilterName(e.target.value)}
                  >
                    {[
                      { name: 'All', value: '' },
                      { name: 'Semester 1', value: 'Semester 1' },
                      { name: 'Semester 2', value: 'Semester 2' },
                    ].map(({ name, value }) => (
                      <option key={value} value={value}>
                        {name}
                      </option>
                    ))}
                  </select>

                  <Box
                    key={50468}
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
                      key={60020}
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
                        rowCount={filteredStudentsYear2.length}
                        numSelected={selected.length}
                        onRequestSort={handleRequestSort}
                        onSelectAllClick={handleSelectAllClick}
                      />

                      <TableBody>
                        {filteredStudentsYear2
                          .filter((row) => row.year_of_study === 'Year 2')
                          .map((row) => {
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
                                  <Checkbox checked={isItemSelected} onClick={() => handleClick(id)} />
                                </TableCell>

                                <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar alt={row.firstname} src={id} sx={{ mr: 2 }} />
                                  <Typography variant="subtitle2" noWrap>
                                    {row.firstname} {row.lastname}
                                  </Typography>
                                </TableCell>

                                <TableCell align="left">{row.prog_name}</TableCell>
                                <TableCell align="left">{row.year_of_study}</TableCell>
                                <TableCell align="left">{row.sponsor}</TableCell>
                                <TableCell align="left">
                                  <Label
                                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                    color={getColorBasedOnStatusDtef(row.dtef_status)}
                                  >
                                    {row.dtef_status === 'pending' && 'Pending Submission'}
                                    {row.dtef_status === 'approved' && 'Submitted'}
                                  </Label>
                                </TableCell>

                                <TableCell align="left">
                                  <Label
                                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                    color={getColorBasedOnStatus(row.reg_status)}
                                  >
                                    {row.reg_status.toLowerCase() === 'pending' && 'Pending'}{' '}
                                    {row.reg_status.toLowerCase() === 'declined' && 'Declined'}{' '}
                                    {row.reg_status.toLowerCase() === 'approved' && 'Registered'}
                                  </Label>
                                </TableCell>
                                {/* <TableCell align="left">
                                <Label
                                  variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                  color={(status === 'banned' && 'error') || 'success'}
                                >
                                  {sentenceCase(status)}
                                </Label>
                              </TableCell>
                              <TableCell align="left">
                                <Label
                                  variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                  color={(status === 'banned' && 'error') || 'success'}
                                >
                                  {sentenceCase(status)}
                                </Label>
                              </TableCell> */}
                                <TableCell align="right">
                                  <StudentMoreMenu onDelete={() => handleDeleteUser(id)} userName={id} />
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
                      {isNotFoundYear2 && (
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
                  rowsPerPageOptions={[5, 10, 25, 100]}
                  component="div"
                  count={totalRecords}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, page) => setPage(page)}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </TabPanel>
            <TabPanel value="3" key="3">
              {' '}
              <Box sx={{ p: 3 }}>
                <div
                  key={4773}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 3fr ', // Adjust column sizes
                    gap: '10px', // Space between grid items
                    marginBottom: '20px',
                    alignItems: 'center', // Align items vertically
                  }}
                >
                  <select
                    key={771}
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
                    onChange={(e) => setFilterName(e.target.value)}
                  >
                    {optionList.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>

                  <select
                    key={772}
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
                    onChange={(e) => setFilterName(e.target.value)}
                  >
                    {[
                      { name: 'All', value: '' },
                      { name: 'Semester 1', value: 'Semester 1' },
                      { name: 'Semester 2', value: 'Semester 2' },
                    ].map(({ name, value }) => (
                      <option key={value} value={value}>
                        {name}
                      </option>
                    ))}
                  </select>

                  <Box
                    key={75468}
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
                        rowCount={filteredStudentsYear3.length}
                        numSelected={selected.length}
                        onRequestSort={handleRequestSort}
                        onSelectAllClick={handleSelectAllClick}
                      />

                      <TableBody>
                        {filteredStudentsYear3
                          .filter((row) => row.year_of_study === 'Year 3')
                          .map((row) => {
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
                                  <Checkbox checked={isItemSelected} onClick={() => handleClick(id)} />
                                </TableCell>

                                <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar alt={row.firstname} src={id} sx={{ mr: 2 }} />
                                  <Typography variant="subtitle2" noWrap>
                                    {row.firstname} {row.lastname}
                                  </Typography>
                                </TableCell>

                                <TableCell align="left">{row.prog_name}</TableCell>
                                <TableCell align="left">{row.year_of_study}</TableCell>
                                <TableCell align="left">{row.sponsor}</TableCell>
                                <TableCell align="left">
                                  <Label
                                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                    color={getColorBasedOnStatusDtef(row.dtef_status)}
                                  >
                                    {row.dtef_status === 'pending' && 'Pending Submission'}
                                    {row.dtef_status === 'approved' && 'Submitted'}
                                  </Label>
                                </TableCell>

                                <TableCell align="left">
                                  <Label
                                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                    color={getColorBasedOnStatus(row.reg_status)}
                                  >
                                    {row.reg_status.toLowerCase() === 'pending' && 'Pending'}{' '}
                                    {row.reg_status.toLowerCase() === 'declined' && 'Declined'}{' '}
                                    {row.reg_status.toLowerCase() === 'approved' && 'Registered'}
                                  </Label>
                                </TableCell>
                                {/* <TableCell align="left">
                                <Label
                                  variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                  color={(status === 'banned' && 'error') || 'success'}
                                >
                                  {sentenceCase(status)}
                                </Label>
                              </TableCell>
                              <TableCell align="left">
                                <Label
                                  variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                  color={(status === 'banned' && 'error') || 'success'}
                                >
                                  {sentenceCase(status)}
                                </Label>
                              </TableCell> */}
                                <TableCell align="right">
                                  <StudentMoreMenu onDelete={() => handleDeleteUser(id)} userName={id} />
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
                      {isNotFoundYear3 && (
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
                  rowsPerPageOptions={[5, 10, 25, 100]}
                  component="div"
                  count={totalRecords}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, page) => setPage(page)}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </TabPanel>
            <TabPanel value="4" key="4">
              {' '}
              <Box sx={{ p: 3 }}>
                <div
                  key={43877}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 3fr ', // Adjust column sizes
                    gap: '10px', // Space between grid items
                    marginBottom: '20px',
                    alignItems: 'center', // Align items vertically
                  }}
                >
                  <select
                    key={8871}
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
                    onChange={(e) => setFilterName(e.target.value)}
                  >
                    {optionList.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>

                  <select
                    key={872}
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
                    onChange={(e) => setFilterName(e.target.value)}
                  >
                    {[
                      { name: 'All', value: '' },
                      { name: 'Semester 1', value: 'Semester 1' },
                      { name: 'Semester 2', value: 'Semester 2' },
                    ].map(({ name, value }) => (
                      <option key={value} value={value}>
                        {name}
                      </option>
                    ))}
                  </select>

                  <Box
                    key={587468}
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
                      key={87}
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
                        rowCount={filteredStudentsYear4.length}
                        numSelected={selected.length}
                        onRequestSort={handleRequestSort}
                        onSelectAllClick={handleSelectAllClick}
                      />

                      <TableBody>
                        {filteredStudentsYear4
                          .filter((row) => row.year_of_study === 'Year 4')
                          .map((row) => {
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
                                  <Checkbox checked={isItemSelected} onClick={() => handleClick(id)} />
                                </TableCell>

                                <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar alt={row.firstname} src={id} sx={{ mr: 2 }} />
                                  <Typography variant="subtitle2" noWrap>
                                    {row.firstname} {row.lastname}
                                  </Typography>
                                </TableCell>

                                <TableCell align="left">{row.prog_name}</TableCell>
                                <TableCell align="left">{row.year_of_study}</TableCell>
                                <TableCell align="left">{row.sponsor}</TableCell>
                                <TableCell align="left">
                                  <Label
                                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                    color={getColorBasedOnStatusDtef(row.dtef_status)}
                                  >
                                    {row.dtef_status === 'pending' && 'Pending Submission'}
                                    {row.dtef_status === 'approved' && 'Submitted'}
                                  </Label>
                                </TableCell>

                                <TableCell align="left">
                                  <Label
                                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                    color={getColorBasedOnStatus(row.reg_status)}
                                  >
                                    {row.reg_status.toLowerCase() === 'pending' && 'Pending'}{' '}
                                    {row.reg_status.toLowerCase() === 'declined' && 'Declined'}{' '}
                                    {row.reg_status.toLowerCase() === 'approved' && 'Registered'}
                                  </Label>
                                </TableCell>

                                <TableCell align="right">
                                  <StudentMoreMenu onDelete={() => handleDeleteUser(id)} userName={id} />
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
                      {isNotFoundYear4 && (
                        <TableBody>
                          <TableRow>
                            <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                              <SearchNotFound searchQuery={filterName} />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      )}
                      {/* {!isNotFoundYear4 && filteredStudentsYear3.length === 0 && (
                        <TableBody>
                          <TableRow>
                            <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                            No Data
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      )} */}
                    </Table>
                  </TableContainer>
                </Scrollbar>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 100]}
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
        </Card>

        <DialogAnimate open={open} onClose={handleCloseModal}>
          <DialogTitle>Batch Upload Students</DialogTitle>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Stack spacing={3} sx={{ p: 3 }}>
              <Stack
                spacing={2}
                alignItems="center"
                justifyContent="center"
                direction={{ xs: 'column', md: 'row' }}
                sx={{ width: 1, textAlign: { xs: 'center', md: 'left' } }}
              >
                <UploadIllustration sx={{ width: 220 }} />

                <Box sx={{ p: 3 }}>
                  <FileUploadDropzone onChange={handleFileChange} />
                </Box>
              </Stack>
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

function applySortFilter(array, comparator, queryy) {
  // Early return if 'All Courses' is the query
  if (queryy?.includes('All Courses')) {
    return array; // Return the default array without sorting or filtering
  }

  // Stabilize the array by storing elements with their index for stable sorting
  const stabilizedThis = array.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  // Apply filtering based on query if it's not 'All Courses'
  if (queryy && !queryy.includes('Semester')) {
    return array.filter((object) => {
      return (
        object.expand?.course_id?.course_name.toLowerCase().indexOf(queryy.toLowerCase()) !== -1 ||
        object?.firstname.toLowerCase().indexOf(queryy.toLowerCase()) !== -1 ||
        object?.lastname.toLowerCase().indexOf(queryy.toLowerCase()) !== -1 ||
        object?.tr_number.toString().toLowerCase().indexOf(queryy.toLowerCase()) !== -1 ||
        object?.sponsor.toString().toLowerCase().indexOf(queryy.toLowerCase()) !== -1
      );
    });
  }

  if (queryy.includes('Semester')) {
    return array.filter((object) => {
      return object.expand?.semester_id.study_semester.toLowerCase().indexOf(queryy.slice(-1).toLowerCase()) !== -1;
    });
  }

  // Return the sorted array if no query matches
  return stabilizedThis.map((el) => el[0]);
}
