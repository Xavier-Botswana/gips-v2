// import merge from 'lodash/merge';
// import ReactApexChart from 'react-apexcharts';
// // @mui
// import { Card, CardHeader, Box } from '@mui/material';
// //
// import { BaseOptionChart } from '../../../../components/chart';

// // ----------------------------------------------------------------------

// const CHART_DATA = [
//   {
//     name: 'Team A',
//     type: 'column',
//     data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30],
//   },
//   {
//     name: 'Team B',
//     type: 'area',
//     data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43],
//   },
//   {
//     name: 'Team C',
//     type: 'line',
//     data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39],
//   },
// ];

// export default function AnalyticsWebsiteVisits() {
//   const chartOptions = merge(BaseOptionChart(), {
//     stroke: { width: [0, 2, 3] },
//     plotOptions: { bar: { columnWidth: '14%' } },
//     fill: { type: ['solid', 'gradient', 'solid'] },
//     labels: [
//       '01/01/2003',
//       '02/01/2003',
//       '03/01/2003',
//       '04/01/2003',
//       '05/01/2003',
//       '06/01/2003',
//       '07/01/2003',
//       '08/01/2003',
//       '09/01/2003',
//       '10/01/2003',
//       '11/01/2003',
//     ],
//     xaxis: { type: 'datetime' },
//     tooltip: {
//       shared: true,
//       intersect: false,
//       y: {
//         formatter: (y) => {
//           if (typeof y !== 'undefined') {
//             return `${y.toFixed(0)} visits`;
//           }
//           return y;
//         },
//       },
//     },
//   });

//   return (
//     <Card>
//       <CardHeader title="Website Visits" subheader="(+43%) than last year" />
//       <Box sx={{ p: 3, pb: 1 }} dir="ltr">
//         <ReactApexChart type="line" series={CHART_DATA} options={chartOptions} height={364} />
//       </Box>
//     </Card>
//   );
// }
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import merge from 'lodash/merge';
import ReactApexChart from 'react-apexcharts';
// @mui
import {
  Card,
  Table,
  Avatar,
  Button,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  CardHeader,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
  Box,
  InputBase,
} from '@mui/material';
//
import { useTheme } from '@mui/material/styles';
import Scrollbar from '../../../../components/Scrollbar';
import SearchNotFound from '../../../../components/SearchNotFound';
import useSettings from '../../../../hooks/useSettings';

import Iconify from '../../../../components/Iconify';
import { BaseOptionChart } from '../../../../components/chart';
import axios from '../../../../utils/axios';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../../user/list';

// ----------------------------------------------------------------------
const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'lmark', label: 'Lowest Mark', alignRight: false },
  { id: 'hmark', label: 'Highest Mark', alignRight: false },
  { id: 'amark', label: 'Average Mark', alignRight: false },
  { id: 'action', label: '', alignRight: false },
];
const CHART_DATA = [
  {
    name: 'Year 1',
    type: 'column',
    data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30],
  },
  {
    name: 'Year 2',
    type: 'column',
    data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43],
  },
  {
    name: 'Year 3',
    type: 'column',
    data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39],
  },
  {
    name: 'Year 4',
    type: 'column',
    data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30],
  },
];

export default function AnalyticsFacultyTable() {
  const theme = useTheme();
  const { themeStretch } = useSettings();
  const { enqueueSnackbar } = useSnackbar();

  const [userList, setUserList] = useState([]);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [idToDelete, setIdToDelete] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const getResults = async () => {
      const response = await axios.get('/v1/analytics/by-faculty');
      const sortedData = response?.data?.data.sort((a, b) => b.averageMark - a.averageMark);

      setUserList(sortedData);
    };

    getResults();
  }, []);

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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - userList.length) : 0;

  const filteredUsers = applySortFilter(userList, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && Boolean(filterName);

  const chartOptions = merge(BaseOptionChart(), {
    stroke: { width: [0, 2, 3] },
    plotOptions: { bar: { columnWidth: '14%' } },
    fill: { type: ['solid', 'gradient', 'solid'] },
    labels: [
      'Pass',
      'Failed',
      '03/01/2003',
      '04/01/2003',
      '05/01/2003',
      '06/01/2003',
      '07/01/2003',
      '08/01/2003',
      '09/01/2003',
      '10/01/2003',
      '11/01/2003',
    ],
    xaxis: { type: 'Ttext' },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (y) => {
          if (typeof y !== 'undefined') {
            return `${y.toFixed(0)} visits`;
          }
          return y;
        },
      },
    },
  });

  return (
    // <Card>
    //   <CardHeader title="Website Visits" subheader="(+43%) than last year" />
    //   <Box sx={{ p: 3, pb: 1 }} dir="ltr">
    //     <ReactApexChart type="line" series={CHART_DATA} options={chartOptions} height={364} />
    //   </Box>
    // </Card>
    <Card>
      <CardHeader title="Performance by Faculty" subheader=" " />
      <Box sx={{ p: 2, pb: 0 }}>
        {/* <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '10px',
            marginBottom: '20px',
            alignItems: 'center',
          }}
        >
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
              placeholder="Search..."
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
        </div> */}
      </Box>

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
              {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                console.log({ row });
                const { id, facultyName, lowestMark, highestMark, averageMark } = row;
                const isItemSelected = selected.indexOf(facultyName) !== -1;

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
                      <Checkbox checked={isItemSelected} onClick={() => handleClick(facultyName)} />
                    </TableCell>
                    <TableCell align="left">{facultyName}</TableCell>
                    <TableCell align="left">{parseInt(lowestMark, 10)}</TableCell>
                    <TableCell align="left">{parseInt(highestMark, 10)}</TableCell>
                    <TableCell align="left">{parseInt(averageMark, 10)}</TableCell>

                    <TableCell align="right">
                      {/* <UserMoreMenu
                        onDelete={() => {
                          setIdToDelete(id);
                          setIsDeleteModalOpen(true);
                        }}
                        userId={id}
                      /> */}
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
    </Card>
  );
}

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
    const lowercasedQuery = query.toLowerCase();
    return array.filter(
      (_user) =>
        (_user.name && _user.name.toLowerCase().includes(lowercasedQuery)) ||
        (_user.email && _user.email.toLowerCase().includes(lowercasedQuery)) ||
        (_user.role && _user.role.toLowerCase().includes(lowercasedQuery)) ||
        (_user.department && _user.department.toLowerCase().includes(lowercasedQuery))
    );
  }

  return stabilizedThis.map((el) => el[0]);
}
