import { useState, useEffect, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { useSelector } from 'react-redux';
import moment from 'moment';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
// @mui
import { useTheme } from '@mui/material/styles';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Button,
  InputBase,
} from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
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
import Iconify from '../../components/Iconify';
import Scrollbar from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import { UserListHead, UserListToolbar, StudentMoreMenu } from '../../sections/@dashboard/admissions/list';
import { FormProvider, RHFTextField, RHFSelect, RHFEditor } from '../../components/hook-form';

// ----------------------------------------------------------------------
const CHANNEL_OPTION = ['Once-off', 'In-System', 'Email'];
// const CHANNEL_OPTION = ['Once-off', 'In-System', 'SMS ,'Email'];
const AUDIENCE_OPTION = ['All', 'All Staff', 'Academics', 'Admissions', 'Students'];

const TABLE_HEAD = [
  { id: 'topic', label: 'Communication Topic', alignRight: false },
  { id: 'message', label: 'Message/Description', alignRight: false },
  { id: 'channel', label: 'Communication Channel', alignRight: false },
  { id: 'audience', label: 'Audience', alignRight: false },
  { id: 'date', label: 'Date', alignRight: false },
];

// ----------------------------------------------------------------------

export default function NotificationsList() {
  const { token, record } = useSelector((state) => {
    return state.user;
  });
  const theme = useTheme();
  const { themeStretch } = useSettings();

  const [notificationsList, setNotificationsList] = useState([]);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [filter, setFilter] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [value, setValue] = useState('0');
  const [_searchQuery, setQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState(AUDIENCE_OPTION);
  const [inputValue, setInputValue] = useState('');
  const [idToDelete, setIdToDelete] = useState('');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const navigate = useNavigate();

  useEffect(() => {
    const getNotifications = async () => {
      try {
        const response = await axios.get('/v1/notifications', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setNotificationsList(response.data.notifications);

        setQuery('All');
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    getNotifications();
  }, [token]);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (filterName) => {
    console.log('filterName:', filterName);
    setFilterName(filterName);
    setPage(0);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - notificationsList.length) : 0;

  const filteredNotifications = applySortFilter(
    notificationsList,
    getComparator(order, orderBy),
    filterName || _searchQuery
  );

  const onceOffNotifications = notificationsList.filter(
    (notification) => notification.communicationChannel === 'Once-off'
  );
  const filteredOnceOffList = applySortFilter(
    onceOffNotifications,
    getComparator(order, orderBy),
    _searchQuery || filterName
  );

  const inSystemNotifications = notificationsList.filter(
    (notification) => notification.communicationChannel === 'In-System'
  );
  const filteredInSystemList = applySortFilter(
    inSystemNotifications,
    getComparator(order, orderBy),
    _searchQuery || filterName
  );

  // const smsNotifications = notificationsList.filter((notification) => notification.communicationChannel === 'SMS');
  // const filteredSMSList = applySortFilter(smsNotifications, getComparator(order, orderBy), _searchQuery || filterName);

  const emailNotifications = notificationsList.filter((notification) => notification.communicationChannel === 'Email');
  const filteredEmailList = applySortFilter(
    emailNotifications,
    getComparator(order, orderBy),
    _searchQuery || filterName
  );

  const isNotFound = !filteredNotifications.length && Boolean(filterName || _searchQuery);
  const isNotFoundOnceOff = !filteredOnceOffList.length && Boolean(filterName || _searchQuery);
  const isNotFoundInSystem = !filteredInSystemList.length && Boolean(filterName || _searchQuery);
  // const isNotFoundSMS = !filteredSMSList.length && Boolean(filterName || _searchQuery);
  const isNotFoundEmail = !filteredEmailList.length && Boolean(filterName || _searchQuery);

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

    if (query === 'All') {
      return stabilizedThis.map((el) => el[0]);
    }

    if (query === 'All Staff') {
      return stabilizedThis
        .map((el) => el[0])
        .filter((notification) => notification.audience.toLowerCase() !== 'students');
    }

    if (query === 'Academics') {
      return stabilizedThis
        .map((el) => el[0])
        .filter((notification) => notification.audience.toLowerCase() === query.toLowerCase());
    }

    if (query === 'Admissions') {
      return stabilizedThis
        .map((el) => el[0])
        .filter((notification) => notification.audience.toLowerCase() === query.toLowerCase());
    }

    if (query === 'Students') {
      return stabilizedThis
        .map((el) => el[0])
        .filter((notification) => notification.audience.toLowerCase() === query.toLowerCase());
    }

    return stabilizedThis
      .map((el) => el[0])
      .filter((notification) => notification.communicationTopic.toLowerCase().includes(query.toLowerCase()));
  }

  const handleNotificationDelete = (notificationId) => {
    axios.delete(`/v1/notification/${notificationId}`);
    setSelected([]);
    setNotificationsList(notificationsList.filter((notification) => notification.id !== notificationId));
    setCreateModalOpen(false);
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

  const handleMultiNotificationDelete = (selected) => {
    setSelected([]);
    setNotificationsList(notificationsList.filter((notification) => !selected.includes(notification.id)));
  };

  const NewNotificationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    message: Yup.string().required('Message is required'),
    communicationChannel: Yup.string().required('Communication Channel is required'),
    audience: Yup.string().required('Audience is required'),
  });

  const defaultValues = useMemo(() => ({
    title: '',
    message: '',
    communicationChannel: '',
    audience: '',
  }));

  const methods = useForm({
    resolver: yupResolver(NewNotificationSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios
        .post(
          'v1/notifications',
          {
            communicationChannel: values.communicationChannel,
            communicationTopic: values.title,
            messageDescription: values.message,
            audience: values.audience,
            date: new Date(),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          setCreateModalOpen(false);
          enqueueSnackbar('Notification created successfully!');
          navigate(PATH_DASHBOARD.superAdmin.notifications);
        });
    } catch (error) {
      console.error(error);
      setCreateModalOpen(false);
      enqueueSnackbar('An error occurred, please try again later', { variant: 'error' });
    }
  };

  return (
    <Page title="Notifications: List">
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Dialog fullWidth maxWidth="sm" open={isCreateModalOpen}>
          <DialogTitle>Notification Generator</DialogTitle>

          <DialogContent>
            <Box
              sx={{
                marginTop: 2,
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(1, 1fr)',
                },
              }}
            >
              <Stack spacing={2}>
                <RHFTextField name="title" label="Title" />
                <RHFTextField name="message" label=" Please type in your message..." />
                <RHFSelect name="communicationChannel" label="Communication Channel">
                  <option value="" />
                  {CHANNEL_OPTION.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </RHFSelect>
                <RHFSelect name="audience" label="Audience">
                  <option value="" />
                  {AUDIENCE_OPTION.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </RHFSelect>
              </Stack>
            </Box>
          </DialogContent>

          <Divider />

          <DialogActions>
            <>
              <Button
                color="inherit"
                variant="outlined"
                onClick={() => {
                  setCreateModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <LoadingButton type="submit" onClick={onSubmit} variant="contained" loading={isSubmitting}>
                Send
              </LoadingButton>
            </>
          </DialogActions>
        </Dialog>
      </FormProvider>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="View all notifications Here"
          links={[{ name: 'Notifications', href: PATH_DASHBOARD.superAdmin.notificationsList }, { name: 'List' }]}
          action={
            <Button
              variant="contained"
              onClick={() => {
                setCreateModalOpen(true);
              }}
            >
              New Communication
            </Button>
          }
        />

        <Card>
          <TabContext value={value}>
            <Box sx={{ px: 3, bgcolor: 'background.neutral' }}>
              <TabList onChange={(e, value) => setValue(value)}>
                <Tab disableRipple value="0" label="All" />
                <Tab disableRipple value="1" label="Once-off" />
                <Tab disableRipple value="2" label="In-System" />
                {/* <Tab disableRipple value="3" label="SMS" /> */}
                <Tab disableRipple value="4" label="Email" />
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
                      paddingLeft: '12px',
                      paddingRight: '5px',
                      borderRadius: '8px',
                      width: '100%', // Takes full width of the grid cell
                      outline: 'none',
                      background: 'transparent',
                      borderColor: `${theme.palette.grey[500_32]} !important`,
                    }}
                    onChange={(e) => setQuery(e.target.value)}
                  >
                    {filterOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
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
                        rowCount={notificationsList.length}
                        numSelected={selected.length}
                        // onRequestSort={handleRequestSort}
                        // onSelectAllClick={handleSelectAllClick}
                      />

                      <TableBody>
                        {filteredNotifications
                          .filter((notification) => notification.communicationChannel !== 'SMS')
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
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
                                  <Checkbox checked={isItemSelected} onClick={() => handleSelect(id)} />
                                </TableCell>

                                <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography variant="subtitle2" noWrap>
                                    {row.communicationTopic}
                                  </Typography>
                                </TableCell>
                                <TableCell align="left">{row.messageDescription || 'No Message'}</TableCell>
                                <TableCell align="left">{row.communicationChannel}</TableCell>
                                <TableCell align="left">{row.audience} </TableCell>
                                <TableCell align="left">
                                  {moment(row.date).format('MMMM Do, YYYY, h:mm:ss A')}{' '}
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
                  count={notificationsList.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, page) => setPage(page)}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </TabPanel>

            <TabPanel value="1" key="1">
              <Box sx={{ p: 3 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr' }}>
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
                      marginTop: '20px',
                      marginRight: '10px',
                      borderRadius: '8px',
                      width: '450px',
                      outline: 'none',
                      borderColor: `${theme.palette.grey[500_32]} !important`,
                    }}
                    onChange={(e) => setQuery(e.target.value)}
                  >
                    {filterOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  <UserListToolbar
                    numSelected={selected.length}
                    filterName={filterName}
                    filter={filter}
                    inputValue={inputValue}
                    // handleInputChange={handleInputChange}
                    onFilterName={handleFilterByName}
                    onDeleteUsers={() => handleMultiNotificationDelete(selected)}
                  />
                </div>
                <Scrollbar>
                  <TableContainer sx={{ minWidth: 800 }}>
                    <Table>
                      <UserListHead
                        order={order}
                        orderBy={orderBy}
                        headLabel={TABLE_HEAD}
                        rowCount={filteredOnceOffList.length}
                        numSelected={selected.length}
                        // onRequestSort={handleRequestSort}
                        // onSelectAllClick={handleSelectAllClick}
                      />

                      <TableBody>
                        {filteredOnceOffList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
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
                                  {row.communicationTopic}
                                </Typography>
                              </TableCell>
                              <TableCell align="left">{row.messageDescription || 'No Message'}</TableCell>
                              <TableCell align="left">{row.communicationChannel}</TableCell>
                              <TableCell align="left">{row.audience} </TableCell>
                              <TableCell align="left">{moment(row.date).format('MMMM Do, YYYY, h:mm:ss A')} </TableCell>
                            </TableRow>
                          );
                        })}
                        {emptyRows > 0 && (
                          <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={6} />
                          </TableRow>
                        )}
                      </TableBody>
                      {isNotFoundOnceOff && (
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
                  count={filteredOnceOffList.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, page) => setPage(page)}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </TabPanel>

            <TabPanel value="2" key="2">
              <Box sx={{ p: 3 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr' }}>
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
                      marginTop: '20px',
                      marginRight: '10px',
                      borderRadius: '8px',
                      width: '450px',
                      outline: 'none',
                      borderColor: `${theme.palette.grey[500_32]} !important`,
                    }}
                    onChange={(e) => setQuery(e.target.value)}
                  >
                    {filterOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  <UserListToolbar
                    numSelected={selected.length}
                    filterName={filterName}
                    filter={filter}
                    inputValue={inputValue}
                    // handleInputChange={handleInputChange}
                    onFilterName={handleFilterByName}
                    onDeleteUsers={() => handleMultiNotificationDelete(selected)}
                  />
                </div>
                <Scrollbar>
                  <TableContainer sx={{ minWidth: 800 }}>
                    <Table>
                      <UserListHead
                        order={order}
                        orderBy={orderBy}
                        headLabel={TABLE_HEAD}
                        rowCount={filteredInSystemList.length}
                        numSelected={selected.length}
                        // onRequestSort={handleRequestSort}
                        // onSelectAllClick={handleSelectAllClick}
                      />

                      <TableBody>
                        {filteredInSystemList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
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
                                  {row.communicationTopic}
                                </Typography>
                              </TableCell>
                              <TableCell align="left">{row.messageDescription || 'No Message'}</TableCell>
                              <TableCell align="left">{row.communicationChannel}</TableCell>
                              <TableCell align="left">{row.audience} </TableCell>
                              <TableCell align="left">{moment(row.date).format('MMMM Do, YYYY, h:mm:ss A')} </TableCell>
                            </TableRow>
                          );
                        })}
                        {emptyRows > 0 && (
                          <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={6} />
                          </TableRow>
                        )}
                      </TableBody>
                      {isNotFoundInSystem && (
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
                  count={filteredInSystemList.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, page) => setPage(page)}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </TabPanel>

            {/* <TabPanel value="3" key="3">
              <Box sx={{ p: 3 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr' }}>
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
                      marginTop: '20px',
                      marginRight: '10px',
                      borderRadius: '8px',
                      width: '450px',
                      outline: 'none',
                      borderColor: `${theme.palette.grey[500_32]} !important`,
                    }}
                    onChange={(e) => setQuery(e.target.value)}
                  >
                    {filterOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  <UserListToolbar
                    numSelected={selected.length}
                    filterName={filterName}
                    filter={filter}
                    inputValue={inputValue}
                    // handleInputChange={handleInputChange}
                    onFilterName={handleFilterByName}
                    onDeleteUsers={() => handleMultiNotificationDelete(selected)}
                  />
                </div>
                <Scrollbar>
                  <TableContainer sx={{ minWidth: 800 }}>
                    <Table>
                      <UserListHead
                        order={order}
                        orderBy={orderBy}
                        headLabel={TABLE_HEAD}
                        rowCount={filteredSMSList.length}
                        numSelected={selected.length}
                        // onRequestSort={handleRequestSort}
                        // onSelectAllClick={handleSelectAllClick}
                      />

                      <TableBody>
                        {filteredSMSList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
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
                                  {row.communicationTopic}
                                </Typography>
                              </TableCell>
                              <TableCell align="left">{row.messageDescription || 'No Message'}</TableCell>
                              <TableCell align="left">{row.communicationChannel}</TableCell>
                              <TableCell align="left">{row.audience} </TableCell>
                              <TableCell align="left">{moment(row.date).format('MMMM Do, YYYY, h:mm:ss A')} </TableCell>
                            </TableRow>
                          );
                        })}
                        {emptyRows > 0 && (
                          <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={6} />
                          </TableRow>
                        )}
                      </TableBody>
                      {isNotFoundSMS && (
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
                  count={filteredSMSList.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, page) => setPage(page)}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </TabPanel> */}

            <TabPanel value="4" key="4">
              <Box sx={{ p: 3 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr' }}>
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
                      marginTop: '20px',
                      marginRight: '10px',
                      borderRadius: '8px',
                      width: '450px',
                      outline: 'none',
                      borderColor: `${theme.palette.grey[500_32]} !important`,
                    }}
                    onChange={(e) => setQuery(e.target.value)}
                  >
                    {filterOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  <UserListToolbar
                    numSelected={selected.length}
                    filterName={filterName}
                    filter={filter}
                    inputValue={inputValue}
                    // handleInputChange={handleInputChange}
                    onFilterName={handleFilterByName}
                    onDeleteUsers={() => handleMultiNotificationDelete(selected)}
                  />
                </div>
                <Scrollbar>
                  <TableContainer sx={{ minWidth: 800 }}>
                    <Table>
                      <UserListHead
                        order={order}
                        orderBy={orderBy}
                        headLabel={TABLE_HEAD}
                        rowCount={filteredEmailList.length}
                        numSelected={selected.length}
                        // onRequestSort={handleRequestSort}
                        // onSelectAllClick={handleSelectAllClick}
                      />

                      <TableBody>
                        {filteredEmailList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
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
                                  {row.communicationTopic}
                                </Typography>
                              </TableCell>
                              <TableCell align="left">{row.messageDescription || 'No Message'}</TableCell>
                              <TableCell align="left">{row.communicationChannel}</TableCell>
                              <TableCell align="left">{row.audience} </TableCell>
                              <TableCell align="left">{moment(row.date).format('MMMM Do, YYYY, h:mm:ss A')}</TableCell>
                            </TableRow>
                          );
                        })}
                        {emptyRows > 0 && (
                          <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={6} />
                          </TableRow>
                        )}
                      </TableBody>
                      {isNotFoundEmail && (
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
                  count={filteredEmailList.length}
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
