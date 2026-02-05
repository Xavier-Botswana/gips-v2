import { useState, useEffect } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Card,
  Table,
  Box,
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
import moment from 'moment';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import axios from '../../utils/axios';
import useSettings from '../../hooks/useSettings';
// components
import Iconify from '../../components/Iconify';
import Page from '../../components/Page';
import Scrollbar from '../../components/Scrollbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { UserListHead } from '../../sections/@dashboard/admissions/list';
import SearchNotFound from '../../components/SearchNotFound';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'user_id', label: 'Employee Name', alignRight: false },
  { id: 'email_address', label: 'Email Address', alignRight: false },
  { id: 'activity', label: 'Activity', alignRight: false },
  { id: 'date', label: 'Date', alignRight: false },
  { id: 'time', label: 'Time', alignRight: false },
];

// ----------------------------------------------------------------------

export default function SystemLogs() {
  const theme = useTheme();
  const { themeStretch } = useSettings();
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filterName, setFilterName] = useState('');

  const getLogs = async (pageNum, perPage) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum + 1,
        perPage,
      });
      const response = await axios.get(`/v1/logs?${params}`);
      const { logs: fetchedLogs, totalRecords: total } = response.data;

      setLogs(fetchedLogs);
      setTotalRecords(total);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getLogs(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredLogs = applySortFilter(logs, getComparator(order, orderBy), filterName);
  const isNotFound = !filteredLogs.length && Boolean(filterName);

  return (
    <Page title="System Logs">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="View all System Logs"
          links={[{ name: 'Logs', href: PATH_DASHBOARD.admissions.studentslist }, { name: 'System Logs' }]}
        />

        <Card>
          <TabContext value="0">
            <TabPanel value="0">
              <Box sx={{ p: 3 }}>
                <div
                  key={843}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1.5fr 2fr ', // Adjust column sizes
                    gap: '10px', // Space between grid items
                    marginBottom: '20px',
                    alignItems: 'center', // Align items vertically
                  }}
                >
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
                      <UserListHead headLabel={TABLE_HEAD} />
                      <TableBody>
                        {filteredLogs.map((log) => (
                          <TableRow hover key={log.id}>
                            <TableCell padding="checkbox">
                              <Checkbox />
                            </TableCell>
                            <TableCell>{log.name || 'N/A'}</TableCell>
                            <TableCell>{log.email_address || 'N/A'}</TableCell>
                            <TableCell>{log.activity || 'N/A'}</TableCell>
                            <TableCell>{moment(log.date).format('MMMM Do, YYYY')}</TableCell>
                            <TableCell>{moment(log.date).format('h:mm:ss A')}</TableCell>
                          </TableRow>
                        ))}
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
              </Box>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalRecords}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
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
    const lowerCaseQuery = query.toLowerCase();

    return array.filter((object) => {
      return (
        (object.name && object.name.toLowerCase().includes(lowerCaseQuery)) ||
        (object.activity && object.activity.toLowerCase().includes(lowerCaseQuery)) ||
        (object.email_address && object.email_address.toLowerCase().includes(lowerCaseQuery))
      );
    });
  }

  return stabilizedThis.map((el) => el[0]);
}
