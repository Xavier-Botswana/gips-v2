import { useEffect, useMemo, useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  Divider,
  InputBase,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Tab,
  Typography,
  CircularProgress,
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';

import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Iconify from '../../components/Iconify';
import Label from '../../components/Label';
import Page from '../../components/Page';
import Scrollbar from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import useSettings from '../../hooks/useSettings';
import axios from '../../utils/axios';

import { PATH_DASHBOARD } from '../../routes/paths';
import { UserListHead, StudentListMenu } from '../../sections/@dashboard/admissions/list';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'Student ID', alignRight: false },
  { id: 'name', label: 'Student Name', alignRight: false },
  { id: 'assessment', label: 'Assessment(%)', alignRight: false },
  { id: 'duration', label: 'Course Work (%)', alignRight: false },
  { id: 'supplement', label: 'Supplement Mark', alignRight: false },
  { id: 'examination', label: 'Examination Mark', alignRight: false },
  { id: 'module', label: 'Module Mark', alignRight: false },
  { id: 'progression', label: 'Progression Status', alignRight: false },
  { id: 'action', label: '', alignRight: false },
];

async function fetchAllPages(fetchPage) {
  const all = [];
  let currentPage = 1;
  let totalPages = 1;

  while (currentPage <= totalPages) {
    // eslint-disable-next-line no-await-in-loop
    const res = await fetchPage(currentPage);
    all.push(...(res.data.data || []));
    totalPages = res.data.totalPages || 1;
    currentPage += 1;
  }

  return all;
}

// ----------------------------------------------------------------------

