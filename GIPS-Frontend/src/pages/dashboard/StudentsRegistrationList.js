import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  InputBase,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
// routes
import axioss from 'axios';
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
import { UserListHead, UserListToolbar, ApplicationsMoreMenu } from '../../sections/@dashboard/admissions/list';
import RegistrationMoreMenu from '../../sections/@dashboard/admissions/list/RegistrationsMoreMenu';
import axios from '../../utils/axios';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Student Name', alignRight: false },
  { id: 'option_one', label: 'TR Number', alignRight: false },
  { id: 'isVerified', label: 'Academic Year', alignRight: false },
  { id: 'sponsorship', label: 'Academic Semester ', alignRight: false },
  { id: 'reg_status', label: 'Programe', alignRight: false },
  { id: 'status', label: 'Registration Status', alignRight: false },
  { id: '' },
];

// ----------------------------------------------------------------------

export default function ApplicationList() {
  const theme = useTheme();
  const { themeStretch } = useSettings();

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

  useEffect(() => {
    axios.get(`/v1/courses`).then((res) => {
      const data = res.data.courses.map((data) => data.course_name);

      setOptions(['Select course/program', 'All Courses', ...data]);
    });

    if (query !== 'All Courses' && query !== '') {
      axioss.get(`/v1/registration`).then((res) => {
        const data = res.data.data.filter((data) => {
          return data.registration_type === 'Returning' && data.prog_name.toLowerCase() === query.toLowerCase();
        });

        setUserList(data);
      });
    } else {
      axios.get(`/v1/registration`).then((res) => {
        const data = res.data.data.filter((data) => {
          return data.registration_type === 'Returning';
        });
        setUserList(data);
      });
    }
  }, [query]);

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

  const handleFilterByName = (filterName) => {
    setQuery(filterName.toLowerCase());
    setPage(0);
  };

  const handleDeleteUser = (userId) => {
    axios.delete(`/v1/registration/${userId}`);

    const deleteUser = userList.filter((user) => user.id !== userId);
    setSelected([]);
    setUserList(deleteUser);
  };

  const handleDeleteMultiUser = (selected) => {
    const deleteUsers = userList.filter((user) => !selected.includes(user.name));
    setSelected([]);
    setUserList(deleteUsers);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - userList.length) : 0;

  const year1Applications = userList.filter((user) => user.year_of_study === 'Year 1'); // Assuming 'accepted' is the status for accepted users
  const filteredApplicationsYear1 = applySortFilter(year1Applications, getComparator(order, orderBy), filterName);
  const isNotFoundYear1 = !filteredApplicationsYear1.length && Boolean(filterName);

  const year2Applications = userList.filter((user) => user.year_of_study === 'Year 2'); // Assuming 'accepted' is the status for accepted users
  const filteredApplicationsYear2 = applySortFilter(year2Applications, getComparator(order, orderBy), filterName);
  const isNotFoundYear2 = !filteredApplicationsYear2.length && Boolean(filterName);

  const year3Applications = userList.filter((user) => user.year_of_study === 'Year 3'); // Assuming 'accepted' is the status for accepted users
  const filteredApplicationsYear3 = applySortFilter(year3Applications, getComparator(order, orderBy), filterName);
  const isNotFoundYear3 = !filteredApplicationsYear3.length && Boolean(filterName);

  const year4Applications = userList.filter((user) => user.year_of_study === 'Year 4'); // Assuming 'accepted' is the status for accepted users
  const filteredApplicationsYear4 = applySortFilter(year4Applications, getComparator(order, orderBy), filterName);
  const isNotFoundYear4 = !filteredApplicationsYear4.length && Boolean(filterName);

  const filteredApplications = applySortFilter(userList, getComparator(order, orderBy), filterName);
  const isNotFound = !filteredApplications.length && Boolean(filterName);

  const getColorBasedOnStatus = (status) => {
    if (status === 'pending') {
      return 'warning'; // Set the color for 'Pending' status
    }
    if (status === 'declined') {
      return 'error'; // Set the color for 'Declined' status
    }
    if (status === 'approved') {
      return 'success'; // Set the color for 'Registered' status
    }
  };

  return (
    <Page title="Applications: List">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="View and Manage All Registration Submissions"
          links={[
            {
              name: 'Applications',
              href: PATH_DASHBOARD.admissions.applicationlist,
            },
            { name: 'Manage Applications' },
          ]}
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
            {/* user tabs */}
            <TabPanel value="0">
              <Box sx={{ p: 3 }}>
                {' '}
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
                    onChange={(e) => setFilterName(e.target.value)}
                  >
                    {optionList.map((name) => (
                      <option key={name} value={name}>
                        {name}
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
                    onChange={(e) => setFilterName(e.target.value)}
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
                      onChange={(e) => setFilterName(e.target.value)}
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
                        {filteredApplications.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
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
                                <Avatar alt={id} src={''} sx={{ mr: 2 }} />
                                <Typography variant="subtitle2" noWrap>
                                  {names} {surname}
                                </Typography>
                              </TableCell>
                              <TableCell align="left">{row.tr_number}</TableCell>
                              <TableCell align="left">{row.year_of_study}</TableCell>
                              <TableCell align="left">{row.expand.semester_id?.name.slice(0, 11)}</TableCell>
                              <TableCell align="left">{row.expand.course_id?.course_name}</TableCell>
                              <TableCell align="left">
                                <Label
                                  variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                  color={getColorBasedOnStatus(row.reg_status)}
                                >
                                  {row.reg_status === 'pending' && 'Pending'}{' '}
                                  {row.reg_status === 'declined' && 'Declined'}{' '}
                                  {row.reg_status === 'approved' && 'Registered'}
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
                  count={filteredApplications.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, page) => setPage(page)}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </TabPanel>

            <TabPanel value="1">
              {' '}
              <Box sx={{ p: 3 }}>
                {' '}
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
                    onChange={(e) => setFilterName(e.target.value)}
                  >
                    {optionList.map((name) => (
                      <option key={name} value={name}>
                        {name}
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
                    onChange={(e) => setFilterName(e.target.value)}
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
                      onChange={(e) => setFilterName(e.target.value)}
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
                        rowCount={filteredApplicationsYear1.length}
                        numSelected={selected.length}
                        onRequestSort={handleRequestSort}
                        onSelectAllClick={handleSelectAllClick}
                      />

                      <TableBody>
                        {filteredApplicationsYear1
                          .filter((row) => row.year_of_study === 'Year 1')
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((row) => {
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
                                  <Avatar alt={id} src={''} sx={{ mr: 2 }} />
                                  <Typography variant="subtitle2" noWrap>
                                    {names} {surname}
                                  </Typography>
                                </TableCell>
                                <TableCell align="left">{row.tr_number}</TableCell>
                                <TableCell align="left">{row.year_of_study}</TableCell>
                                <TableCell align="left">{row.expand.semester_id?.name.slice(0, 11)}</TableCell>
                                <TableCell align="left">{row.expand.course_id?.course_name}</TableCell>
                                <TableCell align="left">
                                  <Label
                                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                    color={getColorBasedOnStatus(row.reg_status)}
                                  >
                                    {row.reg_status === 'pending' && 'Pending'}{' '}
                                    {row.reg_status === 'declined' && 'Declined'}{' '}
                                    {row.reg_status === 'approved' && 'Registered'}
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
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredApplicationsYear1.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, page) => setPage(page)}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </TabPanel>

            <TabPanel value="2">
              {' '}
              <Box sx={{ p: 3 }}>
                {' '}
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
                    onChange={(e) => setFilterName(e.target.value)}
                  >
                    {optionList.map((name) => (
                      <option key={name} value={name}>
                        {name}
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
                    onChange={(e) => setFilterName(e.target.value)}
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
                      onChange={(e) => setFilterName(e.target.value)}
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
                        rowCount={filteredApplicationsYear2.length}
                        numSelected={selected.length}
                        onRequestSort={handleRequestSort}
                        onSelectAllClick={handleSelectAllClick}
                      />

                      <TableBody>
                        {filteredApplicationsYear2
                          .filter((row) => row.year_of_study === 'Year 2')
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((row) => {
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
                                  <Avatar alt={id} src={''} sx={{ mr: 2 }} />
                                  <Typography variant="subtitle2" noWrap>
                                    {names} {surname}
                                  </Typography>
                                </TableCell>
                                <TableCell align="left">{row.tr_number}</TableCell>
                                <TableCell align="left">{row.year_of_study}</TableCell>
                                <TableCell align="left">{row.expand.semester_id?.name.slice(0, 11)}</TableCell>
                                <TableCell align="left">{row.expand.course_id?.course_name}</TableCell>
                                <TableCell align="left">
                                  <Label
                                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                    color={getColorBasedOnStatus(row.reg_status)}
                                  >
                                    {row.reg_status === 'pending' && 'Pending'}{' '}
                                    {row.reg_status === 'declined' && 'Declined'}{' '}
                                    {row.reg_status === 'approved' && 'Registered'}
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
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredApplicationsYear2.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, page) => setPage(page)}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </TabPanel>

            <TabPanel value="3">
              {' '}
              <Box sx={{ p: 3 }}>
                {' '}
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
                    onChange={(e) => setFilterName(e.target.value)}
                  >
                    {optionList.map((name) => (
                      <option key={name} value={name}>
                        {name}
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
                    onChange={(e) => setFilterName(e.target.value)}
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
                      onChange={(e) => setFilterName(e.target.value)}
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
                        rowCount={filteredApplicationsYear3.length}
                        numSelected={selected.length}
                        onRequestSort={handleRequestSort}
                        onSelectAllClick={handleSelectAllClick}
                      />

                      <TableBody>
                        {filteredApplicationsYear3
                          .filter((row) => row.year_of_study === 'Year 3')
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((row) => {
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
                                  <Avatar alt={id} src={''} sx={{ mr: 2 }} />
                                  <Typography variant="subtitle2" noWrap>
                                    {names} {surname}
                                  </Typography>
                                </TableCell>
                                <TableCell align="left">{row.tr_number}</TableCell>
                                <TableCell align="left">{row.year_of_study}</TableCell>
                                <TableCell align="left">{row.expand.semester_id?.name.slice(0, 11)}</TableCell>
                                <TableCell align="left">{row.expand.course_id?.course_name}</TableCell>
                                <TableCell align="left">
                                  <Label
                                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                    color={getColorBasedOnStatus(row.reg_status)}
                                  >
                                    {row.reg_status === 'pending' && 'Pending'}{' '}
                                    {row.reg_status === 'declined' && 'Declined'}{' '}
                                    {row.reg_status === 'approved' && 'Registered'}
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
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredApplicationsYear3.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, page) => setPage(page)}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </TabPanel>

            <TabPanel value="4">
              {' '}
              <Box sx={{ p: 3 }}>
                {' '}
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
                    onChange={(e) => setFilterName(e.target.value)}
                  >
                    {optionList.map((name) => (
                      <option key={name} value={name}>
                        {name}
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
                    onChange={(e) => setFilterName(e.target.value)}
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
                      onChange={(e) => setFilterName(e.target.value)}
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
                        rowCount={filteredApplicationsYear4.length}
                        numSelected={selected.length}
                        onRequestSort={handleRequestSort}
                        onSelectAllClick={handleSelectAllClick}
                      />

                      <TableBody>
                        {filteredApplicationsYear4
                          .filter((row) => row.year_of_study === 'Year 4')
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((row) => {
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
                                  <Avatar alt={id} src={''} sx={{ mr: 2 }} />
                                  <Typography variant="subtitle2" noWrap>
                                    {names} {surname}
                                  </Typography>
                                </TableCell>
                                <TableCell align="left">{row.tr_number}</TableCell>
                                <TableCell align="left">{row.year_of_study}</TableCell>
                                <TableCell align="left">{row.expand.semester_id?.name.slice(0, 11)}</TableCell>
                                <TableCell align="left">{row.expand.course_id?.course_name}</TableCell>
                                <TableCell align="left">
                                  <Label
                                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                    color={getColorBasedOnStatus(row.reg_status)}
                                  >
                                    {row.reg_status === 'pending' && 'Pending'}{' '}
                                    {row.reg_status === 'declined' && 'Declined'}{' '}
                                    {row.reg_status === 'approved' && 'Registered'}
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
                      {isNotFoundYear4 && (
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
                  count={filteredApplicationsYear4.length}
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
  if (queryy && !queryy.includes('Year')) {
    return array.filter((object) => {
      return (
        object?.tr_number.toLowerCase().indexOf(queryy.toLowerCase()) !== -1 ||
        object?.names.toLowerCase().indexOf(queryy.toLowerCase()) !== -1 ||
        object?.surname.toLowerCase().indexOf(queryy.toLowerCase()) !== -1 ||
        object?.prog_name.toString().toLowerCase().indexOf(queryy.toLowerCase()) !== -1 ||
        object?.idNumber.toString().toLowerCase().indexOf(queryy.toLowerCase()) !== -1 ||
        object?.sponsor.toString().toLowerCase().indexOf(queryy.toLowerCase()) !== -1
      );
    });
  }

  if (queryy.includes('Year')) {
    return array.filter((object) => {
      return object.year_of_study.toLowerCase().indexOf(queryy.slice(-1).toLowerCase()) !== -1;
    });
  }

  // Return the sorted array if no query matches
  return stabilizedThis.map((el) => el[0]);
}
