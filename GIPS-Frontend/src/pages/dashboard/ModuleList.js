import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { Link as RouterLink } from 'react-router-dom';
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
  InputBase,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Button,
  LinearProgress,
  Alert,
} from '@mui/material';
import { useSelector } from 'react-redux';

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
import Scrollbar from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import { UserListHead, StudentMoreMenu } from '../../sections/@dashboard/admissions/list';
import Iconify from '../../components/Iconify';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'module_name', label: 'Module Name', alignRight: false },
  { id: 'parent_program', label: 'Parent Program', alignRight: false },
  { id: 'level', label: 'Level', alignRight: false },
  { id: 'semester', label: 'Semester ', alignRight: false },
  { id: 'facilitator', label: 'Facilitator', alignRight: false },
  { id: 'action', label: '', alignRight: false },
];

// ----------------------------------------------------------------------

export default function StudentsResultsList() {
  const theme = useTheme();
  const { themeStretch } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const [moduleList, setModuleList] = useState([]);
  const [page, setPage] = useState(0);
  const order = 'desc';
  const orderBy = 'created';
  const [selected, setSelected] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [filter, setFilter] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [value, setValue] = useState('0');
  const [idToDelete, setIdToDelete] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [semester, setSemester] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [isDeleteModalOpen_, setIsDeleteModalOpen_] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const { record } = useSelector((state) => state.user);

  const getSemesterName = (id) => {
    const sem = semester?.find((s) => s.id === id);
    return sem?.name;
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [semRes, coursesRes, modulesRes] = await Promise.all([
          axios.get('v1/semesters'),
          axios.get('/v1/courses'),
          axios.get('v1/modules', {
            params: {
              page: page + 1,
              perPage: rowsPerPage,
              course: filter || undefined,
              search: filterName || undefined,
              sortBy: 'created',
              sortDir: 'desc',
            },
          }),
        ]);

        setSemester(semRes.data.data || semRes.data || []);
        setCourseList(coursesRes.data.courses || []);
        setModuleList(modulesRes.data.data || []);
        setTotalRecords(modulesRes.data.totalItems || modulesRes.data.data?.length || 0);
      } catch (err) {
        setError('Failed to load modules');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter, filterName, page, rowsPerPage]);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (filterName) => {
    setFilterName(filterName);
    setPage(0);
  };

  const emptyRows = Math.max(0, rowsPerPage - moduleList.length);

  const filteredModules = moduleList;

  const isNotFound = !filteredModules.length && Boolean(filterName);

  const handleModuleDete = (moduleId) => {
    axios
      .delete(`v1/modules/${moduleId}`)
      .then(() => {
        setSelected([]);
        setModuleList(moduleList.filter((user) => user.id !== moduleId));
        setIsDeleteModalOpen(false);
        enqueueSnackbar('Module Deleted', { variant: 'success' });
      })
      .catch((error) => {
        console.error(error);
        enqueueSnackbar('Error Deleting Module', { variant: 'error' });
      });
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = moduleList.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleSelect = (id) => {
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

  // NOTE: NEED AXIOS CALL TO DELETE MULTIPLE COURSES
  const handleDeleteMulti = () => {
    // Keep users NOT in the selected array (those we don't want to delete)
    const remainingModules = moduleList.filter((row) => !selected.includes(row.id));

    // Track successful deletions
    let successCount = 0;

    // Delete each selected user from the backend
    Promise.all(
      selected.map(async (row) => {
        try {
          await axios.delete(`v1/modules/${row}`);
          successCount += 1;
        } catch (error) {
          enqueueSnackbar('Unable to delete course, try again later', { variant: 'error' });
          console.error(error);
        }
      })
    ).then(() => {
      // Show success alert after all deletion attempts complete
      if (successCount > 0) {
        enqueueSnackbar(`Successfully deleted ${successCount} module${successCount > 1 ? 's' : ''}`, {
          variant: 'success',
        });
      }
    });

    // Update state after deletion
    setModuleList(remainingModules);
    setSelected([]);
    setIsDeleteModalOpen_(false);
  };

  return (
    <Page title="Modules: List">
      <Dialog fullWidth maxWidth="sm" open={isDeleteModalOpen}>
        <DialogTitle>Delete Module?</DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              This action cannot be undone. Are you sure you want to delete the selected module?
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
                setIsDeleteModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <LoadingButton
              color="error"
              variant="contained"
              onClick={async () => {
                handleModuleDete(idToDelete);
              }}
            >
              Delete
            </LoadingButton>
          </>
        </DialogActions>
      </Dialog>

      <Dialog fullWidth maxWidth="sm" open={isDeleteModalOpen_}>
        <DialogTitle>Delete Module?</DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              This action cannot be undone. Are you sure you want to delete the selected module?
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
                setIsDeleteModalOpen_(false);
              }}
            >
              Cancel
            </Button>
            <LoadingButton
              color="error"
              variant="contained"
              onClick={async () => {
                handleDeleteMulti();
              }}
            >
              Delete
            </LoadingButton>
          </>
        </DialogActions>
      </Dialog>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="View all Modules Here"
          links={[
            { name: 'Manage', href: PATH_DASHBOARD.superAdmin.moduleList },
            { name: 'Modules' },
            { name: 'List' },
          ]}
          action={
            <div>
              <Button
                style={{ marginRight: 10 }}
                variant="contained"
                component={RouterLink}
                to={record.role === 'hod' ? PATH_DASHBOARD.hod.moduleCreate : PATH_DASHBOARD.superAdmin.moduleCreate}
                startIcon={<Iconify icon={'eva:plus-fill'} />}
              >
                New Module
              </Button>
              {selected.length !== 0 && (
                <Button
                  style={{ backgroundColor: '#e34563' }}
                  variant="contained"
                  onClick={() => setIsDeleteModalOpen_(true)}
                  startIcon={<Iconify icon={'eva:trash-fill'} />}
                >
                  Delete
                </Button>
              )}
            </div>
          }
        />

        <Card>
          <TabContext value={value}>
            <Box sx={{ px: 3, bgcolor: 'background.neutral' }}>
              <TabList onChange={(e, value) => setValue(value)}>
                <Tab disableRipple value="0" label="All" />
              </TabList>
            </Box>
            <Divider />
                 <TabPanel value="0" key="0">
               {loading && <LinearProgress sx={{ mb: 2 }} />}
               {error && (
                 <Alert severity="error" sx={{ mb: 2 }}>
                   {error}
                 </Alert>
               )}
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
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      borderRadius: '8px',
                      background: 'transparent',
                      width: '100%',
                      outline: 'none',
                      borderColor: `${theme.palette.grey[500_32]} !important`,
                    }}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="">All Courses</option>
                    {courseList?.map((course) => (
                      <option value={course.id} key={course.id}>
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
                        rowCount={moduleList.length}
                        numSelected={selected.length}
                        // onRequestSort={handleRequestSort}
                        onSelectAllClick={handleSelectAllClick}
                      />

                      <TableBody>
                        {filteredModules.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
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
                              <TableCell align="left">{row?.name || 'No Module Name'}</TableCell>
                              <TableCell align="left">
                                {row?.expand?.parent_course?.course_name || 'No Parent Program'}
                              </TableCell>
                              <TableCell align="left">{row?.year_level || 'No Level'}</TableCell>
                              <TableCell align="left">{getSemesterName(row.semester) || 'No Semester'}</TableCell>
                              <TableCell align="left">{row.facilitator || 'No Facilitator'} </TableCell>
                              <TableCell align="right">
                                <StudentMoreMenu
                                  onDelete={() => {
                                    setIsDeleteModalOpen(true);
                                    setIdToDelete(id);
                                  }}
                                  id={id}
                                  userName={id}
                                  fromRoute="modules"
                                />
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
