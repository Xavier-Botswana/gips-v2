
// /* eslint-disable react/jsx-no-bind */
// import { useEffect, useState } from 'react';
// // @mui
// import {
//   Box,
//   Card,
//   CardHeader,
//   CardContent,
//   Divider,
//   Grid,
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableRow,
//   TableContainer,
//   TablePagination,
//   Typography,
//   TextField,
//   MenuItem,
//   Button,
// } from '@mui/material';
// // components & utils
// import axios from '../../../../utils/axios';
// import AnalyticsWidgetSummary from './AnalyticsWidgetSummary';
// import Scrollbar from '../../../../components/Scrollbar';
// import Iconify from '../../../../components/Iconify';
// import Label from '../../../../components/Label';
// import { tabColor } from '../../../../utils/setProgressionStatusTabColor';

// // ----------------------------------------------------------------------

// export default function AnalyticsDepartmentPerformance() {
//   const [faculties, setFaculties] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [selectedFacultyId, setSelectedFacultyId] = useState('');
//   const [selectedProgramId, setSelectedProgramId] = useState('');
//   const [selectedYear, setSelectedYear] = useState('');
//   const [studentSearch, setStudentSearch] = useState('');
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const response = await axios.get('/v1/analytics/department-performance');
//         const data = response?.data?.data || [];
//         setFaculties(data);

//         if (data.length > 0) {
//           const firstFaculty = data[0];
//           const firstProgram = firstFaculty.programs?.[0];
//           setSelectedFacultyId(firstFaculty.facultyId || '');
//           setSelectedProgramId(firstProgram?.courseId || '');
//           setSelectedYear('');
//         }
//       } catch (err) {
//         // eslint-disable-next-line no-console
//         console.error('Error fetching department performance analytics:', err);
//         setError('Unable to load department performance.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const activeFaculty =
//     faculties.length > 0
//       ? faculties.find((f) => (f.facultyId || '') === selectedFacultyId) || faculties[0]
//       : null;

//   const activePrograms = activeFaculty?.programs || [];

//   const activeProgram =
//     activePrograms.length > 0
//       ? activePrograms.find((p) => (p.courseId || '') === selectedProgramId) || activePrograms[0]
//       : null;

//   const yearOptions =
//     activeProgram?.levels
//       ?.map((level) => level.yearOfStudy)
//       .filter((value, index, self) => value !== undefined && value !== null && self.indexOf(value) === index) || [];

//   const handleFacultyChange = (event) => {
//     const newFacultyId = event.target.value;
//     setSelectedFacultyId(newFacultyId);
//     const fac = faculties.find((f) => (f.facultyId || '') === newFacultyId);
//     const firstProg = fac?.programs?.[0];
//     setSelectedProgramId(firstProg?.courseId || '');
//     setSelectedYear('');
//   };

//   const handleProgramChange = (event) => {
//     setSelectedProgramId(event.target.value);
//     setSelectedYear('');
//   };

//   const handleYearChange = (event) => {
//     setSelectedYear(event.target.value);
//   };

