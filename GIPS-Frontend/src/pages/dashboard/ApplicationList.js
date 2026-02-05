import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Card,
  Table,
  Avatar,
  Tab,
  Box,
  Divider,
  Checkbox,
  InputBase,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  Alert,
  LinearProgress,
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useSnackbar } from 'notistack';
import axios from '../../utils/axios';

// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Iconify from '../../components/Iconify';
import Scrollbar from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import { UserListHead, ApplicationsMoreMenu } from '../../sections/@dashboard/admissions/list';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Applicant Names', alignRight: false },
  { id: 'number', label: 'Phone Number', alignRight: false },
  { id: 'option_one', label: 'Program/Course', alignRight: false },
  { id: 'isVerified', label: 'Year of Study', alignRight: false },
  { id: 'sponsorship', label: 'Sponsorship ', alignRight: false },
  { id: 'status', label: 'Application Status', alignRight: false },
  { id: 'dtef_status', label: 'DTEF Submission', alignRight: false },
  { id: '' },
];

const TABLE_HEAD1 = [
  { id: 'name', label: 'Applicant Names', alignRight: false },
  { id: 'number', label: 'Phone Number', alignRight: false },
  { id: 'option_one', label: 'Program/Course', alignRight: false },
  { id: 'isVerified', label: 'Year of Study', alignRight: false },
  { id: 'sponsorship', label: 'Sponsorship ', alignRight: false },
  { id: 'status', label: 'Application Status', alignRight: false },
  { id: 'dtef_status', label: 'DTEF Submission', alignRight: false },
  { id: '' },
];
// ----------------------------------------------------------------------

