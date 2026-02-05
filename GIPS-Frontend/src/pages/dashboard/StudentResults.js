import * as Yup from 'yup';
import { useState, useEffect, useMemo } from 'react';
import { useSnackbar } from 'notistack';
// @mui
import { useTheme } from '@mui/material/styles';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Card,
  Table,
  Tab,
  Box,
  Button,
  Divider,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  InputBase,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';

import { TabContext, TabList, TabPanel, LoadingButton } from '@mui/lab';
import { FormProvider, RHFSelect } from '../../components/hook-form';
import Iconify from '../../components/Iconify';
import { useSelector } from '../../redux/store';
import Label from '../../components/Label';

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
import { UserListHead } from '../../sections/@dashboard/admissions/list';
import { tabColor } from '../../utils/setProgressionStatusTabColor';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'Module Name', alignRight: false },
  { id: 'duration', label: 'Course Work (%)', alignRight: false },
  { id: 'supplement', label: 'Mid Semester Mark', alignRight: false },
  { id: 'examination', label: 'Examination Mark', alignRight: false },
  { id: 'sup', label: 'Supplementary Mark', alignRight: false },
  { id: 'module', label: 'Module Mark', alignRight: false },
  { id: 'progression', label: 'Progression Status', alignRight: false },
];

// Component for displaying payment status message
const PaymentStatusMessage = () => {
  const theme = useTheme();
  
  return (
    <Paper
      sx={{
        p: 6,
        textAlign: 'center',
        backgroundColor: theme.palette.grey[50],
        
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Iconify
          icon="material-symbols:payment-off"
          sx={{
            width: 80,
            height: 80,
            color: theme.palette.warning.main,
            mb: 2,
          }}
        />
      </Box>
      
      <Typography variant="h5" sx={{ mb: 2, color: theme.palette.text.primary }}>
        Results Withheld
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary, maxWidth: 400, mx: 'auto' }}>
        Your academic results have been withheld pending payment settlement. Please contact the finance office to resolve any outstanding fees.
      </Typography>
      
      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="eva:phone-call-fill" />}
          onClick={() => {
            // Add your contact logic here
            window.open('tel:+1234567890', '_self');
          }}
        >
          Contact Finance Office
        </Button>
        
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Iconify icon="eva:refresh-fill" />}
          onClick={() => {
            // Add refresh logic here
            window.location.reload();
          }}
        >
          Refresh Status
        </Button>
      </Stack>
    </Paper>
  );
};

// ----------------------------------------------------------------------

