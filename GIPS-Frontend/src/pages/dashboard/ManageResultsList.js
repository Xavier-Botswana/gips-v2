import { useState, useEffect } from 'react';
// @mui
import * as Yup from 'yup';
import { useTheme } from '@mui/material/styles';
import {
  Card,
  Table,
  Box,
  Button,
  InputBase,
  Stack,
  Divider,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  DialogTitle,
  TableContainer,
  TablePagination,
  Dialog,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import { TabContext, LoadingButton, TabPanel } from '@mui/lab';
// routes

import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'notistack';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FormProvider, RHFTextField } from '../../components/hook-form';
import Iconify from '../../components/Iconify';
import Label from '../../components/Label';
import { PATH_DASHBOARD } from '../../routes/paths';
import { DialogAnimate } from '../../components/animate';

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
  { id: 'id', label: 'Student NO/ID', alignRight: false },
  { id: 'name', label: 'Student Name', alignRight: false },
  { id: 'assessment', label: 'TR No', alignRight: false },
  { id: 'duration', label: 'Year', alignRight: false },
  { id: 'semester', label: 'Semester', alignRight: false },
  { id: 'courseWork', label: 'Course Work(%)', alignRight: false },
  { id: 'supplement', label: 'Mid Semester Mark', alignRight: false },
  { id: 'examination', label: 'Examination Mark', alignRight: false },
  { id: 'sup', label: 'Supplementaary Mark', alignRight: false },
  { id: 'module', label: 'Module Mark', alignRight: false },
  { id: 'progression', label: 'Progression Status', alignRight: false },
];

// ----------------------------------------------------------------------