//   const handleStudentSearchChange = (event) => {
//     setStudentSearch(event.target.value);
//   };

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   function escapeCsv(value) {
//     if (value === null || value === undefined) return '';
//     const str = String(value);
//     if (/[",\n]/.test(str)) {
//       return `"${str.replace(/"/g, '""')}"`;
//     }
//     return str;
//   }

//   function formatDateValue(value) {
//     if (!value) return '';
//     const date = new Date(value);
//     if (Number.isNaN(date.getTime())) {
//       return String(value);
//     }

//     const month = `${date.getMonth() + 1}`.padStart(2, '0');
//     const day = `${date.getDate()}`.padStart(2, '0');
//     return `${date.getFullYear()}-${month}-${day}`;
//   }

//   function isPassedModule(module) {
//     const mark = Number(module?.moduleMark);
//     const status = (module?.progressionStatus || '').toLowerCase();

//     if (!Number.isNaN(mark)) {
//       return mark >= 50;
//     }

//     if (status.includes('pass')) {
//       return true;
//     }

//     if (status.includes('fail')) {
//       return false;
//     }

//     return false;
//   }

//   function getStudentField(student, keys, fallback = '') {
//     const expandStudent =
//       student?.expand?.studentId ||
//       student?.expand?.student ||
//       student?.expand?.record ||
//       student?.record ||
//       {};

//     const allSources = [student || {}, expandStudent];

//     for (let i = 0; i < allSources.length; i += 1) {
//       const source = allSources[i];
//       for (let j = 0; j < keys.length; j += 1) {
//         const key = keys[j];
//         const value = source?.[key];
//         if (value !== undefined && value !== null && value !== '') {
//           return value;
//         }
//       }
//     }

//     return fallback;
//   }

//   function deriveGenderFromTitle(titleValue, fallback = '') {
//     if (!titleValue) return fallback;
//     const normalized = String(titleValue).trim().toLowerCase();

//     if (normalized.startsWith('mr')) {
//       return 'Male';
//     }

//     if (normalized.startsWith('mrs') || normalized.startsWith('ms') || normalized.startsWith('miss')) {
//       return 'Female';
//     }

//     return fallback;
//   }

//   async function fetchStudentDetails(studentIds = []) {
//     if (!studentIds.length) {
//       return {};
//     }

//     const responses = await Promise.all(
//       studentIds.map(async (id) => {
//         try {
//           const res = await axios.get(`/v1/students/${id}`);
//           return { id, data: res.data };
//         } catch (error) {
//           // eslint-disable-next-line no-console
//           console.error(`Failed to fetch student ${id}:`, error);
//           return { id, data: null };
//         }
//       })
//     );

//     return responses.reduce((acc, item) => {
//       if (item.id) {
//         acc[item.id] = item.data;
//       }
//       return acc;
//     }, {});
//   }

//   async function handleExport() {
//     if (!activeFaculty || !activeProgram) {
//       return;
//     }

//     const collectedStudents = [];
//     const studentIdSet = new Set();

//     activeProgram.levels
//       ?.filter((level) => !selectedYear || String(level.yearOfStudy) === selectedYear)
//       .forEach((level) => {
//         level.students?.forEach((student) => {
//           const studentId = student.studentId || student.id || student._id;
//           if (studentId) {
//             studentIdSet.add(studentId);
//           }
//           collectedStudents.push({ level, student });
//         });
//       });

//     const studentDetailsMap = await fetchStudentDetails([...studentIdSet]);

//     const rows = [];
//     let sNo = 1;

//     collectedStudents.forEach(({ level, student }) => {
//       if (studentSearch && !(student.studentNo || '').toLowerCase().includes(studentSearch.toLowerCase())) {
//         return;
//       }

//       const studentId = student.studentId || student.id || student._id;
//       const mergedStudent = studentId && studentDetailsMap[studentId]
//         ? { ...studentDetailsMap[studentId], ...student }
//         : student;

//       const modules = mergedStudent.modules || student.modules || [];
//       const moduleCodes = modules.map((m) => m.moduleCode).filter(Boolean);
//       const noOfCredits = modules.reduce((sum, mod) => sum + (Number(mod.credits || mod.credit) || 0), 0);
//       const passedModules = modules.filter((mod) => isPassedModule(mod));
//       const failedModules = modules.filter((mod) => !isPassedModule(mod));
//       const modulesPassed = passedModules.map((m) => m.moduleCode).filter(Boolean).join(' | ');
//       const modulesFailed = failedModules.map((m) => m.moduleCode).filter(Boolean).join(' | ');
//       const academicDecision =
//         mergedStudent.academic_decision ||
//         mergedStudent.academicDecision ||
//         mergedStudent.progressionStatus ||
//         mergedStudent.progression_status ||
//         modules.find((m) => m?.progressionStatus)?.progressionStatus ||
//         '';

//       const title = getStudentField(mergedStudent, ['title'], '');
//       const firstName = getStudentField(mergedStudent, ['firstname', 'firstName', 'first_name', 'name'], '');
//       const surname = getStudentField(mergedStudent, ['lastname', 'lastName', 'last_name', 'surname'], '');
//       const gender = deriveGenderFromTitle(title, getStudentField(mergedStudent, ['gender'], ''));
//       const nationalId = getStudentField(mergedStudent, ['national_id', 'nationalId', 'omang'], '');
//       const trNumber = getStudentField(mergedStudent, ['tr_number', 'trNumber'], '');
//       const dateOfBirthRaw = getStudentField(mergedStudent, ['date_of_birth', 'dateOfBirth'], '');
//       const phoneNumber = getStudentField(mergedStudent, ['phone_number', 'phoneNumber', 'contactNo'], '');
//       const gpaValue = mergedStudent.gpa ?? mergedStudent.GPA ?? 'N/A';

//       if (!firstName || !surname || !gender || !dateOfBirthRaw) {
//         // eslint-disable-next-line no-console
//         console.log('Export student record (missing key fields):', mergedStudent);
//       }

//       rows.push({
//         sNo,
//         institution: activeFaculty.facultyName || activeFaculty.name || '',
//         surname,
//         firstName,
//         gender,
//         omang: nationalId,
//         trNo: trNumber,
//         dateOfBirth: formatDateValue(dateOfBirthRaw),
//         contactNo: phoneNumber,
//         studentNo: mergedStudent.studentNo,
//         programmeCode: activeProgram.courseCode || activeProgram.courseId || activeProgram.course_id || '',
//         programmeDescription: activeProgram.courseName || activeProgram.programmeDescription || '',
//         studyYear: level.yearOfStudy ?? mergedStudent.year_of_study ?? mergedStudent.study_year ?? '',
//         gpa: gpaValue || 'N/A',
//         levelOfStudy: mergedStudent.level_of_study || mergedStudent.levelOfStudy || level.yearOfStudy || '',
//         sponsorshipStartDate: formatDateValue(
//           mergedStudent.sponsorship_start_date || mergedStudent.sponsorshipStartDate
//         ),
//         sponsorshipCompletionDate: formatDateValue(
//           mergedStudent.sponsorship_completion_date || mergedStudent.sponsorshipCompletionDate
//         ),
//         dateOfRegistration: formatDateValue(mergedStudent.date_of_registration || mergedStudent.dateOfRegistration),
//         noOfModules: modules.length,
//         noOfCredits,
//         moduleCodes: moduleCodes.join(' | '),
//         modulesPassed,
//         modulesFailed,
//         academicDecision,
//       });

//       sNo += 1;
//     });

//     if (!rows.length) {
//       return;
//     }

//     const header = [
//       'S NO',
//       'INSTITUTION',
//       'SURNAME',
//       'FIRST NAME',
//       'GENDER',
//       'OMANG',
//       'TR NO',
//       'DATE OF BIRTH',
//       'CONTACT NO',
//       'STUDENT NO',
//       'PROGRAMME CODE',
//       'PROGRAMME DESCRIPTION',
//       'STUDY YEAR',
//       'GPA',
//       'LEVEL OF STUDY',
//       'SPONSORSHIP START DATE',
//       'SPONSORSHIP COMPLETION DATE',
//       'DATE OF REGISTRATION',
//       'NO OF MODULES',
//       'NO OF CREDITS',
//       'MODULES CODES',
//       'MODULES PASSED',
//       'MODULES FAILED',
//       'ACADEMIC DECISION',
//     ];

//     const csvLines = [
//       header.map(escapeCsv).join(','),
//       ...rows.map((row) =>
//         [
//           row.sNo,
//           row.institution,
//           row.surname,
//           row.firstName,
//           row.gender,
//           row.omang,
//           row.trNo,
//           row.dateOfBirth,
//           row.contactNo,
//           row.studentNo,
//           row.programmeCode,
//           row.programmeDescription,
//           row.studyYear,
//           row.gpa,
//           row.levelOfStudy,
//           row.sponsorshipStartDate,
//           row.sponsorshipCompletionDate,
//           row.dateOfRegistration,
//           row.noOfModules,
//           row.noOfCredits,
//           row.moduleCodes,
//           row.modulesPassed,
//           row.modulesFailed,
//           row.academicDecision,
//         ]
//           .map(escapeCsv)
//           .join(',')
//       ),
//     ];

//     const csvContent = csvLines.join('\n');
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     const fileName = `department-performance-${
//       activeFaculty.facultyName || 'faculty'
//     }-${activeProgram.courseName || 'programme'}.csv`;

//     link.href = url;
//     link.setAttribute('download', fileName.replace(/\s+/g, '_').toLowerCase());
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     window.URL.revokeObjectURL(url);
//   }

//   // Build flat rows for the main Students & Modules table
//   const tableRows = [];

//   if (activeFaculty && activeProgram) {
//     activeProgram.levels
//       ?.filter((level) => !selectedYear || String(level.yearOfStudy) === selectedYear)
//       .forEach((level) => {
//         level.students?.forEach((student) => {
//           student.modules?.forEach((module) => {
//             if (studentSearch && !(student.studentNo || '').toLowerCase().includes(studentSearch.toLowerCase())) {
//               return;
//             }

//             tableRows.push({
//               yearOfStudy: level.yearOfStudy,
//               studentNo: student.studentNo,
//               moduleCode: module.moduleCode,
//               moduleName: module.moduleName,
//               moduleMark: module.moduleMark,
//               progressionStatus: module.progressionStatus,
//             });
//           });
//         });
//       });
//   }

//   return (
//     <Card>
//       <CardHeader
//         title="Department Performance"
//         subheader="Progression by faculty, programme and year"
//         action={
//           <Button
//             size="small"
//             variant="outlined"
//             startIcon={<Iconify icon="mdi:download" width={18} height={18} />}
//             onClick={handleExport}
//           >
//             Export CSV
//           </Button>
//         }
//       />

//       <CardContent>
//         {loading && (
//           <Typography variant="body2" color="text.secondary">
//             Loading department performance...
//           </Typography>
//         )}

//         {!loading && error && (
//           <Typography variant="body2" color="error">
//             {error}
//           </Typography>
//         )}

//         {!loading && !error && faculties.length === 0 && (
//           <Typography variant="body2" color="text.secondary">
//             No department performance data available.
//           </Typography>
//         )}

//         {!loading && !error && faculties.length > 0 && (
//           <>
//             <Box sx={{ mb: 3 }}>
//               <Grid container spacing={2}>
//                 <Grid item xs={12} md={4}>
//                   <TextField
//                     select
//                     fullWidth
//                     size="small"
//                     label="Faculty"
//                     value={selectedFacultyId}
//                     onChange={handleFacultyChange}
//                   >
//                     {faculties.map((faculty) => (
//                       <MenuItem key={faculty.facultyId} value={faculty.facultyId}>
//                         {faculty.facultyName}
//                       </MenuItem>
//                     ))}
//                   </TextField>
//                 </Grid>

//                 {activePrograms.length > 0 && (
//                   <Grid item xs={12} md={4}>
//                     <TextField
//                       select
//                       fullWidth
//                       size="small"
//                       label="Programme"
//                       value={selectedProgramId}
//                       onChange={handleProgramChange}
//                     >
//                       {activePrograms.map((program) => (
//                         <MenuItem key={program.courseId} value={program.courseId}>
//                           {program.courseName}
//                         </MenuItem>
//                       ))}
//                     </TextField>
//                   </Grid>
//                 )}
//                 {yearOptions.length > 0 && (
//                   <Grid item xs={12} md={4}>
//                     <TextField
//                       select
//                       fullWidth
//                       size="small"
//                       label="Year of Study"
//                       value={selectedYear}
//                       onChange={handleYearChange}
//                     >
//                       <MenuItem value="">All Years</MenuItem>
//                       {yearOptions.map((year) => (
//                         <MenuItem key={year} value={String(year)}>
//                           {`Year ${year}`}
//                         </MenuItem>
//                       ))}
//                     </TextField>
//                   </Grid>
//                 )}
//               </Grid>
//             </Box>

//             <Scrollbar>
//               <Box sx={{ pt: 1, minWidth: 720 }}>
//                 {activeFaculty && activeProgram && (
//                   <Box sx={{ mb: 4 }}>
//                   <Typography variant="h6" sx={{ mb: 2 }}>
//                       {activeFaculty.facultyName}
//                   </Typography>

//                   {activeFaculty.summary && (
//                     <Grid container spacing={2} sx={{ mb: 3 }}>
//                       <Grid item xs={12} sm={4} md={3}>
//                         <AnalyticsWidgetSummary
//                           title="Total Students"
//                           total={activeFaculty.summary.totalStudents || 0}
//                           color="primary"
//                           icon="icon-[ant-design--team-outlined]"
//                         />
//                       </Grid>
//                       <Grid item xs={12} sm={4} md={3}>
//                         <AnalyticsWidgetSummary
//                           title="Pass + Proceed"
//                           total={activeFaculty.summary.passProceedCount || 0}
//                           color="success"
//                           icon="icon-[ant-design--rise-outlined]"
//                         />
//                       </Grid>
//                       <Grid item xs={12} sm={4} md={3}>
//                         <AnalyticsWidgetSummary
//                           title="Fail + Supplement"
//                           total={activeFaculty.summary.failSupplementCount || 0}
//                           color="error"
//                           icon="icon-[ant-design--fall-outlined]"
//                         />
//                       </Grid>
//                     </Grid>
//                   )}

//                   <Box sx={{ mb: 3 }}>
//                       <Typography variant="subtitle1" sx={{ mb: 1 }}>
//                       {activeProgram.courseName}
//                       </Typography>

//                       {activeProgram.summary && (
//                         <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                           {`Students: ${activeProgram.summary.totalStudents || 0} | Pass + Proceed: ${
//                             activeProgram.summary.passProceedCount || 0
//                           } | Fail + Supplement: ${activeProgram.summary.failSupplementCount || 0}`}
//                         </Typography>
//                       )}

//                       <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
//                         <TextField
//                           size="small"
//                           label="Search by Student No"
//                           value={studentSearch}
//                           onChange={handleStudentSearchChange}
//                         />
//                       </Box>

//                       <Table size="small">
//                         <TableHead>
//                           <TableRow>
//                             <TableCell>Year of Study</TableCell>
//                             <TableCell align="right">Total Students</TableCell>
//                             <TableCell align="right">Pass + Proceed</TableCell>
//                             <TableCell align="right">Fail + Supplement</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {activeProgram.levels
//                             ?.filter((level) => !selectedYear || String(level.yearOfStudy) === selectedYear)
//                             .map((level, lIndex) => (
//                               <TableRow key={level.yearOfStudy || lIndex}>
//                                 <TableCell>{`Year ${level.yearOfStudy}`}</TableCell>
//                                 <TableCell align="right">{level.summary?.totalStudents || 0}</TableCell>
//                                 <TableCell align="right">{level.summary?.passProceedCount || 0}</TableCell>
//                                 <TableCell align="right">{level.summary?.failSupplementCount || 0}</TableCell>
//                               </TableRow>
//                             ))}
//                         </TableBody>
//                       </Table>

//                       {tableRows.length > 0 && (
//                         <Box sx={{ mt: 3 }}>
//                           <Typography variant="subtitle2" sx={{ mb: 1 }}>
//                             Students &amp; Modules
//                           </Typography>
//                           <TableContainer sx={{ minWidth: 960 }}>
//                             <Table size="small">
//                               <TableHead>
//                                 <TableRow>
//                                   <TableCell>Year</TableCell>
//                                   <TableCell>Student No</TableCell>
//                                   <TableCell>Module Code</TableCell>
//                                   <TableCell>Module Name</TableCell>
//                                   <TableCell align="right">Module Mark</TableCell>
//                                   <TableCell>Progression Status</TableCell>
//                                 </TableRow>
//                               </TableHead>
//                               <TableBody>
//                                 {tableRows
//                                   .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//                                   .map((row, rowIndex) => (
//                                     <TableRow
//                                       hover
//                                       key={`${row.studentNo || rowIndex}-${row.moduleCode || rowIndex}`}
//                                       sx={{
//                                         '& > *': { py: 2.5 },
//                                         '&:last-of-type td, &:last-of-type th': { border: 0 },
//                                       }}
//                                     >
//                                       <TableCell>{`Year ${row.yearOfStudy}`}</TableCell>
//                                       <TableCell>{row.studentNo}</TableCell>
//                                       <TableCell>{row.moduleCode}</TableCell>
//                                       <TableCell>{row.moduleName}</TableCell>
//                                       <TableCell align="right">{row.moduleMark}</TableCell>
//                                       <TableCell>
//                                         <Label color={tabColor(row.progressionStatus)}>
//                                           {row.progressionStatus || '-'}
//                                         </Label>
//                                       </TableCell>
//                                     </TableRow>
//                                   ))}
//                               </TableBody>
//                             </Table>
//                           </TableContainer>
//                           <TablePagination
//                             rowsPerPageOptions={[5, 10, 25]}
//                             component="div"
//                             count={tableRows.length}
//                             rowsPerPage={rowsPerPage}
//                             page={page}
//                             onPageChange={handleChangePage}
//                             onRowsPerPageChange={handleChangeRowsPerPage}
//                           />
//                         </Box>
//                       )}
//                     </Box>
//                   </Box>
//                 )}
//               </Box>
//             </Scrollbar>
//           </>
//         )}
//       </CardContent>
//     </Card>
//   );
// }


// /* eslint-disable react/jsx-no-bind */
// import { useEffect, useState } from 'react';
// // @mui
// import {
//   Box,
//   Card,
//   CardHeader,
//   CardContent,
//   Divider,
//   Grid,
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableRow,
//   TableContainer,
//   TablePagination,
//   Typography,
//   TextField,
//   MenuItem,
//   Button,
// } from '@mui/material';
// // components & utils
// import axios from '../../../../utils/axios';
// import AnalyticsWidgetSummary from './AnalyticsWidgetSummary';
// import Scrollbar from '../../../../components/Scrollbar';
// import Iconify from '../../../../components/Iconify';
// import Label from '../../../../components/Label';
// import { tabColor } from '../../../../utils/setProgressionStatusTabColor';

// // ----------------------------------------------------------------------

// export default function AnalyticsDepartmentPerformance() {
//   const [faculties, setFaculties] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [selectedFacultyId, setSelectedFacultyId] = useState('');
//   const [selectedProgramId, setSelectedProgramId] = useState('');
//   const [selectedYear, setSelectedYear] = useState('');
//   const [studentSearch, setStudentSearch] = useState('');
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const response = await axios.get('/v1/analytics/department-performance');
//         const data = response?.data?.data || [];
//         setFaculties(data);

//         if (data.length > 0) {
//           const firstFaculty = data[0];
//           const firstProgram = firstFaculty.programs?.[0];
//           setSelectedFacultyId(firstFaculty.facultyId || '');
//           setSelectedProgramId(firstProgram?.courseId || '');
//           setSelectedYear('');
//         }
//       } catch (err) {
//         // eslint-disable-next-line no-console
//         console.error('Error fetching department performance analytics:', err);
//         setError('Unable to load department performance.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const activeFaculty =
//     faculties.length > 0
//       ? faculties.find((f) => (f.facultyId || '') === selectedFacultyId) || faculties[0]
//       : null;

//   const activePrograms = activeFaculty?.programs || [];

//   const activeProgram =
//     activePrograms.length > 0
//       ? activePrograms.find((p) => (p.courseId || '') === selectedProgramId) || activePrograms[0]
//       : null;

//   const yearOptions =
//     activeProgram?.levels
//       ?.map((level) => level.yearOfStudy)
//       .filter((value, index, self) => value !== undefined && value !== null && self.indexOf(value) === index) || [];

//   const handleFacultyChange = (event) => {
//     const newFacultyId = event.target.value;
//     setSelectedFacultyId(newFacultyId);
//     const fac = faculties.find((f) => (f.facultyId || '') === newFacultyId);
//     const firstProg = fac?.programs?.[0];
//     setSelectedProgramId(firstProg?.courseId || '');
//     setSelectedYear('');
//   };

//   const handleProgramChange = (event) => {
//     setSelectedProgramId(event.target.value);
//     setSelectedYear('');
//   };

//   const handleYearChange = (event) => {
//     setSelectedYear(event.target.value);
//   };

//   const handleStudentSearchChange = (event) => {
//     setStudentSearch(event.target.value);
//   };

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   function escapeCsv(value) {
//     if (value === null || value === undefined) return '';
//     const str = String(value);
//     if (/[",\n]/.test(str)) {
//       return `"${str.replace(/"/g, '""')}"`;
//     }
//     return str;
//   }

//   function formatDateValue(value) {
//     if (!value) return '';
//     const date = new Date(value);
//     if (Number.isNaN(date.getTime())) {
//       return String(value);
//     }

//     const month = `${date.getMonth() + 1}`.padStart(2, '0');
//     const day = `${date.getDate()}`.padStart(2, '0');
//     return `${date.getFullYear()}-${month}-${day}`;
//   }

//   function isPassedModule(module) {
//     const mark = Number(module?.moduleMark);
//     const status = (module?.progressionStatus || '').toLowerCase();

//     if (!Number.isNaN(mark)) {
//       return mark >= 50;
//     }

//     if (status.includes('pass')) {
//       return true;
//     }

//     if (status.includes('fail')) {
//       return false;
//     }

//     return false;
//   }

//   function getStudentField(student, keys, fallback = '') {
//     const expandStudent =
//       student?.expand?.studentId ||
//       student?.expand?.student ||
//       student?.expand?.record ||
//       student?.record ||
//       {};

//     const allSources = [student || {}, expandStudent];

//     for (let i = 0; i < allSources.length; i += 1) {
//       const source = allSources[i];
//       for (let j = 0; j < keys.length; j += 1) {
//         const key = keys[j];
//         const value = source?.[key];
//         if (value !== undefined && value !== null && value !== '') {
//           return value;
//         }
//       }
//     }

//     return fallback;
//   }

//   function deriveGenderFromTitle(titleValue, fallback = '') {
//     if (!titleValue) return fallback;
//     const normalized = String(titleValue).trim().toLowerCase();

//     if (normalized.startsWith('mr')) {
//       return 'Male';
//     }

//     if (normalized.startsWith('mrs') || normalized.startsWith('ms') || normalized.startsWith('miss')) {
//       return 'Female';
//     }

//     return fallback;
//   }

//   async function fetchStudentDetails(studentIds = []) {
//     if (!studentIds.length) {
//       return {};
//     }

//     const responses = await Promise.all(
//       studentIds.map(async (id) => {
//         try {
//           const res = await axios.get(`/v1/students/${id}`);
//           return { id, data: res.data };
//         } catch (error) {
//           // eslint-disable-next-line no-console
//           console.error(`Failed to fetch student ${id}:`, error);
//           return { id, data: null };
//         }
//       })
//     );

//     return responses.reduce((acc, item) => {
//       if (item.id) {
//         acc[item.id] = item.data;
//       }
//       return acc;
//     }, {});
//   }

//   async function handleExport() {
//     if (!activeFaculty || !activeProgram) {
//       return;
//     }

//     const collectedStudents = [];
//     const studentIdSet = new Set();

//     activeProgram.levels
//       ?.filter((level) => !selectedYear || String(level.yearOfStudy) === selectedYear)
//       .forEach((level) => {
//         level.students?.forEach((student) => {
//           const studentId = student.studentId || student.id || student._id;
//           if (studentId) {
//             studentIdSet.add(studentId);
//           }
//           collectedStudents.push({ level, student });
//         });
//       });

//     const studentDetailsMap = await fetchStudentDetails([...studentIdSet]);

//     const rows = [];
//     let sNo = 1;

//     collectedStudents.forEach(({ level, student }) => {
//       if (studentSearch && !(student.studentNo || '').toLowerCase().includes(studentSearch.toLowerCase())) {
//         return;
//       }

//       const studentId = student.studentId || student.id || student._id;
//       const mergedStudent = studentId && studentDetailsMap[studentId]
//         ? { ...studentDetailsMap[studentId], ...student }
//         : student;

//       const modules = mergedStudent.modules || student.modules || [];
//       const moduleCodes = modules.map((m) => m.moduleCode).filter(Boolean);
//       const noOfCredits = modules.reduce((sum, mod) => sum + (Number(mod.credits || mod.credit) || 0), 0);
//       const passedModules = modules.filter((mod) => isPassedModule(mod));
//       const failedModules = modules.filter((mod) => !isPassedModule(mod));
//       const modulesPassed = passedModules.map((m) => m.moduleCode).filter(Boolean).join(' | ');
//       const modulesFailed = failedModules.map((m) => m.moduleCode).filter(Boolean).join(' | ');
//       const academicDecision =
//         mergedStudent.academic_decision ||
//         mergedStudent.academicDecision ||
//         mergedStudent.progressionStatus ||
//         mergedStudent.progression_status ||
//         modules.find((m) => m?.progressionStatus)?.progressionStatus ||
//         '';

//       const title = getStudentField(mergedStudent, ['title'], '');
//       const firstName = getStudentField(mergedStudent, ['firstname', 'firstName', 'first_name', 'name'], '');
//       const surname = getStudentField(mergedStudent, ['lastname', 'lastName', 'last_name', 'surname'], '');
//       const gender = deriveGenderFromTitle(title, getStudentField(mergedStudent, ['gender'], ''));
//       const nationalId = getStudentField(mergedStudent, ['national_id', 'nationalId', 'omang'], '');
//       const trNumber = getStudentField(mergedStudent, ['tr_number', 'trNumber'], '');
//       const dateOfBirthRaw = getStudentField(mergedStudent, ['date_of_birth', 'dateOfBirth'], '');
//       const phoneNumber = getStudentField(mergedStudent, ['phone_number', 'phoneNumber', 'contactNo'], '');
//       const gpaValue = mergedStudent.gpa ?? mergedStudent.GPA ?? 'N/A';

//       if (!firstName || !surname || !gender || !dateOfBirthRaw) {
//         // eslint-disable-next-line no-console
//         console.log('Export student record (missing key fields):', mergedStudent);
//       }

//       rows.push({
//         sNo,
//         institution: activeFaculty.facultyName || activeFaculty.name || '',
//         surname,
//         firstName,
//         gender,
//         omang: nationalId,
//         trNo: trNumber,
//         dateOfBirth: formatDateValue(dateOfBirthRaw),
//         contactNo: phoneNumber,
//         studentNo: mergedStudent.studentNo,
//         programmeCode: activeProgram.courseCode || activeProgram.courseId || activeProgram.course_id || '',
//         programmeDescription: activeProgram.courseName || activeProgram.programmeDescription || '',
//         studyYear: level.yearOfStudy ?? mergedStudent.year_of_study ?? mergedStudent.study_year ?? '',
//         gpa: gpaValue || 'N/A',
//         levelOfStudy: mergedStudent.level_of_study || mergedStudent.levelOfStudy || level.yearOfStudy || '',
//         sponsorshipStartDate: formatDateValue(
//           mergedStudent.sponsorship_start_date || mergedStudent.sponsorshipStartDate
//         ),
//         sponsorshipCompletionDate: formatDateValue(
//           mergedStudent.sponsorship_completion_date || mergedStudent.sponsorshipCompletionDate
//         ),
//         dateOfRegistration: formatDateValue(mergedStudent.date_of_registration || mergedStudent.dateOfRegistration),
//         noOfModules: modules.length,
//         noOfCredits,
//         moduleCodes: moduleCodes.join(' | '),
//         modulesPassed,
//         modulesFailed,
//         academicDecision,
//       });

//       sNo += 1;
//     });

//     if (!rows.length) {
//       return;
//     }

//     const header = [
//       'S NO',
//       'INSTITUTION',
//       'SURNAME',
//       'FIRST NAME',
//       'GENDER',
//       'OMANG',
//       'TR NO',
//       'DATE OF BIRTH',
//       'CONTACT NO',
//       'STUDENT NO',
//       'PROGRAMME CODE',
//       'PROGRAMME DESCRIPTION',
//       'STUDY YEAR',
//       'GPA',
//       'LEVEL OF STUDY',
//       'SPONSORSHIP START DATE',
//       'SPONSORSHIP COMPLETION DATE',
//       'DATE OF REGISTRATION',
//       'NO OF MODULES',
//       'NO OF CREDITS',
//       'MODULES CODES',
//       'MODULES PASSED',
//       'MODULES FAILED',
//       'ACADEMIC DECISION',
//     ];

//     const csvLines = [
//       header.map(escapeCsv).join(','),
//       ...rows.map((row) =>
//         [
//           row.sNo,
//           row.institution,
//           row.surname,
//           row.firstName,
//           row.gender,
//           row.omang,
//           row.trNo,
//           row.dateOfBirth,
//           row.contactNo,
//           row.studentNo,
//           row.programmeCode,
//           row.programmeDescription,
//           row.studyYear,
//           row.gpa,
//           row.levelOfStudy,
//           row.sponsorshipStartDate,
//           row.sponsorshipCompletionDate,
//           row.dateOfRegistration,
//           row.noOfModules,
//           row.noOfCredits,
//           row.moduleCodes,
//           row.modulesPassed,
//           row.modulesFailed,
//           row.academicDecision,
//         ]
//           .map(escapeCsv)
//           .join(',')
//       ),
//     ];

//     const csvContent = csvLines.join('\n');
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     const fileName = `department-performance-${
//       activeFaculty.facultyName || 'faculty'
//     }-${activeProgram.courseName || 'programme'}.csv`;

//     link.href = url;
//     link.setAttribute('download', fileName.replace(/\s+/g, '_').toLowerCase());
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     window.URL.revokeObjectURL(url);
//   }

//   // Build flat rows for the main Students & Modules table
//   const tableRows = [];

//   if (activeFaculty && activeProgram) {
//     activeProgram.levels
//       ?.filter((level) => !selectedYear || String(level.yearOfStudy) === selectedYear)
//       .forEach((level) => {
//         level.students?.forEach((student) => {
//           student.modules?.forEach((module) => {
//             if (studentSearch && !(student.studentNo || '').toLowerCase().includes(studentSearch.toLowerCase())) {
//               return;
//             }

//             tableRows.push({
//               yearOfStudy: level.yearOfStudy,
//               studentNo: student.studentNo,
//               moduleCode: module.moduleCode,
//               moduleName: module.moduleName,
//               moduleMark: module.moduleMark,
//               progressionStatus: module.progressionStatus,
//             });
//           });
//         });
//       });
//   }

//   return (
//     <Card>
//       <CardHeader
//         title="Department Performance"
//         subheader="Progression by faculty, programme and year"
//         action={
//           <Button
//             size="small"
//             variant="outlined"
//             startIcon={<Iconify icon="mdi:download" width={18} height={18} />}
//             onClick={handleExport}
//           >
//             Export CSV
//           </Button>
//         }
//       />

//       <CardContent>
//         {loading && (
//           <Typography variant="body2" color="text.secondary">
//             Loading department performance...
//           </Typography>
//         )}

//         {!loading && error && (
//           <Typography variant="body2" color="error">
//             {error}
//           </Typography>
//         )}

//         {!loading && !error && faculties.length === 0 && (
//           <Typography variant="body2" color="text.secondary">
//             No department performance data available.
//           </Typography>
//         )}

//         {!loading && !error && faculties.length > 0 && (
//           <>
//             <Box sx={{ mb: 3 }}>
//               <Grid container spacing={2}>
//                 <Grid item xs={12} md={4}>
//                   <TextField
//                     select
//                     fullWidth
//                     size="small"
//                     label="Faculty"
//                     value={selectedFacultyId}
//                     onChange={handleFacultyChange}
//                   >
//                     {faculties.map((faculty) => (
//                       <MenuItem key={faculty.facultyId} value={faculty.facultyId}>
//                         {faculty.facultyName}
//                       </MenuItem>
//                     ))}
//                   </TextField>
//                 </Grid>

//                 {activePrograms.length > 0 && (
//                   <Grid item xs={12} md={4}>
//                     <TextField
//                       select
//                       fullWidth
//                       size="small"
//                       label="Programme"
//                       value={selectedProgramId}
//                       onChange={handleProgramChange}
//                     >
//                       {activePrograms.map((program) => (
//                         <MenuItem key={program.courseId} value={program.courseId}>
//                           {program.courseName}
//                         </MenuItem>
//                       ))}
//                     </TextField>
//                   </Grid>
//                 )}
//                 {yearOptions.length > 0 && (
//                   <Grid item xs={12} md={4}>
//                     <TextField
//                       select
//                       fullWidth
//                       size="small"
//                       label="Year of Study"
//                       value={selectedYear}
//                       onChange={handleYearChange}
//                     >
//                       <MenuItem value="">All Years</MenuItem>
//                       {yearOptions.map((year) => (
//                         <MenuItem key={year} value={String(year)}>
//                           {`Year ${year}`}
//                         </MenuItem>
//                       ))}
//                     </TextField>
//                   </Grid>
//                 )}
//               </Grid>
//             </Box>

//             <Scrollbar>
//               <Box sx={{ pt: 1, minWidth: 720 }}>
//                 {activeFaculty && activeProgram && (
//                   <Box sx={{ mb: 4 }}>
//                   <Typography variant="h6" sx={{ mb: 2 }}>
//                       {activeFaculty.facultyName}
//                   </Typography>

//                   {activeFaculty.summary && (
//                     <Grid container spacing={2} sx={{ mb: 3 }}>
//                       <Grid item xs={12} sm={4} md={3}>
//                         <AnalyticsWidgetSummary
//                           title="Total Students"
//                           total={activeFaculty.summary.totalStudents || 0}
//                           color="primary"
//                           icon="icon-[ant-design--team-outlined]"
//                         />
//                       </Grid>
//                       <Grid item xs={12} sm={4} md={3}>
//                         <AnalyticsWidgetSummary
//                           title="Pass + Proceed"
//                           total={activeFaculty.summary.passProceedCount || 0}
//                           color="success"
//                           icon="icon-[ant-design--rise-outlined]"
//                         />
//                       </Grid>
//                       <Grid item xs={12} sm={4} md={3}>
//                         <AnalyticsWidgetSummary
//                           title="Fail + Supplement"
//                           total={activeFaculty.summary.failSupplementCount || 0}
//                           color="error"
//                           icon="icon-[ant-design--fall-outlined]"
//                         />
//                       </Grid>
//                     </Grid>
//                   )}

//                   <Box sx={{ mb: 3 }}>
//                       <Typography variant="subtitle1" sx={{ mb: 1 }}>
//                       {activeProgram.courseName}
//                       </Typography>

//                       {activeProgram.summary && (
//                         <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                           {`Students: ${activeProgram.summary.totalStudents || 0} | Pass + Proceed: ${
//                             activeProgram.summary.passProceedCount || 0
//                           } | Fail + Supplement: ${activeProgram.summary.failSupplementCount || 0}`}
//                         </Typography>
//                       )}

//                       <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
//                         <TextField
//                           size="small"
//                           label="Search by Student No"
//                           value={studentSearch}
//                           onChange={handleStudentSearchChange}
//                         />
//                       </Box>

//                       <Table size="small">
//                         <TableHead>
//                           <TableRow>
//                             <TableCell>Year of Study</TableCell>
//                             <TableCell align="right">Total Students</TableCell>
//                             <TableCell align="right">Pass + Proceed</TableCell>
//                             <TableCell align="right">Fail + Supplement</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {activeProgram.levels
//                             ?.filter((level) => !selectedYear || String(level.yearOfStudy) === selectedYear)
//                             .map((level, lIndex) => (
//                               <TableRow key={level.yearOfStudy || lIndex}>
//                                 <TableCell>{`Year ${level.yearOfStudy}`}</TableCell>
//                                 <TableCell align="right">{level.summary?.totalStudents || 0}</TableCell>
//                                 <TableCell align="right">{level.summary?.passProceedCount || 0}</TableCell>
//                                 <TableCell align="right">{level.summary?.failSupplementCount || 0}</TableCell>
//                               </TableRow>
//                             ))}
//                         </TableBody>
//                       </Table>

//                       {tableRows.length > 0 && (
//                         <Box sx={{ mt: 3 }}>
//                           <Typography variant="subtitle2" sx={{ mb: 1 }}>
//                             Students &amp; Modules
//                           </Typography>
//                           <TableContainer sx={{ minWidth: 960 }}>
//                             <Table size="small">
//                               <TableHead>
//                                 <TableRow>
//                                   <TableCell>Year</TableCell>
//                                   <TableCell>Student No</TableCell>
//                                   <TableCell>Module Code</TableCell>
//                                   <TableCell>Module Name</TableCell>
//                                   <TableCell align="right">Module Mark</TableCell>
//                                   <TableCell>Progression Status</TableCell>
//                                 </TableRow>
//                               </TableHead>
//                               <TableBody>
//                                 {tableRows
//                                   .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//                                   .map((row, rowIndex) => (
//                                     <TableRow
//                                       hover
//                                       key={`${row.studentNo || rowIndex}-${row.moduleCode || rowIndex}`}
//                                       sx={{
//                                         '& > *': { py: 2.5 },
//                                         '&:last-of-type td, &:last-of-type th': { border: 0 },
//                                       }}
//                                     >
//                                       <TableCell>{`Year ${row.yearOfStudy}`}</TableCell>
//                                       <TableCell>{row.studentNo}</TableCell>
//                                       <TableCell>{row.moduleCode}</TableCell>
//                                       <TableCell>{row.moduleName}</TableCell>
//                                       <TableCell align="right">{row.moduleMark}</TableCell>
//                                       <TableCell>
//                                         <Label color={tabColor(row.progressionStatus)}>
//                                           {row.progressionStatus || '-'}
//                                         </Label>
//                                       </TableCell>
//                                     </TableRow>
//                                   ))}
//                               </TableBody>
//                             </Table>
//                           </TableContainer>
//                           <TablePagination
//                             rowsPerPageOptions={[5, 10, 25]}
//                             component="div"
//                             count={tableRows.length}
//                             rowsPerPage={rowsPerPage}
//                             page={page}
//                             onPageChange={handleChangePage}
//                             onRowsPerPageChange={handleChangeRowsPerPage}
//                           />
//                         </Box>
//                       )}
//                     </Box>
//                   </Box>
//                 )}
//               </Box>
//             </Scrollbar>
//           </>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
/* eslint-disable react/jsx-no-bind */
import { useEffect, useState } from 'react';
// @mui
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TablePagination,
  Typography,
  TextField,
  MenuItem,
  Button,
} from '@mui/material';
// components & utils
import axios from '../../../../utils/axios';
import AnalyticsWidgetSummary from './AnalyticsWidgetSummary';
import Scrollbar from '../../../../components/Scrollbar';
import Iconify from '../../../../components/Iconify';
import Label from '../../../../components/Label';
import { tabColor } from '../../../../utils/setProgressionStatusTabColor';

// ----------------------------------------------------------------------

export default function AnalyticsDepartmentPerformance() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/v1/analytics/department-performance');
        const data = response?.data?.data || [];
        setFaculties(data);

        if (data.length > 0) {
          const firstFaculty = data[0];
          const firstProgram = firstFaculty.programs?.[0];
          setSelectedFacultyId(firstFaculty.facultyId || '');
          setSelectedProgramId(firstProgram?.courseId || '');
          setSelectedYear('');
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching department performance analytics:', err);
        setError('Unable to load department performance.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeFaculty =
    faculties.length > 0
      ? faculties.find((f) => (f.facultyId || '') === selectedFacultyId) || faculties[0]
      : null;

  const activePrograms = activeFaculty?.programs || [];

  const activeProgram =
    activePrograms.length > 0
      ? activePrograms.find((p) => (p.courseId || '') === selectedProgramId) || activePrograms[0]
      : null;

  const yearOptions =
    activeProgram?.levels
      ?.map((level) => level.yearOfStudy)
      .filter((value, index, self) => value !== undefined && value !== null && self.indexOf(value) === index) || [];

  const handleFacultyChange = (event) => {
    const newFacultyId = event.target.value;
    setSelectedFacultyId(newFacultyId);
    const fac = faculties.find((f) => (f.facultyId || '') === newFacultyId);
    const firstProg = fac?.programs?.[0];
    setSelectedProgramId(firstProg?.courseId || '');
    setSelectedYear('');
  };

  const handleProgramChange = (event) => {
    setSelectedProgramId(event.target.value);
    setSelectedYear('');
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleStudentSearchChange = (event) => {
    setStudentSearch(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  function escapeCsv(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  function formatDateValue(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }

  function isPassedModule(module) {
    const mark = Number(module?.moduleMark);
    const status = (module?.progressionStatus || '').toLowerCase();

    if (!Number.isNaN(mark)) {
      return mark >= 40;
    }

    if (status.includes('pass')) {
      return true;
    }

    if (status.includes('fail')) {
      return false;
    }

    return false;
  }

  function getStudentField(student, keys, fallback = '') {
    const expandStudent =
      student?.expand?.studentId ||
      student?.expand?.student ||
      student?.expand?.record ||
      student?.record ||
      {};

    const allSources = [student || {}, expandStudent];

    for (let i = 0; i < allSources.length; i += 1) {
      const source = allSources[i];
      for (let j = 0; j < keys.length; j += 1) {
        const key = keys[j];
        const value = source?.[key];
        if (value !== undefined && value !== null && value !== '') {
          return value;
        }
      }
    }

    return fallback;
  }

  function deriveGenderFromTitle(titleValue, fallback = '') {
    if (!titleValue) return fallback;
    const normalized = String(titleValue).trim().toLowerCase();

    if (normalized.startsWith('mr')) {
      return 'Male';
    }

    if (normalized.startsWith('mrs') || normalized.startsWith('ms') || normalized.startsWith('miss')) {
      return 'Female';
    }

    return fallback;
  }

  async function fetchStudentDetails(studentIds = []) {
    if (!studentIds.length) {
      return {};
    }

    const responses = await Promise.all(
      studentIds.map(async (id) => {
        try {
          const res = await axios.get(`/v1/students/${id}`);
          return { id, data: res.data };
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Failed to fetch student ${id}:`, error);
          return { id, data: null };
        }
      })
    );

    return responses.reduce((acc, item) => {
      if (item.id) {
        acc[item.id] = item.data;
      }
      return acc;
    }, {});
  }

  async function handleExport() {
    if (!activeFaculty || !activeProgram) {
      return;
    }

    // eslint-disable-next-line no-console
    console.log('activeProgram:', activeProgram);

    // Fetch ALL results from the system to get complete module data
    let allResults = [];
    try {
      const resultsResponse = await axios.get('/v1/results');
      allResults = resultsResponse?.data?.data || [];
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch results:', err);
    }

    const collectedStudents = [];
    const studentIdSet = new Set();

    activeProgram.levels
      ?.filter((level) => !selectedYear || String(level.yearOfStudy) === selectedYear)
      .forEach((level) => {
        level.students?.forEach((student) => {
          const studentId = student.studentId || student.id || student._id;
          if (studentId) {
            studentIdSet.add(studentId);
          }
          collectedStudents.push({ level, student });
        });
      });

    const studentDetailsMap = await fetchStudentDetails([...studentIdSet]);

    const rows = [];
    let sNo = 1;

    collectedStudents.forEach(({ level, student }) => {
      if (studentSearch && !(student.studentNo || '').toLowerCase().includes(studentSearch.toLowerCase())) {
        return;
      }

      const studentId = student.studentId || student.id || student._id;
      const mergedStudent = studentId && studentDetailsMap[studentId]
        ? { ...studentDetailsMap[studentId], ...student }
        : student;

      // Get student's year and semester for filtering results
      const studentYearOfStudy = level.yearOfStudy ?? mergedStudent.year_of_study ?? mergedStudent.study_year ?? '';
      const studentSemester = mergedStudent.semester || mergedStudent.expand?.semester_id?.study_semester || '';

      // Filter results for THIS student by studentId, semester, and yearOfStudy (rollover logic)
      const filteredResults = allResults.filter((result) => {
        const matchesStudent = result.studentId === studentId;
        const matchesSemester = studentSemester
          ? result.semester?.toString() === studentSemester.toString()
          : true;
        // Extract numeric year from strings like "Year 1" or just "1"
        const yearNumeric = String(studentYearOfStudy).replace(/\D/g, '');
        const matchesYear = yearNumeric
          ? result.yearOfStudy?.toString() === yearNumeric
          : true;
        return matchesStudent && matchesSemester && matchesYear;
      });

      // Calculate progression using rollover logic (moduleMark >= 40 = pass)
      const passedModulesCount = filteredResults.filter((result) => Number(result.moduleMark) >= 40).length;
      const totalModules = filteredResults.length;
      const passPercentage = totalModules ? (passedModulesCount / totalModules) * 100 : 0;

      // Derive progression status based on rollover logic (>= 50% = Proceed)
      let derivedProgressionStatus = '';
      if (totalModules === 0) {
        derivedProgressionStatus = 'No Results';
      } else if (passPercentage >= 50) {
        derivedProgressionStatus = 'Proceed';
      } else {
        derivedProgressionStatus = 'Repeat';
      }

      // Use filtered results as modules if available, otherwise fall back to existing modules
      const modules = filteredResults.length > 0 ? filteredResults : (mergedStudent.modules || student.modules || []);
      // Extract module codes only (not names)
      const getModuleCode = (m) => m.moduleCode || m.module_code || m.code || m.expand?.moduleId?.code || m.expand?.moduleId?.module_code || '';
      const moduleCodes = modules.map(getModuleCode).filter(Boolean);
      const noOfCredits = modules.reduce((sum, mod) => sum + (Number(mod.credits || mod.credit) || 0), 0);
      const passedModules = modules.filter((mod) => Number(mod.moduleMark) >= 40);
      const failedModules = modules.filter((mod) => Number(mod.moduleMark) < 40);
      const modulesPassed = passedModules.map(getModuleCode).filter(Boolean).join(' | ');
      const modulesFailed = failedModules.map(getModuleCode).filter(Boolean).join(' | ');

      // Use the derived progression status from rollover logic
      const academicDecision = derivedProgressionStatus;

      const title = getStudentField(mergedStudent, ['title'], '');
      const firstName = getStudentField(mergedStudent, ['firstname', 'firstName', 'first_name', 'name'], '');
      const surname = getStudentField(mergedStudent, ['lastname', 'lastName', 'last_name', 'surname'], '');
      const gender = deriveGenderFromTitle(title, getStudentField(mergedStudent, ['gender'], ''));
      const nationalId = getStudentField(mergedStudent, ['national_id', 'nationalId', 'omang'], '');
      const trNumber = getStudentField(mergedStudent, ['tr_number', 'trNumber'], '');
      const dateOfBirthRaw = getStudentField(mergedStudent, ['date_of_birth', 'dateOfBirth'], '');
      const phoneNumber = getStudentField(mergedStudent, ['phone_number', 'phoneNumber', 'contactNo'], '');
      const gpaValue = mergedStudent.gpa ?? mergedStudent.GPA ?? 'N/A';

      if (!firstName || !surname || !gender || !dateOfBirthRaw) {
        // eslint-disable-next-line no-console
        console.log('Export student record (missing key fields):', mergedStudent);
      }

      rows.push({
        sNo,
        institution: activeFaculty.facultyName || activeFaculty.name || '',
        surname,
        firstName,
        gender,
        omang: nationalId,
        trNo: trNumber,
        dateOfBirth: formatDateValue(dateOfBirthRaw),
        contactNo: phoneNumber,
        studentNo: mergedStudent.studentNo,
        programmeCode: activeProgram.course_code || activeProgram.courseCode || activeProgram.code || '',
        programmeDescription: activeProgram.courseName || activeProgram.programmeDescription || '',
        studyYear: level.yearOfStudy ?? mergedStudent.year_of_study ?? mergedStudent.study_year ?? '',
        gpa: gpaValue || 'N/A',
        levelOfStudy: mergedStudent.level_of_study || mergedStudent.levelOfStudy || level.yearOfStudy || '',
        sponsorshipStartDate: formatDateValue(
          mergedStudent.sponsorship_start_date || mergedStudent.sponsorshipStartDate
        ),
        sponsorshipCompletionDate: formatDateValue(
          mergedStudent.sponsorship_completion_date || mergedStudent.sponsorshipCompletionDate
        ),
        dateOfRegistration: formatDateValue(mergedStudent.date_of_registration || mergedStudent.dateOfRegistration),
        noOfModules: modules.length,
        noOfCredits,
        moduleCodes: moduleCodes.join(' | '),
        modulesPassed,
        modulesFailed,
        academicDecision,
      });

      sNo += 1;
    });

    if (!rows.length) {
      return;
    }

    const header = [
      'S NO',
      'INSTITUTION',
      'SURNAME',
      'FIRST NAME',
      'GENDER',
      'OMANG',
      'TR NO',
      'DATE OF BIRTH',
      'CONTACT NO',
      'STUDENT NO',
      'PROGRAMME CODE',
      'PROGRAMME DESCRIPTION',
      'STUDY YEAR',
      'GPA',
      'LEVEL OF STUDY',
      'SPONSORSHIP START DATE',
      'SPONSORSHIP COMPLETION DATE',
      'DATE OF REGISTRATION',
      'NO OF MODULES',
      'NO OF CREDITS',
      'MODULES CODES',
      'MODULES PASSED',
      'MODULES FAILED',
      'ACADEMIC DECISION',
    ];

    const csvLines = [
      header.map(escapeCsv).join(','),
      ...rows.map((row) =>
        [
          row.sNo,
          row.institution,
          row.surname,
          row.firstName,
          row.gender,
          row.omang,
          row.trNo,
          row.dateOfBirth,
          row.contactNo,
          row.studentNo,
          row.programmeCode,
          row.programmeDescription,
          row.studyYear,
          row.gpa,
          row.levelOfStudy,
          row.sponsorshipStartDate,
          row.sponsorshipCompletionDate,
          row.dateOfRegistration,
          row.noOfModules,
          row.noOfCredits,
          row.moduleCodes,
          row.modulesPassed,
          row.modulesFailed,
          row.academicDecision,
        ]
          .map(escapeCsv)
          .join(',')
      ),
    ];

    const csvContent = csvLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = `department-performance-${
      activeFaculty.facultyName || 'faculty'
    }-${activeProgram.courseName || 'programme'}.csv`;

    link.href = url;
    link.setAttribute('download', fileName.replace(/\s+/g, '_').toLowerCase());
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Build flat rows for the main Students & Modules table
  const tableRows = [];

  if (activeFaculty && activeProgram) {
    activeProgram.levels
      ?.filter((level) => !selectedYear || String(level.yearOfStudy) === selectedYear)
      .forEach((level) => {
        level.students?.forEach((student) => {
          student.modules?.forEach((module) => {
            if (studentSearch && !(student.studentNo || '').toLowerCase().includes(studentSearch.toLowerCase())) {
              return;
            }

            tableRows.push({
              yearOfStudy: level.yearOfStudy,
              studentNo: student.studentNo,
              moduleCode: module.moduleCode,
              moduleName: module.moduleName,
              moduleMark: module.moduleMark,
              progressionStatus: module.progressionStatus,
            });
          });
        });
      });
  }

  return (
    <Card>
      <CardHeader
        title="Department Performance"
        subheader="Progression by faculty, programme and year"
        action={
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:download" width={18} height={18} />}
            onClick={handleExport}
          >
            Export CSV
          </Button>
        }
      />

      <CardContent>
        {loading && (
          <Typography variant="body2" color="text.secondary">
            Loading department performance...
          </Typography>
        )}

        {!loading && error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}

        {!loading && !error && faculties.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No department performance data available.
          </Typography>
        )}

        {!loading && !error && faculties.length > 0 && (
          <>
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Faculty"
                    value={selectedFacultyId}
                    onChange={handleFacultyChange}
                  >
                    {faculties.map((faculty) => (
                      <MenuItem key={faculty.facultyId} value={faculty.facultyId}>
                        {faculty.facultyName}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {activePrograms.length > 0 && (
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Programme"
                      value={selectedProgramId}
                      onChange={handleProgramChange}
                    >
                      {activePrograms.map((program) => (
                        <MenuItem key={program.courseId} value={program.courseId}>
                          {program.courseName}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                )}
                {yearOptions.length > 0 && (
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Year of Study"
                      value={selectedYear}
                      onChange={handleYearChange}
                    >
                      <MenuItem value="">All Years</MenuItem>
                      {yearOptions.map((year) => (
                        <MenuItem key={year} value={String(year)}>
                          {`Year ${year}`}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                )}
              </Grid>
            </Box>

            <Scrollbar>
              <Box sx={{ pt: 1, minWidth: 720 }}>
                {activeFaculty && activeProgram && (
                  <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                      {activeFaculty.facultyName}
                  </Typography>

                  {activeFaculty.summary && (
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={4} md={3}>
                        <AnalyticsWidgetSummary
                          title="Total Students"
                          total={activeFaculty.summary.totalStudents || 0}
                          color="primary"
                          icon="icon-[ant-design--team-outlined]"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4} md={3}>
                        <AnalyticsWidgetSummary
                          title="Pass + Proceed"
                          total={activeFaculty.summary.passProceedCount || 0}
                          color="success"
                          icon="icon-[ant-design--rise-outlined]"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4} md={3}>
                        <AnalyticsWidgetSummary
                          title="Fail + Supplement"
                          total={activeFaculty.summary.failSupplementCount || 0}
                          color="error"
                          icon="icon-[ant-design--fall-outlined]"
                        />
                      </Grid>
                    </Grid>
                  )}

                  <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      {activeProgram.courseName}
                      </Typography>

                      {activeProgram.summary && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {`Students: ${activeProgram.summary.totalStudents || 0} | Pass + Proceed: ${
                            activeProgram.summary.passProceedCount || 0
                          } | Fail + Supplement: ${activeProgram.summary.failSupplementCount || 0}`}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                        <TextField
                          size="small"
                          label="Search by Student No"
                          value={studentSearch}
                          onChange={handleStudentSearchChange}
                        />
                      </Box>

                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Year of Study</TableCell>
                            <TableCell align="right">Total Students</TableCell>
                            <TableCell align="right">Pass + Proceed</TableCell>
                            <TableCell align="right">Fail + Supplement</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {activeProgram.levels
                            ?.filter((level) => !selectedYear || String(level.yearOfStudy) === selectedYear)
                            .map((level, lIndex) => (
                              <TableRow key={level.yearOfStudy || lIndex}>
                                <TableCell>{`Year ${level.yearOfStudy}`}</TableCell>
                                <TableCell align="right">{level.summary?.totalStudents || 0}</TableCell>
                                <TableCell align="right">{level.summary?.passProceedCount || 0}</TableCell>
                                <TableCell align="right">{level.summary?.failSupplementCount || 0}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>

                      {tableRows.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Students &amp; Modules
                          </Typography>
                          <TableContainer sx={{ minWidth: 960 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Year</TableCell>
                                  <TableCell>Student No</TableCell>
                                  <TableCell>Module Code</TableCell>
                                  <TableCell>Module Name</TableCell>
                                  <TableCell align="right">Module Mark</TableCell>
                                  <TableCell>Progression Status</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {tableRows
                                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                  .map((row, rowIndex) => (
                                    <TableRow
                                      hover
                                      key={`${row.studentNo || rowIndex}-${row.moduleCode || rowIndex}`}
                                      sx={{
                                        '& > *': { py: 2.5 },
                                        '&:last-of-type td, &:last-of-type th': { border: 0 },
                                      }}
                                    >
                                      <TableCell>{`Year ${row.yearOfStudy}`}</TableCell>
                                      <TableCell>{row.studentNo}</TableCell>
                                      <TableCell>{row.moduleCode}</TableCell>
                                      <TableCell>{row.moduleName}</TableCell>
                                      <TableCell align="right">{row.moduleMark}</TableCell>
                                      <TableCell>
                                        <Label color={tabColor(row.progressionStatus)}>
                                          {row.progressionStatus || '-'}
                                        </Label>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={tableRows.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            </Scrollbar>
          </>
        )}
      </CardContent>
    </Card>
  );
}

