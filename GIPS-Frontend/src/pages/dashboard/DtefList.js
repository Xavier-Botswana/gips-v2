import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';

import {
  Card,
  Table,
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
  Alert,
  LinearProgress,
  InputBase,
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useSnackbar } from 'notistack';
import axios from '../../utils/axios';
import RegistrationMoreMenu from '../../sections/@dashboard/admissions/list/RegistrationsMoreMenu';
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
import { UserListHead } from '../../sections/@dashboard/admissions/list';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Student Names', alignRight: false },
  { id: 'tr_number', label: 'TR No.', alignRight: false },
  { id: 'inst', label: 'Institution', alignRight: false },
  { id: 'prog_name', label: 'Course/Programme', alignRight: false },
  { id: 'sponsor', label: 'Sponsor', alignRight: false },
  { id: 'year_of_study', label: 'Academic Year', alignRight: false },
  { id: 'reg_status', label: 'Registration Status', alignRight: false },
  { id: 'dtef_status', label: 'DTEF Submission Status', alignRight: false },
  { id: '' },
];


// ----------------------------------------------------------------------

export default function DtefList() {
  const { themeStretch } = useSettings();
  const { enqueueSnackbar } = useSnackbar();

  const [userList, setUserList] = useState([]);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [value, setValue] = useState('0');

  const [courseOptions, setCourseOptions] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('/v1/courses');
        setCourseOptions(res.data.courses || []);
      } catch (err) {
        // ignore
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const statusMap = {
      '0': '',
      '1': 'approved',
      '2': 'declined',
    };
    const status = statusMap[value];

    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get('/v1/registration', {
          params: {
            page: page + 1,
            limit: rowsPerPage,
            status: status || undefined,
            courseId: courseId || undefined,
            search: debouncedSearch || undefined,
            sortBy: 'created',
            sortDir: 'desc',
          },
        });

        setUserList(res.data.data?.filter((r) => r.registration_type !== 'Returning') || []);
        setTotalRecords(res.data.totalRecords || res.data.data?.length || 0);
      } catch (err) {
        setError('Failed to load registrations');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [courseId, debouncedSearch, page, rowsPerPage, value]);














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

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm('Delete this registration?');
    if (!confirmed) return;
    try {
      await axios.delete(`/v1/registration/${userId}`);
      setUserList((prev) => prev.filter((user) => user.id !== userId));
      setSelected([]);
      enqueueSnackbar('Registration deleted', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to delete registration', { variant: 'error' });
    }
  };

  const emptyRows = Math.max(0, rowsPerPage - userList.length);
  const isNotFound = !userList.length && Boolean(debouncedSearch || courseId);


  const getColorBasedOnStatus = (status) => {
    if (status === 'pending') return 'warning';
    if (status === 'declined') return 'error';
    if (status === 'approved') return 'success';
    return 'default';
  };

  const renderTable = () => (
    <>
      <Box sx={{ p: 3 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 3fr',
            gap: '10px',
            marginBottom: '20px',
            alignItems: 'center',
          }}
        >
          <select
            style={{
              color: '#919eab',
              fontStyle: 'semibold',
              fontSize: '14px',
              border: '1px solid #dce0e4',
              height: '54px',
              paddingLeft: '5px',
              paddingRight: '5px',
              borderRadius: '8px',
              background: 'transparent',
              width: '100%',
              outline: 'none',
            }}
            onChange={(e) => setCourseId(e.target.value)}
            value={courseId}
          >
            <option value="">All Courses</option>
            {courseOptions.map((course) => (
              <option key={course.id} value={course.id}>
                {course.course_name}
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
              placeholder="Search..."
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
                order="desc"
                orderBy="created"
                headLabel={TABLE_HEAD}
                rowCount={userList.length}
                numSelected={selected.length}
                onSelectAllClick={handleSelectAllClick}
              />

              <TableBody>
                {userList.map((row) => {
                  const { id, names, surname } = row;
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
                        <Typography variant="subtitle2" noWrap>
                          {names} {surname}
                        </Typography>
                      </TableCell>

                      <TableCell align="left">{row.tr_number}</TableCell>
                      <TableCell align="left">{row.inst}</TableCell>
                      <TableCell align="left">{row.prog_name}</TableCell>
                      <TableCell align="left">{row.sponsor}</TableCell>
                      <TableCell align="left">{row.year_of_study}</TableCell>
                      <TableCell align="left">
                        <Label variant="ghost" color={getColorBasedOnStatus(row.reg_status)}>
                          {sentenceCase(row.reg_status || 'pending')}
                        </Label>
                      </TableCell>
                      <TableCell align="left">
                        <Label
                          variant="ghost"
                          color={row.dtef_status === 'pending' ? 'warning' : 'success'}
                        >
                          {row.dtef_status === 'pending' ? 'Pending Submission' : 'Submitted'}
                        </Label>
                      </TableCell>
                      <TableCell align="right">
                        <RegistrationMoreMenu onDelete={() => handleDeleteUser(id)} userName={row.id} />
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
                      <SearchNotFound searchQuery={debouncedSearch || courseId} />
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </TableContainer>
        </Scrollbar>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100, 500]}
          component="div"
          count={totalRecords}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </>
  );

  return (
    <Page title="DTEF Submissions">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="View DTEF Submissions"
          links={[{ name: 'Applications', href: PATH_DASHBOARD.admissions.applicationlist }, { name: 'DTEF' }]}
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
              <TabList
                onChange={(e, newValue) => {
                  setValue(newValue);
                  setPage(0);
                }}
              >
                <Tab disableRipple value="0" label="All" />
                <Tab disableRipple value="1" label="Approved" />
                <Tab disableRipple value="2" label="Declined" sx={{ '& .MuiTab-wrapper': { whiteSpace: 'nowrap' } }} />
              </TabList>
            </Box>
            <Divider />
            <TabPanel value="0">{renderTable()}</TabPanel>
            <TabPanel value="1">{renderTable()}</TabPanel>
            <TabPanel value="2">{renderTable()}</TabPanel>
          </TabContext>
        </Card>
      </Container>
    </Page>
  );
}