export default function StudentResults() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { themeStretch } = useSettings();
  const { record } = useSelector((state) => state.user);

  const [studentData, setStudentData] = useState({});
  const [page, setPage] = useState(0);
  const order = 'asc';
  const orderBy = 'name';
  const selected = [];
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [value, setValue] = useState('0');
  const [results, setResults] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWithheld, setIsWithheld] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getResults = async () => {
    try {
      setLoading(true);
      setError('');

       const studentRes = await axios.get(`/v1/students/me`);
       const student = studentRes.data.data;


      if (!student) {
        setStudentData({});
        setResults([]);
        setIsWithheld(false);
        setError('Student record not found');
        return;
      }

      setStudentData(student);
      setIsWithheld(Boolean(student.withhold_results));

      if (student.withhold_results) {
        setResults([]);
        return;
      }

      const resultsRes = await axios.get(`/v1/results/me`, { params: { limit: 500 } });
      setStudentData(resultsRes.data.data.student || student);
      setResults(resultsRes.data.data.results || []);
    } catch (err) {
      setError('Failed to load results');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (record?.id) {
      getResults();
    }
  }, [record?.id]);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (filterName) => {
    setFilterName(filterName);
    setPage(0);
  };


  const filteredUsers = applySortFilter(results, getComparator(order, orderBy), filterName);
  const emptyRows = Math.max(0, rowsPerPage - filteredUsers.length);
  const isNotFound = !filteredUsers.length && Boolean(filterName);

  const DownloadResultsSchema = Yup.object().shape({
    semester: Yup.string().required('Course code is required'),
  });

  const defaultValues = useMemo(
    () => ({
      semester: '',
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(DownloadResultsSchema),
    defaultValues,
  });

  const { watch } = methods;

  const values = watch();

  const onSubmit = async (e) => {
    e.preventDefault();
  };

  const downloadResultsSlip = async () => {
    try {
      const response = await axios.get(`/v1/result-slip/${filteredUsers[0]?.studentId}/${values.semester}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      enqueueSnackbar('Error downloading results slip', { variant: 'error' });
      setIsModalOpen(false);
      return null;
    }
  };

  const previewPdf = async () => {
    const pdfBlob = await downloadResultsSlip();
    if (!pdfBlob) return;
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  };


  // Render function for tab content
  const renderTabContent = (yearFilter = null) => {
    if (loading) {
      return (
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <span>Loading results...</span>
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      );
    }

    // If results are withheld due to payment, show the payment message
    if (isWithheld) {
      return <PaymentStatusMessage />;
    }

    return (
      <Box sx={{ p: 3 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.5fr 3fr ',
            gap: '10px',
            marginBottom: '20px',
            alignItems: 'center',
          }}
        >
          <input
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
              width: '100%',
              outline: 'none',
              background: 'transparent',
              borderColor: `${theme.palette.grey[500_32]} !important`,
            }}
            value={studentData?.prog_name || ''}
            readOnly
          />

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
                rowCount={results.length}
                numSelected={selected.length}
              />
              <TableBody>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .filter((result) => {
                    if (yearFilter === null) return true; // Show all for "All" tab
                    return result.yearOfStudy === yearFilter && result.status === 'approved';
                  })
                   .map((row) => {
                     const { id, progressionStatus } = row;

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
                          <Checkbox checked={isItemSelected} />
                        </TableCell>

                        <TableCell align="left">{row.expand.moduleId.name.replace(/\s*\(.*?\)/g, '')}</TableCell>
                        <TableCell align="left">{row.status === 'pending' ? '-' : row.assignmentMark}</TableCell>
                        <TableCell align="left">{row.status === 'pending' ? '-' : row.midSemesterMark}</TableCell>
                        <TableCell align="left">{row.status === 'pending' ? '-' : row.examMark}</TableCell>
                        <TableCell align="left">{row.status === 'pending' ? '-' : row.supplementaryMark}</TableCell>
                        <TableCell align="left">{row.status === 'pending' ? '-' :  Math.round(row.moduleMark)}</TableCell>
                        <TableCell align="left">
                          <Label
                            variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                            color={tabColor(progressionStatus)}
                          >
                            {row.progressionStatus || '-'}
                          </Label>
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
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    );
  };

  return (
    <Page title="My Results">
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Dialog fullWidth maxWidth="sm" open={isModalOpen}>
          <DialogTitle>Download Result Slip</DialogTitle>

          <DialogContent>
            <Stack spacing={3}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Select which academic semester to get your results from.
              </Typography>

              <RHFSelect name="semester" label="Semester">
                <option value="" />
                {[1, 2].map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </RHFSelect>
            </Stack>
          </DialogContent>

          <Divider />

          <DialogActions>
            <>
              <Button
                color="inherit"
                variant="outlined"
                onClick={() => {
                  setIsModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <LoadingButton color="info" variant="contained" onClick={previewPdf}>
                Download
              </LoadingButton>
            </>
          </DialogActions>
        </Dialog>
      </FormProvider>
      
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="View Your Results Here"
          links={[
            { name: 'List', href: PATH_DASHBOARD.student.studentResults },
            { name: 'Results ' },
          ]}
          action={
            !isWithheld && ( // Only show download button if results are available
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(1, 1fr)' },
                }}
              >
                <Button onClick={() => setIsModalOpen(true)} variant="contained" sx={{ background: '#ffab00' }}>
                  Download Results Slip
                </Button>
              </Box>
            )
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
                <Tab disableRipple value="4" label="Year 4" />
              </TabList>
            </Box>
            <Divider />
            
            <TabPanel value="0" key="0">
              {renderTabContent(null)}
            </TabPanel>

            <TabPanel value="1" key="1">
              {renderTabContent(1)}
            </TabPanel>

            <TabPanel value="2" key="2">
              {renderTabContent(2)}
            </TabPanel>

            <TabPanel value="3" key="3">
              {renderTabContent(3)}
            </TabPanel>

            <TabPanel value="4" key="4">
              {renderTabContent(4)}
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
  if (query && !query.toLowerCase().includes('semester')) {
    return array.filter(
      (result) =>
        result.expand?.moduleId?.name.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        result.semester.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }

  if (query && query.toLowerCase().includes('semester')) {
    return array.filter((result) => result.semester.toLowerCase().indexOf(query.slice(-1).toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}
