import { useState, useEffect } from 'react';
// @mui
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import {
  Card,
  Table,
  Avatar,
  Tab,
  Box,
  Button,
  Stack,
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
  CircularProgress,
  Alert,
} from '@mui/material';

import { TabContext, TabList, TabPanel } from '@mui/lab';
// routes
import { useSnackbar } from 'notistack';
import { useNavigate, useParams } from 'react-router-dom';
import Iconify from '../../components/Iconify';

import { addResults } from '../../redux/slices/studentResults';
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import Label from '../../components/Label';

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
import { UserListHead, UserListToolbar, StudentListMenu } from '../../sections/@dashboard/admissions/list';
import { tabColor } from '../../utils/setProgressionStatusTabColor';

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

const extractYearLevel = (value) => {
  if (value === undefined || value === null) {
    return '';
  }
  const segments = value.toString().match(/\d+/g);
  if (segments && segments.length > 0) {
    return segments[segments.length - 1];
  }
  return value.toString().trim();
};

const buildResultKey = (record) =>
  JSON.stringify({
    studentId: record.studentId?.toString(),
    moduleId: record.moduleId?.toString(),
    facultyId: record.facultyId?.toString(),
    courseId: record.courseId?.toString(),
    yearOfStudy: extractYearLevel(record.yearOfStudy),
    semester: record.semester?.toString(),
  });

// ----------------------------------------------------------------------