export default function StudentsRejectedResultsList() {
  const theme = useTheme();
  const { themeStretch } = useSettings();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { record } = useSelector((state) => state.user);

  const [value, setValue] = useState('0');

  const [batchResults, setBatchResults] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');

  const selectedBatch = useMemo(
    () => batchResults.find((b) => String(b.id) === String(selectedBatchId)),
    [batchResults, selectedBatchId]
  );

  const [resultsList, setResultsList] = useState([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [selected, setSelected] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRejectedBatches = async () => {
      try {
        setLoading(true);
        setError('');

        const lecturersRes = await axios.get('/v1/lecturers');
        const lecturer = (lecturersRes.data.data || []).find((l) => String(l.user_id) === String(record.id));

        if (!lecturer) {
          setBatchResults([]);
          setSelectedBatchId('');
          setResultsList([]);
          setError('Lecturer record not found');
          return;
        }

        const allBatches = await fetchAllPages((p) =>
          axios.get('/v1/results/batch', {
            params: { page: p, limit: 500 },
          })
        );

        const rejected = allBatches.filter(
          (b) => String(b.lecturerId) === String(lecturer.id) && String(b.status) === 'rejected'
        );

        setBatchResults(rejected);
        setSelectedBatchId(rejected[0]?.id || '');
      } catch (err) {
        setError('Failed to load rejected batches');
        setBatchResults([]);
        setSelectedBatchId('');
        setResultsList([]);
      } finally {
        setLoading(false);
      }
    };

    if (record?.id) {
      loadRejectedBatches();
    }
  }, [record?.id]);

  useEffect(() => {
    const loadBatchResults = async () => {
      if (!selectedBatch) return;

      try {
        setLoading(true);
        setError('');
        setPage(0);

        const expanded = selectedBatch.expand?.results || [];
        const resultIds = new Set(expanded.map((r) => String(r.id)));

        const first = expanded[0];
        if (!first?.moduleId || !first?.semester || resultIds.size === 0) {
          setResultsList([]);
          return;
        }

        const allForModuleSemester = await fetchAllPages((p) =>
          axios.get('/v1/results', {
            params: {
              page: p,
              limit: 500,
              moduleId: first.moduleId,
              semester: first.semester,
              sortBy: 'created',
              sortDir: 'desc',
            },
          })
        );

        const onlyThisBatch = allForModuleSemester.filter((r) => resultIds.has(String(r.id)));
        setResultsList(onlyThisBatch);
      } catch (err) {
        setError('Failed to load results');
        setResultsList([]);
      } finally {
        setLoading(false);
      }
    };

    loadBatchResults();
  }, [selectedBatchId]);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const submitResults = async () => {
    if (!selectedBatch) return;

    try {
      setLoading(true);
      setError('');

      const resultIds =
        selectedBatch.results ||
        selectedBatch.expand?.results?.map((r) => r.id) ||
        resultsList.map((r) => r.id);

      const data = {
        lecturerId: selectedBatch.lecturerId,
        facultyId: selectedBatch.facultyId,
        courseId: selectedBatch.courseId,
        year_level: selectedBatch.year_level,
        semesterId: selectedBatch.semesterId,
        moduleId: selectedBatch.moduleId,
        results: resultIds,
        submissionDate: new Date(),
        status: 'pending',
      };

      await axios.post('/v1/results/batch', data);

      enqueueSnackbar('Results resubmitted successfully!');
      navigate(PATH_DASHBOARD.admissions.studentRejectedResultsList);
    } catch (err) {
      enqueueSnackbar('Failed to resubmit results', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = useMemo(() => {
    if (!searchQuery) return resultsList;

    const q = searchQuery.toLowerCase();
    return resultsList.filter((r) => {
      const student = r.expand?.studentId;
      const studentId = String(student?.national_id || r.studentId || '').toLowerCase();
      const first = String(student?.firstname || '').toLowerCase();
      const last = String(student?.lastname || '').toLowerCase();
      const moduleName = String(r.expand?.moduleId?.name || '').toLowerCase();
      const semester = String(r.semester || '').toLowerCase();

      return (
        studentId.includes(q) ||
        first.includes(q) ||
        last.includes(q) ||
        moduleName.includes(q) ||
        semester.includes(q)
      );
    });
  }, [resultsList, searchQuery]);

  const emptyRows = Math.max(0, rowsPerPage - filteredResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length);
  const isNotFound = !filteredResults.length && Boolean(searchQuery);

  return (
    <Page title="Rejected Results">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Rejected Results"
          links={[
            { name: 'Student List', href: PATH_DASHBOARD.admissions.studentslist },
            { name: 'Results Manager' },
            { name: 'Rejected Batches' },
          ]}
        />

        <Card>
          {loading && (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && error && (
            <Box sx={{ p: 3 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}

          {!loading && !error && (
            <TabContext value={value}>
              <Box sx={{ px: 3, bgcolor: 'background.neutral' }}>
                <TabList onChange={(e, v) => setValue(v)}>
                  <Tab disableRipple value="0" label="All" />
                </TabList>
              </Box>
              <Divider />

              <TabPanel value="0" key="0">
                <Box sx={{ p: 3 }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2.5fr 2.5fr 2fr',
                      gap: '10px',
                      marginBottom: '20px',
                      alignItems: 'center',
                    }}
                  >
                    <select
                      value={selectedBatchId}
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
                      onChange={(e) => setSelectedBatchId(e.target.value)}
                    >
                      <option value="" disabled>
                        Select batch
                      </option>
                      {batchResults.map((b) => (
                        <option key={b.id} value={b.id}>
                          {(b.expand?.moduleId?.name || b.moduleId || 'Module') + ' — ' + (b.reviewDate || b.created || b.id)}
                        </option>
                      ))}
                    </select>

                    <textarea
                      style={{
                        color: '#919eab',
                        fontStyle: 'semibold',
                        fontSize: '14px',
                        border: '1px solid #dce0e4',
                        borderWidth: `1px !important`,
                        height: '54px',
                        paddingLeft: '12px',
                        paddingTop: '4px',
                        paddingRight: '5px',
                        borderRadius: '8px',
                        width: '100%',
                        outline: 'none',
                        background: 'transparent',
                        borderColor: `${theme.palette.grey[500_32]} !important`,
                      }}
                      rows={2}
                      disabled
                      value={selectedBatch?.reviewMessage || 'N/A'}
                    />

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '8px',
                        border: '1px solid #dce0e4',
                        width: '100%',
                      }}
                    >
                      <Iconify icon={'eva:search-fill'} sx={{ color: 'text.disabled', width: 20, height: 20, ml: 1 }} />
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
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                          rowCount={filteredResults.length}
                          numSelected={selected.length}
                        />

                        <TableBody>
                          {filteredResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                            const progressionStatus = row.progressionStatus || '';
                            const isItemSelected = selected.indexOf(row.id) !== -1;

                            return (
                              <TableRow
                                hover
                                key={row.id}
                                tabIndex={-1}
                                role="checkbox"
                                selected={isItemSelected}
                                aria-checked={isItemSelected}
                              >
                                <TableCell padding="checkbox">
                                  <Checkbox checked={isItemSelected} />
                                </TableCell>

                                <TableCell align="left">{row.expand?.studentId?.national_id || row.studentId || '-'}</TableCell>
                                <TableCell align="left">
                                  {(row.expand?.studentId?.firstname || '-') + ' ' + (row.expand?.studentId?.lastname || '')}
                                </TableCell>
                                <TableCell align="left">{row.assignmentMark ?? '-'}</TableCell>
                                <TableCell align="left">{row.midSemesterMark ?? '-'}</TableCell>
                                <TableCell align="left">{row.supplementaryMark ?? '-'}</TableCell>
                                <TableCell align="left">{row.examMark ?? '-'}</TableCell>
                                <TableCell align="left">{row.moduleMark != null ? Math.round(row.moduleMark) : '-'}</TableCell>

                                <TableCell align="left">
                                  <Label
                                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                    color={progressionStatus.toLowerCase().includes('pass') ? 'success' : 'warning'}
                                  >
                                    {progressionStatus ? progressionStatus.charAt(0).toUpperCase() + progressionStatus.slice(1) : 'Pending'}
                                  </Label>
                                </TableCell>

                                <TableCell align="right">
                                  <StudentListMenu id={row.studentId} moduleId={row.moduleId} />
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
                                <SearchNotFound searchQuery={searchQuery} />
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
                    count={filteredResults.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </Box>
              </TabPanel>
            </TabContext>
          )}
        </Card>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          {selectedBatch && (
            <Button onClick={submitResults} variant="contained" size="large" disabled={loading || resultsList.length === 0}>
              Resubmit Results
            </Button>
          )}
        </Box>
      </Container>
    </Page>
  );
}
