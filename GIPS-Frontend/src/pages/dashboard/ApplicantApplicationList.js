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
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import axios from '../../utils/axios';
import useAuth from '../../hooks/useAuth';

// hooks
import useSettings from '../../hooks/useSettings';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import { UserListHead, UserListToolbar, ApplicationsMoreMenu } from '../../sections/@dashboard/admissions/list';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'guest_id', label: 'Student ID', alignRight: false },
  { id: 'name', label: 'Student Name', alignRight: false },
  { id: 'option_one', label: 'Program/Course', alignRight: false },
  { id: 'isVerified', label: 'Academic Year', alignRight: false },
  { id: 'sponsorship', label: 'Sponsor', alignRight: false },
  { id: 'status', label: 'Application Status', alignRight: false },
  { id: 'dtef_status', label: 'DTEF Submission Status', alignRight: false },
];

// ----------------------------------------------------------------------

export default function ApplicantApplicationList() {
  const theme = useTheme();
  const { themeStretch } = useSettings();
  const { record } = useAuth();
  const [userList, setUserList] = useState([]);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [value, setValue] = useState('0');

  useEffect(() => {
    axios.get(`/v1/applications`).then((res) => {
      const { data } = res;

      const applicationPromises = data.map(async (application) => {
        const response = await axios.get(`/v1/guests/${application.guest_id}`);

        // console.log(response.data);

        const concatenated = { ...response.data, ...application };
        return concatenated;
      });

      Promise.all(applicationPromises).then((concatenatedData) => {
        const applicant = concatenatedData.find((item) => item.user_id === record.id);
        setUserList(applicant ? [applicant] : []);
      });
    });
  }, [record.id]);

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
    setFilterName(filterName);
    setPage(0);
  };

  const handleDeleteUser = (userId) => {
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

  const filteredApplications = applySortFilter(userList, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredApplications.length && Boolean(filterName);

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

        <Card>
          <TabContext value={value}>
            <Box sx={{ px: 3, bgcolor: 'background.neutral' }}>
              <TabList onChange={(e, value) => setValue(value)}>
                <Tab disableRipple value="0" label="Pending" />
              </TabList>
            </Box>
            <Divider />
            {/* user tabs */}
            <TabPanel value="0">
              {' '}
              <Box sx={{ p: 3 }}>
                <div style={{ display: 'flex', justifyItems: 'center' }}>
                  <UserListToolbar
                    numSelected={selected.length}
                    filterName={filterName}
                    onFilterName={handleFilterByName}
                    onDeleteUsers={() => handleDeleteMultiUser(selected)}
                  />
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
                        {filteredApplications
                          // .filter((row) => row.status === 'declined')
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((row) => {
                            const {
                              id,
                              name,
                              // guest_id,
                              // next_of_kin_name,
                              // next_of_kin_number,

                              status,
                              sponsorship,
                              avatarUrl,
                              isVerified,
                            } = row;

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
                                    {id}
                                  </Typography>
                                </TableCell>
                                <TableCell align="left">{name}</TableCell>
                                <TableCell align="left">{id}</TableCell>
                                <TableCell align="left">{isVerified ? 'Yes' : 'No'}</TableCell>
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
                  count={userList.length}
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
  if (query) {
    return array.filter((_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}