export default function StudentsResultsList() {
  const theme = useTheme();
  const { record, isAuthenticated, isInitialized } = useSelector((state) => {
    return state.user;
  });
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const moduleId = id;

  const { enqueueSnackbar } = useSnackbar();
  const [resultsList, setResultsList] = useState([]);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [filter, setFilter] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [value, setValue] = useState('0');
  const [_searchQuery, setQuery] = useState('');
  const [optionList, setOptions] = useState([]);
  const [module, setModule] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [studentData, setStudentData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [semesterId, setSemesterId] = useState('');


  // useEffect(() => {
  //   const fetch = async () => {
  //     setLoading(true);
  //     // get the currently logged in lecture
  //    let currentLecturer = await axios.get(`v1/lecturers/user/${record.id}`);

    
  //     currentLecturer = currentLecturer.data.data;

  //     const module_ = await axios.get(`/v1/modules/${id}`);

  //     const modulesResponse = module_.data;

  //     setModule(modulesResponse);
  //     console.log({ modulesResponse });
  //     const moduleYearLevel = extractYearLevel(modulesResponse?.year_level);

  //     //  get all students doing that course
  //     await axios.get(`/v1/students/all`).then(async (response) => {
  //       console.log({ response });
  //       const studentsRaw = response.data.data || [];
  //       const filteredStudents = studentsRaw.filter((student) => {
  //         if (String(student.course_id) !== String(modulesResponse.parent_course)) {
  //           return false;
  //         }
  //         if (!moduleYearLevel) {
  //           return true;
  //         }
  //         return extractYearLevel(student.year_of_study) === moduleYearLevel;
  //       });

  //       setStudentData(filteredStudents);
  //       console.log({ filteredStudents });

  //       // Loop through the studentsData array and create the required objects
  //       const initialResults = filteredStudents.map((student) => {
  //         const studentYearLevel = extractYearLevel(student.year_of_study);
  //         return {
  //           studentId: student.id, // Assuming student object has RELATION_RECORD_ID
  //           national_id: student.national_id,
  //           firstname: student.firstname,
  //           lastname: student.lastname,
  //           year_of_study: student.year_of_study,
  //           relationship: student.relationship,
  //           semesterId: student?.expand?.semester_id?.id,
  //           phoneNumber: student.phoneNumber,
  //           next_of_kin_name: student.next_of_kin_name,
  //           next_of_kin_number: student.next_of_kin_number,
  //           sponsor: student.sponsor,
  //           courseName: student?.prog_name,
  //           moduleId: modulesResponse.id, // Adjust based on actual field names
  //           facultyId: modulesResponse.faculty, // Adjust based on actual field names
  //           courseId: modulesResponse.parent_course, // Adjust based on actual field names
  //           yearOfStudy: studentYearLevel, // Default value if not present
  //           semester: student?.expand?.semester_id?.study_semester, // Default value if not present
  //           assignmentMark: student.assignmentMark || 0, // Default value if not present
  //           midSemesterMark: student.midSemesterMark || 0, // Default value if not present
  //           supplementaryMark: student.supplementaryMark || 0, // Default value if not present
  //           examMark: student.examMark || 0, // Default value if not present
  //           moduleMark: student.moduleMark || 0, // Default value if not present
  //           nonCreditAssessments: student.nonCreditAssessments || 0, // Default value if not present
  //           lecturerId: currentLecturer?.id || '', // Adjust based on actual field names
  //           status: student?.status || 'pending', // Default value if not present
  //           progressionStatus: student?.progressionStatus || 'pending', // Default value if not present
  //           reviewMessage: student.reviewMessage || 'N/A', // Default value if not present
  //         };
  //       });

  //       const apiResponseResults = await axios.get('/v1/results');

  //       const resultsResponse = apiResponseResults.data.data.filter((result) => result.moduleId === id);
  //       const filteredResultsResponse = resultsResponse.filter((result) => {
  //         if (!moduleYearLevel) {
  //           return true;
  //         }
  //         return extractYearLevel(result.yearOfStudy) === moduleYearLevel;
  //       });

  //       // Create a set for fast lookup
  //       const resultsResponseSet = new Set(filteredResultsResponse.map(buildResultKey));

  //       // Filter initialsResults based on presence in resultsResponseSet
  //       const filteredInitialsResults = initialResults.filter(
  //         (initial) => !resultsResponseSet.has(buildResultKey(initial))
  //       );

  //       const combinedResults = [...filteredInitialsResults, ...filteredResultsResponse];

  //       setResultsList(combinedResults);

  //       dispatch(addResults(combinedResults));
  //       setLoading(false);
  //     });
  //   };
  //   fetch();
  // }, []);


  useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);

      setError('');

      // --- 1. GET CURRENT LECTURER ---
      const lecturerRes = await axios.get(`/v1/lecturers/user/${record.id}`);
      const currentLecturer = lecturerRes.data.data;

      // --- 2. GET MODULE INFO ---
      const moduleRes = await axios.get(`/v1/modules/${id}`);
      const moduleData = moduleRes.data;
      setModule(moduleData);

      // Extract module's academic year, e.g. "Year 2" -> 2
      const moduleYearLevel = extractYearLevel(moduleData?.year_level);


      // --- 3. GET MODULES TO FIND OTHERS WITH SAME NAME ---
      const allModulesRes = await axios.get(`/v1/modules`, {
        params: { perPage: 100, search: moduleData.name },
      });
      const allModules = allModulesRes.data.data || [];



      // All modules with identical name → same course family
      const matchingModules = allModules.filter(
        (m) => m.name === moduleData.name
      );

      // Extract parent_course IDs
      const parentCourseIds = matchingModules
        .map((m) => m.parent_course?.toString())
        .filter(Boolean);


      // --- 4. GET STUDENTS (SERVER-FILTERED) ---
      const studentsRes = await axios.get(`/v1/students`, {
        params: {
          page: 1,
          limit: 500,
          courseIds: parentCourseIds.join(','),
          yearLevel: moduleYearLevel || undefined,
        },
      });
      const studentsRaw = studentsRes.data.data || [];
      setSemesterId(studentsRaw[0]?.expand?.semester_id?.id);

      // --- 5. FILTER STUDENTS BY COURSE + YEAR ---
      const filteredStudents = studentsRaw.filter((student) => {
        const matchesCourse = parentCourseIds.includes(
          String(student.course_id)
        );

        if (!matchesCourse) return false;

        // ✅ YEAR FILTERING ENABLED
        const studentYear = extractYearLevel(student.year_of_study);
        if (moduleYearLevel && studentYear !== moduleYearLevel) {
          return false;
        }

        return true;
      });


      // --- 6. MAP STUDENTS TO INITIAL RESULTS OBJECT ---
      const initialResults = filteredStudents.map((student) => {
        const studentYearLevel = extractYearLevel(student.year_of_study);

        return {
          studentId: student.id,
          national_id: student.national_id,
          firstname: student.firstname,
          lastname: student.lastname,
          year_of_study: student.year_of_study,
          relationship: student.relationship,
          semesterId: student?.expand?.semester_id?.id,
          phoneNumber: student.phoneNumber,
          next_of_kin_name: student.next_of_kin_name,
          next_of_kin_number: student.next_of_kin_number,
          sponsor: student.sponsor,
          courseName: student.prog_name,
          moduleId: moduleData.id,
          facultyId: moduleData.faculty,
          courseId: moduleData.parent_course,
          yearOfStudy: studentYearLevel,
          semester: student?.expand?.semester_id?.study_semester,
          studentNo:student?.studentNo || '',
          // Marks
          assignmentMark: student.assignmentMark || 0,
          midSemesterMark: student.midSemesterMark || 0,
          supplementaryMark: student.supplementaryMark || 0,
          examMark: student.examMark || 0,
          moduleMark: student.moduleMark || 0,
          nonCreditAssessments: student.nonCreditAssessments || 0,

          lecturerId: currentLecturer?.id || "",
           status: student?.status || "pending",

           reviewMessage: student.reviewMessage || "N/A",

        };
      });


      // Stable key function → ensures no duplicates
      const buildKey = (r) => `${r.studentId}-${r.moduleId}`;


      // --- 7. GET ALL EXISTING RESULTS ---
       const resultsApi = await axios.get("/v1/results", { params: { moduleId: id, limit: 500 } });
       const allResults = resultsApi.data.data || [];


      // All results for this module only
      const resultsForThisModule = allResults.filter(
        (r) => String(r.moduleId) === String(id)
      );

      // Apply year filter to results as well
      const filteredResultsByYear = resultsForThisModule.filter((result) => {
        if (!moduleYearLevel) return true;
        return extractYearLevel(result.yearOfStudy) === moduleYearLevel;
      });


      // --- 8. CREATE SET OF EXISTING RESULT KEYS ---
      const existingKeys = new Set(filteredResultsByYear.map(buildKey));


      // --- 9. ONLY KEEP STUDENTS WITHOUT ANY RESULT YET ---
      const newInitialResults = initialResults.filter(
        (initial) => !existingKeys.has(buildKey(initial))
      );


      // --- 10. MERGE INITIAL + EXISTING RESULTS ---
      const combinedResults = [...newInitialResults, ...filteredResultsByYear];


      // --- 11. STORE IN STATE ---
      setResultsList(combinedResults);
      dispatch(addResults(combinedResults));
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);


  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (filterName) => {
    setFilterName(filterName);
    setPage(0);
  };

  const submitResults = async () => {
    const resultsIds = resultsList.map((result) => {
      return result.id;
    });

    const resultIdsWithoutUndefined = resultsIds.filter((result) => result !== undefined);

    const { facultyId, courseId, lecturerId, yearOfStudy,semester } = resultsList[0];

    const data = {
      lecturerId,
      facultyId,
      courseId,
      year_level: yearOfStudy,
      semesterId:resultsList[0].expand?.studentId?.semester_id || semesterId,
      results: resultIdsWithoutUndefined,
      submissionDate: new Date(),
      status: 'pending',
      reviewMessage: '',
      moduleId,
    };

    await axios.post(`/v1/results/batch`, data).then((response) => {
      enqueueSnackbar('Results submitted successfully!');
      navigate(PATH_DASHBOARD.admissions.moduleSelectionResults);
    });
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - resultsList.length) : 0;

  const filteredUsers = applySortFilter(resultsList, getComparator(order, orderBy), searchTerm);

  const isNotFound = !filteredUsers.length && Boolean(searchTerm);

  return (
    <Page title="Students Results: List">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="View Students Results Here"
          links={[
            { name: 'Student List', href: PATH_DASHBOARD.admissions.studentslist }, // TODO: Change this to courses list
            { name: 'Results Manager' },
            { name: 'Module Name' },
            { name: 'List' },
          ]}
        />
        <Card>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 350 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 3 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : (
            <TabContext value={value}>
              <Box sx={{ px: 3, bgcolor: 'background.neutral' }}>
                <TabList onChange={(e, value) => setValue(value)}>
                  <Tab disableRipple value="0" label="All" />
                </TabList>
              </Box>
              <Divider />
              <TabPanel value="0" key="0">
                <Box sx={{ p: 3 }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1.5fr 3fr ', // Adjust column sizes
                      gap: '10px', // Space between grid items
                      marginBottom: '20px',
                      alignItems: 'center', // Align items vertically
                    }}
                  >
                    {/* First select (takes more space) */}
                    <input
                      key={1}
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
                      disabled
                      value={module?.name || ''}
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
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                        />
                        <TableBody>
                          {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                            const { id, status, progressionStatus } = row;
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
                                <TableCell align="left">{row?.studentNo || row.expand?.studentId?.studentNo || '-'}</TableCell>
                                <TableCell align="left">
                                  {row.expand?.studentId.firstname || row.firstname}{' '}
                                  {row.expand?.studentId.lastname || row.lastname}
                                </TableCell>
                                <TableCell align="left">{row.assignmentMark}</TableCell>
                                <TableCell align="left">{row.midSemesterMark}</TableCell>
                                <TableCell align="left">{row.supplementaryMark}</TableCell>
                                <TableCell align="left">{row.examMark}</TableCell>
                                <TableCell align="left">{Math.round(row.moduleMark)}</TableCell>
                                <TableCell align="left">
                                  <Label
                                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                    color={tabColor(progressionStatus)}
                                  >
                                    {progressionStatus?.charAt(0).toUpperCase() + progressionStatus?.slice(1) || 'Pending'}
                                  </Label>
                                </TableCell>
                                <TableCell align="right">
                                  <StudentListMenu id={row.studentId} moduleId={moduleId} />
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
                    count={resultsList.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, page) => setPage(page)}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </Box>
              </TabPanel>
            </TabContext>
          )}
        </Card>

        <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
          <Button
            onClick={() => {
              submitResults();
            }}
            variant="contained"
            size="large"
            disabled={loading}
          >
            Submit Results
          </Button>
        </Stack>
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

