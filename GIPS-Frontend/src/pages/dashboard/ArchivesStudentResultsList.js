import * as Yup from 'yup';
import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import moment from 'moment';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Card,
  Table,
  Tab,
  Box,
  Divider,
  Button,
  Checkbox,
  Stack,
  TableRow,
  TableBody,
  TableCell,
  DialogActions,
  DialogTitle,
  Container,
  InputBase,
  TableContainer,
  TablePagination,
  CircularProgress,
  Alert,
} from '@mui/material';
import { TabContext, LoadingButton, TabList, TabPanel } from '@mui/lab';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import axios from '../../utils/axios';
import { FormProvider, RHFTextField } from '../../components/hook-form';
import DropFileInput from '../../components/upload/UploadFileD';
import useSettings from '../../hooks/useSettings';

import Page from '../../components/Page';
import Iconify from '../../components/Iconify';
import Scrollbar from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { PATH_DASHBOARD } from '../../routes/paths';
import { UserListHead, ArchivesMoreMenu } from '../../sections/@dashboard/admissions/list';
import { DialogAnimate } from '../../components/animate';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'FileName', alignRight: false },
  { id: 'desc', label: 'Description', alignRight: false },
  { id: 'year', label: 'Academic Year', alignRight: false },
  { id: 'sem', label: 'Semester', alignRight: false },
  { id: 'date', label: 'Date', alignRight: false },
  { id: '' },
];

// ----------------------------------------------------------------------

export default function ArchivesStudentResultsList() {
  const theme = useTheme();
  const { themeStretch } = useSettings();
  const [userList, setUserList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [value, setValue] = useState('0');
  const [open, setOpenModal] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const EventSchema = Yup.object().shape({
    title: Yup.string().max(255).required('Title is required'),
    description: Yup.string().max(5000),
  });
  const methods = useForm({
    resolver: yupResolver(EventSchema),
    // defaultValues: getInitialValues(event,),
  });
  const {
    reset,
    watch,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await axios.get('/v1/archives', {
          params: {
            page: page + 1,
            perPage: rowsPerPage,
            search: filterName || undefined,
            semester: semesterFilter || undefined,
            sortBy: 'created',
            sortDir: 'desc',
          },
        });

        setUserList(res.data.data || []);
        setTotalRecords(res.data.totalRecords || 0);
      } catch (err) {
        console.error('Error fetching archives:', err);
        setError('Failed to load archives');
        setUserList([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [filterName, open, page, rowsPerPage, semesterFilter]);


  const handleAddEvent = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleFileChange = (event) => {
    setFileToUpload(event.target.files?.[0] || null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const values = watch();

    if (!fileToUpload) {
      enqueueSnackbar('Please select a file to upload', { variant: 'warning' });
      return;
    }

    const formData = new FormData();

    formData.append('filename', values.filename);
    formData.append('description', values.description || '');
    formData.append('year', values.academic_year || '');
    formData.append('semester', values.semester || '');
    formData.append('date', new Date().toISOString());
    formData.append('file', fileToUpload);

    try {
      await axios.post('/v1/archives', formData);
      reset();
      setFileToUpload(null);
      setOpenModal(false);
      enqueueSnackbar('File has been uploaded successfully', { variant: 'success' });
    } catch (error) {
      console.error('File upload failed', error);
      enqueueSnackbar('File upload failed. Please try again.', { variant: 'error' });
    }
  };


  const handleSelectAllClick = (checked) => {
    if (checked) {
      const newSelecteds = userList.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (id) => {
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

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (nextValue) => {
    setFilterName(nextValue);
    setPage(0);
  };



  const emptyRows = Math.max(0, rowsPerPage - userList.length);
  const filteredUsers = userList;
  const isNotFound = !filteredUsers.length && Boolean(filterName);

  
  return (
    <Page title="Students: List">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="View all Archived Results Here"
          links={[{ name: 'Results Manager', href: PATH_DASHBOARD.admissions.studentslist }, { name: 'Archives' }]}
          action={
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(1, 1fr)' },
              }}
            >
              <Button variant="contained" startIcon={<Iconify icon={'eva:plus-fill'} />} onClick={handleAddEvent}>
                Upload File
              </Button>
            </Box>
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
              <Box sx={{ px: 3, bgcolor: 'background.neutral' }}>
                <TabList onChange={(e, nextValue) => setValue(nextValue)}>
                  <Tab disableRipple value="0" label="All" />
                </TabList>
              </Box>
              <Divider />
              <TabPanel value="0" key="0">

              {' '}
              <Box sx={{ p: 3 }}>
                <div
                  key={43}
                  style={{
                    display: 'grid',
                     gridTemplateColumns: '1.5fr 3fr ', // semester + search

                    gap: '10px', // Space between grid items
                    marginBottom: '20px',
                    alignItems: 'center', // Align items vertically
                  }}
                >
                   <select
                     key={2}
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
                     value={semesterFilter}
                     onChange={(e) => {
                       setSemesterFilter(e.target.value);
                       setPage(0);
                     }}
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
                    key={5468}
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
                          order="asc"
                          orderBy="filename"
                          headLabel={TABLE_HEAD}
                          rowCount={userList.length}
                          numSelected={selected.length}
                          onSelectAllClick={handleSelectAllClick}
                        />


                      <TableBody>
                        {filteredUsers.map((row) => {
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
                                <Checkbox checked={isItemSelected} onClick={() => handleClick(id)} />
                              </TableCell>

                              <TableCell sx={{ display: 'flex', alignItems: 'center' }}>{row.filename}</TableCell>

                              <TableCell align="left">{row.description}</TableCell>
                              <TableCell align="left">{row.year}</TableCell>
                              <TableCell align="left">{row.semester}</TableCell>
                              <TableCell align="left">
                                {' '}
                                {moment(row.date).format('MMMM Do, YYYY, h:mm:ss A')}{' '}
                              </TableCell>
                              <TableCell align="right">
                                 <ArchivesMoreMenu id={row.id} />

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
                  rowsPerPageOptions={[5, 10, 25, 100]}
                  component="div"
                  count={totalRecords}
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

        <DialogAnimate open={open} onClose={handleCloseModal}>
          <DialogTitle>Batch Upload Students Archives</DialogTitle>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Stack spacing={3} sx={{ p: 3 }}>
              <DropFileInput onChange={handleFileChange} />

              {/* <FileUploadDropzone onChange={handleFileChange} /> */}
              <RHFTextField name="filename" label="File Name" />
              <RHFTextField name="description" label="Description" multiline rows={3} />
              <RHFTextField name="academic_year" label="Academic Year" />
              <RHFTextField name="semester" label="Semester" />
            </Stack>

            <DialogActions>
              <Box sx={{ flexGrow: 1 }} />
              <Button variant="outlined" color="inherit" onClick={handleCloseModal}>
                Cancel
              </Button>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Loading...">
                Finish
              </LoadingButton>
            </DialogActions>
          </FormProvider>
        </DialogAnimate>
      </Container>
    </Page>
  );
}