export default function ManageResultsList() {
  const theme = useTheme();
  const { themeStretch } = useSettings();
  const navigate = useNavigate();
  const params = useParams();
  const { id: batchId } = params;


  const { enqueueSnackbar } = useSnackbar();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultsList, setResultsList] = useState([]);
  const [page, setPage] = useState(0);
  const order = 'asc';
  const orderBy = 'name';
  const [selected, setSelected] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const value = '0';
  const [open, setOpenModal] = useState(false);
  const [isWithholdModalOpen_, setIsWithholdModalOpen_] = useState(false);

  const handleAddEvent = () => {
    setOpenModal(true);
    // console.log(open);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const EventSchema = Yup.object().shape({
    title: Yup.string().max(255).required('Title is required'),
    description: Yup.string().max(5000),
  });

  const methods = useForm({
    resolver: yupResolver(EventSchema),
    // defaultValues: getInitialValues(event,),
  });

  const {
    watch,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (e) => {
    console.log('onSubmit');
    e.preventDefault();

    try {
      const values = watch();
      console.log({ values });
      rejectResults(values);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const loadBatchResults = async () => {
      try {
        setLoading(true);
        setError('');
        setBatch(null);
        setResultsList([]);

        const res = await axios.get(`/v1/results/batch/id/${batchId}`);
        const foundBatch = res.data.data;

        if (!foundBatch) {
          setError('Batch not found');
          return;
        }

        setBatch(foundBatch);

        const results = foundBatch.expand?.results || [];
        if (!results.length) {
          setResultsList([]);
          return;
        }

        const hasExpandedStudents = results.some((r) => r.expand?.studentId);

        if (hasExpandedStudents) {
          setResultsList(
            results.map((result) => ({
              ...result,
              student: result.expand?.studentId || {},
            }))
          );
          return;
        }

        const studentIds = [...new Set(results.map((r) => r.studentId).filter(Boolean))];

        const studentResponses = await Promise.all(
          studentIds.map(async (id) => {
            try {
              const res = await axios.get(`/v1/students/${id}`);
              return { studentId: id, studentData: res.data };
            } catch (err) {
              console.error(`Failed to fetch student ${id}:`, err);
              return { studentId: id, studentData: null };
            }
          })
        );

        const studentMap = studentResponses.reduce((acc, item) => {
          acc[item.studentId] = item.studentData;
          return acc;
        }, {});

        setResultsList(
          results.map((result) => ({
            ...result,
            student: studentMap[result.studentId] || {},
          }))
        );
      } catch (err) {
        setError('Failed to load batch results');
        setResultsList([]);
      } finally {
        setLoading(false);
      }
    };

    if (batchId) {
      loadBatchResults();
    }
  }, [batchId]);


  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (nextValue) => {
    setFilterName(nextValue);
    setPage(0);
  };

  const handleWithholdMulti = () => {

    // Keep users NOT in the selected array (those we don't want to delete)
    const remainingResults = resultsList.filter((row) => !selected.includes(row.student.id));

    // Track successful deletions
    let successCount = 0;

    // Delete each selected user from the backend
    Promise.all(
      selected.map(async (row) => {
        try {
          console.log({ row });
          await axios.patch(`/v1/students/${row}`, { withhold_results: true});
          successCount += 1;
        } catch (error) {
          enqueueSnackbar('Unable to withhold results, try again later', { variant: 'error' });
          console.error(error);
        }
      })
    ).then(() => {
      // Show success alert after all deletion attempts complete
      if (successCount > 0) {
        enqueueSnackbar(`Successfully withheld ${successCount} result${successCount > 1 ? 's' : ''}`, {
          variant: 'success',
        });
      }
    });

    // Update state after deletion
    setResultsList(remainingResults);
    setSelected([]);
    setIsWithholdModalOpen_(false);
  };

  const approveResults = async (filteredResults) => {
    try {
      if (filteredResults.length === 0) {
        throw new Error('No results to approve.');
      }

      await Promise.all(
        filteredResults
          .filter((row) => row.status === 'pending')
          .map(async (row) => {
            try {
              await axios.patch(`/v1/results/${row.id}`, { status: 'approved' });
            } catch (error) {
              console.error(`Error updating record ${row.id}:`, error);
            }
          })
      );


      const results = filteredResults.map((record) => record.id);

      const { lecturerId, courseId, facultyId } = filteredResults[0];
      const data = {
        lecturerId,
        facultyId,
        courseId,
        results,
        submissionDate: new Date(),
        status: 'approved',
      };
      await axios.patch(`/v1/results/batch/${batchId}`, data);
      enqueueSnackbar('Results have been published successfully!');
      navigate(`${PATH_DASHBOARD.hod.manageResultsChooseLecturer}/${batch?.moduleId || resultsList[0]?.moduleId}`);
    } catch (error) {
      console.error('Error approving results:', error);
      enqueueSnackbar('Failed to publish results. Please try again.', { variant: 'error' });
    }
  };

  const rejectResults = async (_data) => {
    try {
      if (resultsList.length === 0) {
        throw new Error('No results to reject.');
      }
      setOpenModal(false);

      await Promise.all(
        resultsList.map(async (row) => {
          await axios.patch(`/v1/results/${row.id}`, { status: 'in-review' });
        })
      );

      const results = resultsList.map((record) => record.id);
      const { lecturerId, courseId, facultyId } = resultsList[0];

      console.log(`Batch ID: ${batchId}`);

      const data = {
        lecturerId,
        facultyId,
        courseId,
        results,
        submissionDate: new Date(),
        status: 'rejected',
        reviewMessage: _data.reviewMessage,
      };

       await axios.patch(`/v1/results/batch/${batchId}`, data);

       enqueueSnackbar('Results have been rejected successfully!');

    } catch (error) {
      console.error('Error rejecting results:', error);
      enqueueSnackbar('Failed to reject results. Please try again.', { variant: 'error' });
    }
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - resultsList.length) : 0;

  const filteredResults = applySortFilter(resultsList, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredResults.length && Boolean(filterName);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredResults.map((n) => n.student.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleSelect = (student) => {
    const { id } = student;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  return (
    <Page title="Students Results: List">
      <Dialog fullWidth maxWidth="sm" open={isWithholdModalOpen_}>
        <DialogTitle>Withhold Results?</DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              This action cannot be undone. Are you sure you want to withhold the selected student results?
            </Typography>
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions>
          <>
            <Button
              color="inherit"
              variant="outlined"
              onClick={() => {
                setIsWithholdModalOpen_(false);
              }}
            >
              Cancel
            </Button>
            <LoadingButton
              color="error"
              variant="contained"
              onClick={async () => {
                handleWithholdMulti();
              }}
            >
              Withhold
            </LoadingButton>
          </>
        </DialogActions>
      </Dialog>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="View Students Results Here"
          links={[{ name: 'Results Manager' }, { name: 'Module Name' }, { name: 'List' }]}
          action={
            <div>
              {selected.length !== 0 && (
                <Button
                  style={{ backgroundColor: '#e34563' }}
                  variant="contained"
                  onClick={() => setIsWithholdModalOpen_(true)}
                  startIcon={<Iconify icon={'eva:trash-fill'} />}
                >
                  Withhold Results
                </Button>
              )}
            </div>
          }
        />

        <Card>
          {(() => {
            if (loading) {
              return (
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress />
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

            return (
              <TabContext value={value}>
            <Divider />
            <TabPanel value="0" key="0">
              {' '}
              <Box sx={{ p: 3 }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2.5fr 2fr 2.5fr', // Adjust column sizes
                    gap: '10px', // Space between grid items
                    marginBottom: '20px',
                    alignItems: 'center', // Align items vertically
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
                        rowCount={resultsList.length}
                        numSelected={selected.length}
                        // onRequestSort={handleRequestSort}
                        onSelectAllClick={handleSelectAllClick}
                      />

                      <TableBody>
                        {filteredResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                          const { id, progressionStatus } = row;

                          const isItemSelected = selected.indexOf(row.student.id) !== -1;
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
                                <Checkbox checked={isItemSelected} onClick={() => handleSelect(row.student)} />
                              </TableCell>
                              <TableCell align="left">{row.student?.studentNo || row.student?.national_id}</TableCell>
                              <TableCell align="left">
                                {row.student.firstname} {row.student.lastname}
                              </TableCell>
                              <TableCell align="left">{row.student.tr_number}</TableCell>
                              <TableCell align="left">{row.yearOfStudy}</TableCell>
                              <TableCell align="left">{row.semester}</TableCell>
                              <TableCell align="left">{row.assignmentMark}</TableCell>
                              <TableCell align="left">{row.midSemesterMark}</TableCell>
                              <TableCell align="left">{row.examMark}</TableCell>
                              <TableCell align="left">{row?.supplementaryMark !== 0 ? row.supplementaryMark : "N/A" }</TableCell>
                              <TableCell align="left">{Math.round(row.moduleMark)}</TableCell>

                             {!row.student.withhold_results ? (<TableCell align="left">
                                <Label
                                  variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                  color={tabColor(progressionStatus)}
                                >
                                  {progressionStatus === '' ? 'Pending' : progressionStatus}
                                </Label>
                              </TableCell>) : 
                              (<TableCell align="left">
                                <Label
                                  variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                  color={"warning"}
                                >
                                Withheld
                                </Label>
                              </TableCell>)}
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
                  count={resultsList.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, page) => setPage(page)}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </TabPanel>
          </TabContext>
            );
          })()}
        </Card>

        <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
          <Button
            sx={{ background: '#aebd37', color: 'white' }}
            variant="contained"
            size="large"
            onClick={() => {
              approveResults(filteredResults);
            }}
          >
            Publish
          </Button>
          <Button
            sx={{ background: '#e21e26', color: 'white' }}
            variant="contained"
            onClick={handleAddEvent}
            size="large"
          >
            Reject
          </Button>
        </Stack>

        <DialogAnimate open={open} onClose={handleCloseModal}>
          <DialogTitle>Rejection Form</DialogTitle>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Stack spacing={3} sx={{ p: 3 }}>
              <RHFTextField name="reviewMessage" label="Reason for rejecting results" multiline rows={4} />
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

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query && !query.includes('Semester')) {
    return array.filter((object) => (
      (object.studentId?.toLowerCase() || '').indexOf(query.toLowerCase()) !== -1 ||
      (object.semester?.toLowerCase() || '').indexOf(query.toLowerCase()) !== -1 ||
      (object.student.firstname?.toLowerCase() || '').indexOf(query.toLowerCase()) !== -1 ||
      (object.student.lastname?.toLowerCase() || '').indexOf(query.toLowerCase()) !== -1 ||
      (object.student.tr_number?.toLowerCase() || '').indexOf(query.toLowerCase()) !== -1 ||
      (object.expand?.moduleId?.name?.toLowerCase() || '').indexOf(query.toLowerCase()) !== -1
    ));
  }
  if (query.includes('Semester')) {
    return array.filter(
      (object) => (object.semester?.toLowerCase() || '').indexOf(query.slice(-1).toLowerCase()) !== -1
    );
  }

  return stabilizedThis.map((el) => el[0]);
}