function applySortFilter(array, comparator, search) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  let filtered = array;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (result) =>
        (result?.studentId || '').toLowerCase().includes(q) ||
        (result.expand?.studentId?.id || '').toLowerCase().includes(q) ||
        (result.firstname || '').toLowerCase().includes(q) ||
        (result.expand?.studentId?.firstname || '').toLowerCase().includes(q) ||
        (result.lastname || '').toLowerCase().includes(q) ||
        (result.expand?.studentId?.lastname || '').toLowerCase().includes(q) ||
        (result.national_id || '').toLowerCase().includes(q) ||
        (result.expand?.studentId?.national_id || '').toLowerCase().includes(q) ||
        (result.prog_name || '').toLowerCase().includes(q) ||
        (result.expand?.courseId?.course_name || '').toLowerCase().includes(q)
    );
  }
  return stabilizedThis.filter(([el]) => filtered.includes(el)).map((el) => el[0]);
}







// import { useState, useEffect } from 'react';
// // @mui
// import { useDispatch, useSelector } from 'react-redux';
// import { useTheme } from '@mui/material/styles';
// import {
//   Card,
//   Table,
//   Avatar,
//   Tab,
//   Box,
//   Button,
//   Stack,
//   Divider,
//   Checkbox,
//   TableRow,
//   TableBody,
//   TableCell,
//   Container,
//   Typography,
//   TableContainer,
//   InputBase,
//   TablePagination,
// } from '@mui/material';