export default function ApplicationList() {
  const theme = useTheme();
  const { themeStretch } = useSettings();
  const [userList, setUserList] = useState([]);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('desc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('created');
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [value, setValue] = useState('0');
  const [courseOptions, setCourseOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchFilters = async () => {
      const [coursesRes, semestersRes] = await Promise.all([
        axios.get('/v1/courses'),
        axios.get('/v1/semesters'),
      ]);

      setCourseOptions(coursesRes.data.courses || []);
      setSemesterOptions(semestersRes.data.data || []);
    };

    fetchFilters();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const statusMap = {
      '0': 'pending',
      '1': 'accepted',
      '2': 'declined',
    };
    const status = statusMap[value];

    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError('');

        const params = {
          status,
          page: page + 1,
          limit: rowsPerPage,
          sortBy: orderBy,
          sortDir: order,
        };
        if (courseId) params.courseId = courseId;
        if (semesterId) params.semesterId = semesterId;
        if (debouncedSearch) params.q = debouncedSearch;

        const res = await axios.get('v1/applications', { params });
        setUserList(res.data.data || []);
        setTotalRecords(res.data.totalRecords || res.data.data?.length || 0);
      } catch (err) {
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [courseId, semesterId, value, page, rowsPerPage, debouncedSearch, order, orderBy]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (checked) => {
    if (checked) {
      const newSelecteds = userList.map((n) => n.id);
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

  const handleTabChange = (e, tabValue) => {
    setValue(tabValue);
    setPage(0);
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm('Are you sure you want to delete this application?');
    if (!confirmed) return;

    try {
      await axios.delete(`/v1/applications/${userId}`);
      const deleteUser = userList.filter((user) => user.id !== userId);
      setSelected([]);
      setUserList(deleteUser);
      enqueueSnackbar('Application deleted', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to delete application', { variant: 'error' });
    }
  };

  const emptyRows = Math.max(0, rowsPerPage - userList.length);

  const pendingApplications = userList.filter((user) => user.status === 'pending');
  const acceptedApplications = userList.filter((user) => user.status === 'accepted');
  const declinedApplications = userList.filter((user) => user.status === 'declined');

  const filteredApplicationsPending = applySortFilter(pendingApplications, getComparator(order, orderBy), searchTerm);
  const isNotFoundPending = !filteredApplicationsPending.length && Boolean(searchTerm);

  const filteredApplicationsAccepted = applySortFilter(acceptedApplications, getComparator(order, orderBy), searchTerm);
  const isNotFoundAccepted = !filteredApplicationsAccepted.length && Boolean(searchTerm);

  const filteredApplicationsDeclined = applySortFilter(declinedApplications, getComparator(order, orderBy), searchTerm);
  const isNotFoundDeclined = !filteredApplicationsDeclined.length && Boolean(searchTerm);


  return (
    <Page title="Applications: List">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="View All Applications"
          links={[
            { name: 'Applications', href: PATH_DASHBOARD.admissions.applicationlist },
            { name: 'Manage Applications' },
          ]}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Card>
          {loading && <LinearProgress />}

              <TabContext value={value}>
             <Box sx={{ px: 3, bgcolor: 'background.neutral' }}>
               <TabList onChange={handleTabChange}>
                 <Tab disableRipple value="0" label="Pending" />
                 <Tab disableRipple value="1" label="Accepted" />
                 <Tab disableRipple value="2" label="Declined" sx={{ '& .MuiTab-wrapper': { whiteSpace: 'nowrap' } }} />
               </TabList>
             </Box>
             <Divider />

            {/* user tabs */}
            <TabPanel value="0">
              {' '}
              <Box sx={{ p: 3 }}>
                <div
                  key={843}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 3fr ', // Adjust column sizes
                    gap: '10px', // Space between grid items
                    marginBottom: '20px',
                    alignItems: 'center', // Align items vertically
                  }}
                >
                  <select
                    key={189}
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
onChange={(e) => setCourseId(e.target.value)}
                  >
                    <option value="">All Courses</option>
                    {courseOptions.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.course_name}
                      </option>
                    ))}
                  </select>


                  <select
                    key={79872}
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
                    onChange={(e) => setSemesterId(e.target.value)}
                  >
                    <option value="">All Semesters</option>
                    {semesterOptions.map((sem) => (
                      <option key={sem.id} value={sem.id}>
                        {sem.study_semester}
                      </option>
                    ))}
                  </select>

                  <Box
                    key={5467978}
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
                      key={99992}
                      placeholder="Search..." // You can add a placeholder if needed
                      style={{
                        color: '#919eab',
                        fontStyle: 'semibold',
                        fontSize: '14px',
                        padding: '10px 5px',
                        width: '100%',
                        height: '54px',
                      }}
                      onChange={(e) => setSearchTerm(e.target.value)}
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
                        rowCount={filteredApplicationsPending.length}
                        numSelected={selected.length}
                        onRequestSort={handleRequestSort}
                        onSelectAllClick={handleSelectAllClick}
                      />

                      <TableBody>
                        {filteredApplicationsPending
                          .filter((row) => row.status === 'pending')
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((row) => {
                            const { id, status, sponsorship, avatarUrl } = row;

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
                                  <Avatar alt={id} src={avatarUrl} sx={{ mr: 2 }} />
                                  <Typography variant="subtitle2" noWrap>
                                    {row.expand?.guest_id?.firstname} {row.expand?.guest_id?.lastname}
                                  </Typography>
                                </TableCell>
                                <TableCell align="left">{row.phoneNumber}</TableCell>
                                <TableCell align="left">{row.expand.option_one.course_name}</TableCell>
                                <TableCell align="left">{row.year_of_study}</TableCell>
                                <TableCell align="left">{sponsorship}</TableCell>
                                <TableCell align="left">
                                  <Label
                                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                    color={(status === 'pending' && 'warning') || 'success'}
                                  >
                                    {sentenceCase(status)}
                                  </Label>
                                </TableCell>
                                <TableCell align="left">
                                  <Label
                                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                    color={(row.dtef_status === 'pending' && 'warning') || 'success'}
                                  >
                                    {sentenceCase(row.dtef_status)}
                                  </Label>
                                </TableCell>
                                <TableCell align="right">
                                  <ApplicationsMoreMenu onDelete={() => handleDeleteUser(id)} userName={id} />
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
                      {isNotFoundPending && (
                        <TableBody>
                          <TableRow>
                            <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                              <SearchNotFound searchQuery={searchTerm} />
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

            <TabPanel value="1">
              {' '}
              <Box sx={{ p: 3 }}>
                <div
                  key={843}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 3fr ', // Adjust column sizes
                    gap: '10px', // Space between grid items
                    marginBottom: '20px',
                    alignItems: 'center', // Align items vertically
                  }}
                >
                  <select
                    key={189}
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
onChange={(e) => setCourseId(e.target.value)}
                  >
                    <option value="">All Courses</option>
                    {courseOptions.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.course_name}
                      </option>
                    ))}
                  </select>


                  <select
                    key={79872}
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
                    onChange={(e) => setSemesterId(e.target.value)}
                  >
                    <option value="">All Semesters</option>
                    {semesterOptions.map((sem) => (
                      <option key={sem.id} value={sem.id}>
                        {sem.study_semester}
                      </option>
                    ))}
                  </select>

                  <Box
                    key={5467978}
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
                      key={99992}
                      placeholder="Search..." // You can add a placeholder if needed
                      style={{
                        color: '#919eab',
                        fontStyle: 'semibold',
                        fontSize: '14px',
                        padding: '10px 5px',
                        width: '100%',
                        height: '54px',
                      }}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Box>
                </div>
                <Scrollbar>
                  <TableContainer sx={{ minWidth: 800 }}>
                    <Table>
                      <UserListHead
                        order={order}
                        orderBy={orderBy}
                        headLabel={TABLE_HEAD1}
                        rowCount={filteredApplicationsAccepted.length}
                        numSelected={selected.length}
                        onRequestSort={handleRequestSort}
                        onSelectAllClick={handleSelectAllClick}
                      />

                      <TableBody>
                        {filteredApplicationsAccepted
                          .filter((row) => row.status === 'approved')
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((row) => {
                            const { id, status, sponsorship, avatarUrl } = row;

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
                                  <Avatar alt={id} src={avatarUrl} sx={{ mr: 2 }} />
                                  <Typography variant="subtitle2" noWrap>
                                    {row.expand?.guest_id?.firstname || ''} {row.expand?.guest_id?.lastname || ''}
                                  </Typography>
                                </TableCell>
                                <TableCell align="left">{row.phoneNumber}</TableCell>
                                <TableCell align="left">{row.expand?.option_one?.course_name || ''}</TableCell>
                                <TableCell align="left">{row.year_of_study}</TableCell>
                                <TableCell align="left">{sponsorship}</TableCell>
                                <TableCell align="left">
                                  <Label
                                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                    color={status === 'approved' && 'success'}
                                  >
                                    {sentenceCase(status)}
                                  </Label>
                                </TableCell>
                                <TableCell align="left">
                                  <Label
                                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                    color={(row.dtef_status === 'pending' && 'warning') || 'success'}
                                  >
                                    {sentenceCase(row.dtef_status)}
                                  </Label>
                                </TableCell>
                                <TableCell align="right">
                                  <ApplicationsMoreMenu onDelete={() => handleDeleteUser(id)} userName={id} />
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
                      {isNotFoundAccepted && (
                        <TableBody>
                          <TableRow>
                            <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                              <SearchNotFound searchQuery={searchTerm} />
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

            <TabPanel value="2">
              {' '}
              <Box sx={{ p: 3 }}>
                <div
                  key={843}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 3fr ', // Adjust column sizes
                    gap: '10px', // Space between grid items
                    marginBottom: '20px',
                    alignItems: 'center', // Align items vertically
                  }}
                >
                  <select
                    key={189}
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
onChange={(e) => setCourseId(e.target.value)}
                  >
                    <option value="">All Courses</option>
                    {courseOptions.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.course_name}
                      </option>
                    ))}
                  </select>


                  <select
                    key={79872}
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
                    onChange={(e) => setSemesterId(e.target.value)}
                  >
                    <option value="">All Semesters</option>
                    {semesterOptions.map((sem) => (
                      <option key={sem.id} value={sem.id}>
                        {sem.study_semester}
                      </option>
                    ))}
                  </select>

                  <Box
                    key={5467978}
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
                      key={99992}
                      placeholder="Search..." // You can add a placeholder if needed
                      style={{
                        color: '#919eab',
                        fontStyle: 'semibold',
                        fontSize: '14px',
                        padding: '10px 5px',
                        width: '100%',
                        height: '54px',
                      }}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Box>
                </div>
                <Scrollbar>
                  <TableContainer sx={{ minWidth: 800 }}>
                    <Table>
                      <UserListHead
                        order={order}
                        orderBy={orderBy}
                        headLabel={TABLE_HEAD1}
                        rowCount={filteredApplicationsDeclined.length}
                        numSelected={selected.length}
                        onRequestSort={handleRequestSort}
                        onSelectAllClick={handleSelectAllClick}
                      />

                      <TableBody>
                        {filteredApplicationsDeclined
                          .filter((row) => row.status === 'declined')
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((row) => {
                            const { id, status, sponsorship, avatarUrl } = row;

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
                                  <Avatar alt={id} src={avatarUrl} sx={{ mr: 2 }} />
                                  <Typography variant="subtitle2" noWrap>
                                    {row.expand.guest_id?.firstname} {row.expand.guest_id?.lastname}
                                  </Typography>
                                </TableCell>
                                <TableCell align="left">{row.phoneNumber}</TableCell>
                                <TableCell align="left">{row.expand.option_one.course_name}</TableCell>
                                <TableCell align="left">{row.year_of_study}</TableCell>
                                <TableCell align="left">{sponsorship}</TableCell>
                                <TableCell align="left">
                                  <Label
                                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                    color={status === 'declined' && 'error'}
                                  >
                                    {sentenceCase(status)}
                                  </Label>
                                </TableCell>
                                <TableCell align="left">
                                  <Label
                                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                    color={(row.dtef_status === 'pending' && 'warning') || 'success'}
                                  >
                                    {sentenceCase(row.dtef_status)}
                                  </Label>
                                </TableCell>
                                <TableCell align="right">
                                  <ApplicationsMoreMenu onDelete={() => handleDeleteUser(id)} userName={id} />
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
                      {isNotFoundDeclined && (
                        <TableBody>
                          <TableRow>
                            <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                              <SearchNotFound searchQuery={searchTerm} />
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
  if (queryy.includes('All Courses')) {
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
    return array.filter((object) =>
      object.expand?.guest_id?.national_id.toLowerCase().indexOf(queryy.toLowerCase()) !== -1 ||
      object?.expand.guest_id?.firstname.toLowerCase().indexOf(queryy.toLowerCase()) !== -1 ||
      object?.expand.guest_id?.lastname.toLowerCase().indexOf(queryy.toLowerCase()) !== -1 ||
      object?.expand.option_one?.course_name.toString().toLowerCase().indexOf(queryy.toLowerCase()) !== -1 ||
      object?.sponsorship.toString().toLowerCase().indexOf(queryy.toLowerCase()) !== -1,
    );
  }

  if (queryy.includes('Semester')) {
    return array.filter(
      (object) =>
        object.expand?.semester_id.study_semester.toLowerCase().indexOf(queryy.slice(-1).toLowerCase()) !== -1,
    );
  }

  // Return the sorted array if no query matches
  return stabilizedThis.map((el) => el[0]);
}