// import { TabContext, TabList, TabPanel } from '@mui/lab';
// // routes
// import { useSnackbar } from 'notistack';
// import { useNavigate, useParams } from 'react-router-dom';
// import Iconify from '../../components/Iconify';

// import { addResults } from '../../redux/slices/studentResults';
// import { PATH_DASHBOARD } from '../../routes/paths';
// // hooks
// import Label from '../../components/Label';

// import axios from '../../utils/axios';
// import useSettings from '../../hooks/useSettings';
// // _mock_
// // import { _userList } from '../../_mock';
// // components
// import Page from '../../components/Page';
// import Scrollbar from '../../components/Scrollbar';
// import SearchNotFound from '../../components/SearchNotFound';
// import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// // sections
// import { UserListHead, UserListToolbar, StudentListMenu } from '../../sections/@dashboard/admissions/list';
// import { tabColor } from '../../utils/setProgressionStatusTabColor';

// // ----------------------------------------------------------------------

// const TABLE_HEAD = [
//   { id: 'id', label: 'Student ID', alignRight: false },
//   { id: 'name', label: 'Student Name', alignRight: false },
//   { id: 'assessment', label: 'Assessment(%)', alignRight: false },
//   { id: 'duration', label: 'Course Work (%)', alignRight: false },
//   { id: 'supplement', label: 'Supplement Mark', alignRight: false },
//   { id: 'examination', label: 'Examination Mark', alignRight: false },
//   { id: 'module', label: 'Module Mark', alignRight: false },
//   { id: 'progression', label: 'Progression Status', alignRight: false },
//   { id: 'action', label: '', alignRight: false },
// ];

// const extractYearLevel = (value) => {
//   if (value === undefined || value === null) {
//     return '';
//   }
//   const segments = value.toString().match(/\d+/g);
//   if (segments && segments.length > 0) {
//     return segments[segments.length - 1];
//   }
//   return value.toString().trim();
// };

// const buildResultKey = (record) =>
//   JSON.stringify({
//     studentId: record.studentId?.toString(),
//     moduleId: record.moduleId?.toString(),
//     facultyId: record.facultyId?.toString(),
//     courseId: record.courseId?.toString(),
//     yearOfStudy: extractYearLevel(record.yearOfStudy),
//     semester: record.semester?.toString(),
//   });

// // ----------------------------------------------------------------------

// export default function StudentsResultsList() {
//   const theme = useTheme();
//   const { record, isAuthenticated, isInitialized } = useSelector((state) => {
//     return state.user;
//   });
//   const dispatch = useDispatch();
//   const { themeStretch } = useSettings();
//   const navigate = useNavigate();
//   const params = useParams();
//   const { id } = params;
//   const moduleId = id;

//   const { enqueueSnackbar } = useSnackbar();
//   const [resultsList, setResultsList] = useState([]);
//   const [page, setPage] = useState(0);
//   const [order, setOrder] = useState('asc');
//   const [selected, setSelected] = useState([]);
//   const [orderBy, setOrderBy] = useState('name');
//   const [filterName, setFilterName] = useState('');
//   const [filter, setFilter] = useState('');
//   const [rowsPerPage, setRowsPerPage] = useState(5);
//   const [value, setValue] = useState('0');
//   const [_searchQuery, setQuery] = useState('');
//   const [optionList, setOptions] = useState([]);
//   const [module, setModule] = useState({});
//   const [inputValue, setInputValue] = useState('');
//   const [studentData, setStudentData] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     const fetch = async () => {
//       // get the currently logged in lecture
//      let currentLecturer = await axios.get(`v1/lecturers/user/${record.id}`);

    
//       currentLecturer = currentLecturer.data.data;

//       const module_ = await axios.get(`/v1/modules/${id}`);

//       const modulesResponse = module_.data;

//       setModule(modulesResponse);
//       console.log({ modulesResponse });
//       const moduleYearLevel = extractYearLevel(modulesResponse?.year_level);

//       //  get all students doing that course
//       await axios.get(`/v1/students/all`).then(async (response) => {
//         console.log({ response });
//         const studentsRaw = response.data.data || [];
//         const filteredStudents = studentsRaw.filter((student) => {
//           if (String(student.course_id) !== String(modulesResponse.parent_course)) {
//             return false;
//           }
//           if (!moduleYearLevel) {
//             return true;
//           }
//           return extractYearLevel(student.year_of_study) === moduleYearLevel;
//         });

//         setStudentData(filteredStudents);
//         console.log({ filteredStudents });

//         // Loop through the studentsData array and create the required objects
//         const initialResults = filteredStudents.map((student) => {
//           const studentYearLevel = extractYearLevel(student.year_of_study);
//           return {
//             studentId: student.id, // Assuming student object has RELATION_RECORD_ID
//             national_id: student.national_id,
//             firstname: student.firstname,
//             lastname: student.lastname,
//             year_of_study: student.year_of_study,
//             relationship: student.relationship,
//             semesterId: student?.expand?.semester_id?.id,
//             phoneNumber: student.phoneNumber,
//             next_of_kin_name: student.next_of_kin_name,
//             next_of_kin_number: student.next_of_kin_number,
//             sponsor: student.sponsor,
//             courseName: student?.prog_name,
//             moduleId: modulesResponse.id, // Adjust based on actual field names
//             facultyId: modulesResponse.faculty, // Adjust based on actual field names
//             courseId: modulesResponse.parent_course, // Adjust based on actual field names
//             yearOfStudy: studentYearLevel, // Default value if not present
//             semester: student?.expand?.semester_id?.study_semester, // Default value if not present
//             assignmentMark: student.assignmentMark || 0, // Default value if not present
//             midSemesterMark: student.midSemesterMark || 0, // Default value if not present
//             supplementaryMark: student.supplementaryMark || 0, // Default value if not present
//             examMark: student.examMark || 0, // Default value if not present
//             moduleMark: student.moduleMark || 0, // Default value if not present
//             nonCreditAssessments: student.nonCreditAssessments || 0, // Default value if not present
//             lecturerId: currentLecturer?.id || '', // Adjust based on actual field names
//             status: student?.status || 'pending', // Default value if not present
//             progressionStatus: student?.progressionStatus || 'pending', // Default value if not present
//             reviewMessage: student.reviewMessage || 'N/A', // Default value if not present
//           };
//         });

//         const apiResponseResults = await axios.get('/v1/results');

//         const resultsResponse = apiResponseResults.data.data.filter((result) => result.moduleId === id);
//         const filteredResultsResponse = resultsResponse.filter((result) => {
//           if (!moduleYearLevel) {
//             return true;
//           }
//           return extractYearLevel(result.yearOfStudy) === moduleYearLevel;
//         });

//         // Create a set for fast lookup
//         const resultsResponseSet = new Set(filteredResultsResponse.map(buildResultKey));

//         // Filter initialsResults based on presence in resultsResponseSet
//         const filteredInitialsResults = initialResults.filter(
//           (initial) => !resultsResponseSet.has(buildResultKey(initial))
//         );

//         const combinedResults = [...filteredInitialsResults, ...filteredResultsResponse];

//         setResultsList(combinedResults);

//         dispatch(addResults(combinedResults));
//       });
//     };
//     fetch();
//   }, []);

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const handleFilterByName = (filterName) => {
//     setFilterName(filterName);
//     setPage(0);
//   };

//   const submitResults = async () => {
//     const resultsIds = resultsList.map((result) => {
//       return result.id;
//     });

//     const resultIdsWithoutUndefined = resultsIds.filter((result) => result !== undefined);

//     const { facultyId, courseId, lecturerId, yearOfStudy } = resultsList[0];

//     const data = {
//       lecturerId,
//       facultyId,
//       courseId,
//       year_level: yearOfStudy,
//       semesterId: studentData[0].semester_id,
//       results: resultIdsWithoutUndefined,
//       submissionDate: new Date(),
//       status: 'pending',
//       reviewMessage: '',
//       moduleId,
//     };

//     await axios.post(`/v1/results/batch`, data).then((response) => {
//       enqueueSnackbar('Results submitted successfully!');
//       navigate(PATH_DASHBOARD.admissions.moduleSelectionResults);
//     });
//   };

//   const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - resultsList.length) : 0;

//   const filteredUsers = applySortFilter(resultsList, getComparator(order, orderBy), searchTerm);

//   const isNotFound = !filteredUsers.length && Boolean(searchTerm);

//   return (
//     <Page title="Students Results: List">
//       <Container maxWidth={themeStretch ? false : 'lg'}>
//         <HeaderBreadcrumbs
//           heading="View Students Results Here"
//           links={[
//             { name: 'Student List', href: PATH_DASHBOARD.admissions.studentslist }, // TODO: Change this to courses list
//             { name: 'Results Manager' },
//             { name: 'Module Name' },
//             { name: 'List' },
//           ]}
//         />

//         <Card>
//           <TabContext value={value}>
//             <Box sx={{ px: 3, bgcolor: 'background.neutral' }}>
//               <TabList onChange={(e, value) => setValue(value)}>
//                 <Tab disableRipple value="0" label="All" />
//               </TabList>
//             </Box>
//             <Divider />
//             <TabPanel value="0" key="0">
//               {' '}
//               <Box sx={{ p: 3 }}>
//                 <div
//                   style={{
//                     display: 'grid',
//                     gridTemplateColumns: '2fr 1.5fr 3fr ', // Adjust column sizes
//                     gap: '10px', // Space between grid items
//                     marginBottom: '20px',
//                     alignItems: 'center', // Align items vertically
//                   }}
//                 >
//                   {/* First select (takes more space) */}
//                   <input
//                     key={1}
//                     style={{
//                       color: '#919eab',
//                       fontStyle: 'semibold',
//                       fontSize: '14px',
//                       border: '1px solid #dce0e4',
//                       borderWidth: `1px !important`,
//                       height: '54px',
//                       paddingLeft: '12px',
//                       paddingRight: '5px',
//                       borderRadius: '8px',
//                       width: '100%', // Takes full width of the grid cell
//                       outline: 'none',
//                       background: 'transparent',
//                       borderColor: `${theme.palette.grey[500_32]} !important`,
//                     }}
//                     disabled
//                     value={module?.name || ''}
//                   />

//                   <Box
//                     sx={{
//                       display: 'flex',
//                       alignItems: 'center',
//                       borderRadius: '8px',
//                       border: '1px solid #dce0e4',
//                       width: '100%',
//                     }}
//                   >
//                     <Iconify
//                       icon={'eva:search-fill'}
//                       sx={{ color: 'text.disabled', width: 20, height: 20, marginLeft: '10px' }}
//                     />

//                     <InputBase
//                       key={2}
//                       placeholder="Search..." // You can add a placeholder if needed
//                       style={{
//                         color: '#919eab',
//                         fontStyle: 'semibold',
//                         fontSize: '14px',
//                         padding: '10px 5px',
//                         width: '100%',
//                         height: '54px',
//                       }}
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                     />
//                   </Box>
//                 </div>

//                 <Scrollbar>
//                   <TableContainer sx={{ minWidth: 800 }}>
//                     <Table>
//                       <UserListHead
//                         order={order}
//                         orderBy={orderBy}
//                         headLabel={TABLE_HEAD}
//                         rowCount={resultsList.length}
//                         numSelected={selected.length}
//                         // onRequestSort={handleRequestSort}
//                         // onSelectAllClick={handleSelectAllClick}
//                       />

//                       <TableBody>
//                         {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
//                           const { id, status, progressionStatus } = row;

//                           const isItemSelected = selected.indexOf(id) !== -1;
//                           return (
//                             <TableRow
//                               hover
//                               key={id}
//                               tabIndex={-1}
//                               role="checkbox"
//                               selected={isItemSelected}
//                               aria-checked={isItemSelected}
//                             >
//                               <TableCell padding="checkbox">
//                                 <Checkbox
//                                   checked={isItemSelected}
//                                   // onClick={() => handleClick(id)}
//                                 />
//                               </TableCell>
//                               <TableCell align="left">{row.expand?.studentId.national_id || row.national_id}</TableCell>
//                               <TableCell align="left">
//                                 {row.expand?.studentId.firstname || row.firstname}{' '}
//                                 {row.expand?.studentId.lastname || row.lastname}
//                               </TableCell>
//                               <TableCell align="left">{row.assignmentMark}</TableCell>
//                               <TableCell align="left">{row.midSemesterMark}</TableCell>
//                               <TableCell align="left">{row.supplementaryMark}</TableCell>
//                               <TableCell align="left">{row.examMark}</TableCell>
//                               <TableCell align="left">{row.moduleMark} </TableCell>
//                               <TableCell align="left">
//                                 <Label
//                                   variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
//                                   color={tabColor(progressionStatus)}
//                                 >
//                                   {progressionStatus?.charAt(0).toUpperCase() + progressionStatus?.slice(1) ||
//                                     'Pending'}
//                                 </Label>
//                               </TableCell>
//                               <TableCell align="right">
//                                 <StudentListMenu
//                                   // onDelete={() => handleDeleteUser(id)}
//                                   id={row.studentId}
//                                   moduleId={moduleId}
//                                 />
//                               </TableCell>
//                             </TableRow>
//                           );
//                         })}
//                         {emptyRows > 0 && (
//                           <TableRow style={{ height: 53 * emptyRows }}>
//                             <TableCell colSpan={6} />
//                           </TableRow>
//                         )}
//                       </TableBody>
//                       {isNotFound && (
//                         <TableBody>
//                           <TableRow>
//                             <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
//                               <SearchNotFound searchQuery={filterName || _searchQuery} />
//                             </TableCell>
//                           </TableRow>
//                         </TableBody>
//                       )}
//                     </Table>
//                   </TableContainer>
//                 </Scrollbar>
//                 <TablePagination
//                   rowsPerPageOptions={[5, 10, 25]}
//                   component="div"
//                   count={resultsList.length}
//                   rowsPerPage={rowsPerPage}
//                   page={page}
//                   onPageChange={(e, page) => setPage(page)}
//                   onRowsPerPageChange={handleChangeRowsPerPage}
//                 />
//               </Box>
//             </TabPanel>
//           </TabContext>
//         </Card>

//         <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
//           <Button
//             onClick={() => {
//               submitResults();
//             }}
//             variant="contained"
//             size="large"
//           >
//             Submit Results
//           </Button>
//         </Stack>
//       </Container>
//     </Page>
//   );
// }

// // ----------------------------------------------------------------------

// function descendingComparator(a, b, orderBy) {
//   if (b[orderBy] < a[orderBy]) {
//     return -1;
//   }
//   if (b[orderBy] > a[orderBy]) {
//     return 1;
//   }
//   return 0;
// }

// function getComparator(order, orderBy) {
//   return order === 'desc'
//     ? (a, b) => descendingComparator(a, b, orderBy)
//     : (a, b) => -descendingComparator(a, b, orderBy);
// }

// function applySortFilter(array, comparator, search) {
//   const stabilizedThis = array.map((el, index) => [el, index]);
//   stabilizedThis.sort((a, b) => {
//     const order = comparator(a[0], b[0]);
//     if (order !== 0) return order;
//     return a[1] - b[1];
//   });
//   let filtered = array;
//   if (search) {
//     const q = search.toLowerCase();
//     filtered = filtered.filter(
//       (result) =>
//         (result?.studentId || '').toLowerCase().includes(q) ||
//         (result.expand?.studentId?.id || '').toLowerCase().includes(q) ||
//         (result.firstname || '').toLowerCase().includes(q) ||
//         (result.expand?.studentId?.firstname || '').toLowerCase().includes(q) ||
//         (result.lastname || '').toLowerCase().includes(q) ||
//         (result.expand?.studentId?.lastname || '').toLowerCase().includes(q) ||
//         (result.national_id || '').toLowerCase().includes(q) ||
//         (result.expand?.studentId?.national_id || '').toLowerCase().includes(q) ||
//         (result.prog_name || '').toLowerCase().includes(q) ||
//         (result.expand?.courseId?.course_name || '').toLowerCase().includes(q)
//     );
//   }
//   return stabilizedThis.filter(([el]) => filtered.includes(el)).map((el) => el[0]);
// }
