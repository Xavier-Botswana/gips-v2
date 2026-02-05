import { Suspense, lazy } from 'react';
import { Navigate, useRoutes, useLocation } from 'react-router-dom';
// layouts
import DashboardLayout from '../layouts/dashboard';
import LogoOnlyLayout from '../layouts/LogoOnlyLayout';
// guards
import GuestGuard from '../guards/GuestGuard';
import AuthGuard from '../guards/AuthGuard';
import RoleBasedGuard from '../guards/RoleBasedGuard';
// config
// components
import LoadingScreen from '../components/LoadingScreen';

// ----------------------------------------------------------------------

const Loadable = (Component) => (props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pathname } = useLocation();

  return (
    <Suspense fallback={<LoadingScreen isDashboard={pathname.includes('/dashboard')} />}>
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {
  return useRoutes([
    {
      path: 'auth',
      children: [
        {
          path: 'login',
          element: (
            <GuestGuard>
              <Login />
            </GuestGuard>
          ),
        },
        {
          path: 'register',
          element: (
            <GuestGuard>
              <Register />
            </GuestGuard>
          ),
        },
        { path: 'login-unprotected', element: <Login /> },
        { path: 'register', element: <Register /> },
        { path: 'id_number', element: <IDNumber /> },
        { path: 'reset-password', element: <ResetPassword /> },
        { path: 'register_student_email', element: <RegisterStudentTemp /> },
        { path: 'confirm-password-reset', element: <ConfirmResetPassword /> },
        { path: 'verify', element: <VerifyCode /> },
      ],
    },

    // Dashboard Routes
    {
      path: 'dashboard',
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        { element: <Navigate to="/dashboard/registration-status" replace />, index: true },
        { path: 'app', element: <GeneralApp /> },
        {
          path: 'apply',
          element: (
            <RoleBasedGuard accessibleRoles={['guest']}>
              <GeneralEcommerce />
            </RoleBasedGuard>
          ),
        },
        {
          path: 'registerstu',
          element: (
            <RoleBasedGuard accessibleRoles={['student']}>
              {' '}
              <RegisterSemester />{' '}
            </RoleBasedGuard>
          ),
        },
        {
          path: 'firstTime_register',
          element: (
            <RoleBasedGuard accessibleRoles={['guestUser']}>
              <FirstTimeRegistrants />{' '}
            </RoleBasedGuard>
          ),
        },
        {
          path: 'analytics',
          element: (
            <RoleBasedGuard accessibleRoles={['admin', 'superAdmin', 'hod']}>
              {' '}
              <GeneralAnalytics />{' '}
            </RoleBasedGuard>
          ),
        },
        { path: 'banking', element: <GeneralBanking /> },
        { path: 'booking', element: <GeneralBooking /> },
        {
          path: 'user_profile',
          element: (
            <RoleBasedGuard accessibleRoles={['admin']}>
              <ApplicantApplicationList />
            </RoleBasedGuard>
          ),
        },
        {
          path: 'registration-status',
          element: (
            <RoleBasedGuard accessibleRoles={['admin', 'guestUser']}>
              <RegistrationStatus />{' '}
            </RoleBasedGuard>
          ),
        },
        {
          path: 'application',
          element: (
            <RoleBasedGuard accessibleRoles={['admin', 'guest', 'guestUser','returningGuest']}>
              <Application />
            </RoleBasedGuard>
          ),
        },

        // Guest
        {
          path: 'e-commerce',
          children: [
            { element: <Navigate to="/dashboard/e-commerce/status" replace />, index: true },
            // { path: 'status', element: <RegistrationStatus /> },
            { path: 'product/:name', element: <EcommerceProductDetails /> },
            { path: 'list', element: <EcommerceProductList /> },
            { path: 'product/new', element: <EcommerceProductCreate /> },
            { path: 'product/:name/edit', element: <EcommerceProductCreate /> },
            { path: 'checkout', element: <EcommerceCheckout /> },

            { path: 'invoice', element: <EcommerceInvoice /> },
          ],
        },

        {
          path: 'user',
          children: [
            { element: <Navigate to="/dashboard/user/profile" replace />, index: true },
            { path: 'profile', element: <UserProfile /> },
            { path: 'cards', element: <UserCards /> },
            { path: 'list', element: <UserList /> },
            { path: 'new', element: <UserCreate /> },
            { path: ':name/edit', element: <UserCreate /> },
            { path: 'account', element: <UserAccount /> },
          ],
        },

        {
          path: 'student',
          children: [
            { element: <Navigate to="/dashboard/user/profile" replace />, index: true },
            {
              path: 'registerstu',
              element: (
                <RoleBasedGuard accessibleRoles={['student']}>
                  <RegisterSemester />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'semester_modules',
              element: (
                <RoleBasedGuard accessibleRoles={['student']}>
                  <SemesterModules />{' '}
                </RoleBasedGuard>
              ),
            },
            {
              path: 'semester_registration',
              element: (
                <RoleBasedGuard accessibleRoles={['student']}>
                  <SemesterRegistration />{' '}
                </RoleBasedGuard>
              ),
            },
            {
              path: 'my_results',
              element: (
                <RoleBasedGuard accessibleRoles={['student']}>
                  <StudentResults />
                </RoleBasedGuard>
              ),
            },
          ],
        },

        {
          path: 'admissions',
          children: [
            { element: <Navigate to="/dashboard/admissions/profile" replace />, index: true },
            { path: 'profile', element: <UserProfile /> },
            { path: 'cards', element: <UserCards /> },
            {
              path: 'list',
              element: (
                <RoleBasedGuard accessibleRoles={['admin']}>
                  <StudentList />{' '}
                </RoleBasedGuard>
              ),
            },
            { path: 'dtefReports', element: <DtefReports /> },
            {
              path: 'registrationlist',
              element: (
                <RoleBasedGuard accessibleRoles={['admin']}>
                  <RegistrationList />{' '}
                </RoleBasedGuard>
              ),
            },
            {
              path: 'applicantApplicationslist',
              element: (
                <RoleBasedGuard accessibleRoles={['admin']}>
                  <ApplicantApplicationList />
                </RoleBasedGuard>
              ),
            },
            { path: 'resultslist', element: <ResultsList /> },
            {
              path: 'applicationlist',
              element: (
                <RoleBasedGuard accessibleRoles={['admin']}>
                  <ApplicationList />{' '}
                </RoleBasedGuard>
              ),
            },
            {
              path: 'students_registrationlist',
              element: (
                <RoleBasedGuard accessibleRoles={['admin']}>
                  <StudentsRegistrationList />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'new',
              element: (
                <RoleBasedGuard accessibleRoles={['admin']}>
                  <StudentCreate />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'new_student',
              element: (
                <RoleBasedGuard accessibleRoles={['admin']}>
                  <NewStudentCreate />{' '}
                </RoleBasedGuard>
              ),
            },
            {
              path: ':name/edit',
              element: (
                <RoleBasedGuard accessibleRoles={['admin']}>
                  <StudentCreate />
                </RoleBasedGuard>
              ),
            },
            { path: ':id/:moduleId/update', element: <StudentResultsUpdate /> },
            {
              path: ':name/review',
              element: (
                <RoleBasedGuard accessibleRoles={['admin']}>
                  <ApplicationReview />
                </RoleBasedGuard>
              ),
            },
            {
              path: ':name/reg_review',
              element: (
                <RoleBasedGuard accessibleRoles={['admin']}>
                  <FirstTimeRegistrationReview />{' '}
                </RoleBasedGuard>
              ),
            },
            { path: 'account', element: <UserAccount /> },
            {
              path: 'students_results/:id',
              element: (
                <RoleBasedGuard accessibleRoles={['hod', 'lecturer']}>
                  <StudentsResultsList />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'students_rej_results',
              element: (
                <RoleBasedGuard accessibleRoles={['lecturer']}>
                  {' '}
                  <StudentsRejectedResultsList />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'module-selection-results',
              element: (
                <RoleBasedGuard accessibleRoles={['lecturer', 'hod']}>
                  <ModuleSelectionResults />
                </RoleBasedGuard>
              ),
            },
          ],
        },

        {
          path: 'superadmin',
          children: [
            { element: <Navigate to="/dashboard/admissions/profile" replace />, index: true },

            // Wrap superadmin routes with RoleBasedGuard
            {
              path: 'faculty/list',
              element: (
                <RoleBasedGuard accessibleRoles={['superAdmin']}>
                  <FacultyList />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'faculty/create',
              element: (
                <RoleBasedGuard accessibleRoles={['superAdmin']}>
                  <FacultyCreate />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'faculty/:id/update',
              element: (
                <RoleBasedGuard accessibleRoles={['superAdmin','hod']}>
                  <FacultyCreate />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'courses/list',
              element: (
                <RoleBasedGuard accessibleRoles={['superAdmin']}>
                  <CourseList />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'courses/create',
              element: (
                <RoleBasedGuard accessibleRoles={['superAdmin']}>
                  <CourseCreate />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'courses/:id/update',
              element: (
                <RoleBasedGuard accessibleRoles={['superAdmin']}>
                  <CourseCreate />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'modules/list',
              element: (
                <RoleBasedGuard accessibleRoles={['superAdmin','hod']}>
                  <ModuleList />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'modules/create',
              element: (
                <RoleBasedGuard accessibleRoles={['superAdmin',]}>
                  <ModuleCreate />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'modules/:id/update',
              element: (
                <RoleBasedGuard accessibleRoles={['superAdmin']}>
                  <ModuleCreate />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'users/list',
              element: (
                <RoleBasedGuard accessibleRoles={['superAdmin']}>
                  <UserList />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'users/create',
              element: (
                <RoleBasedGuard accessibleRoles={['superAdmin']}>
                  <SuperUserCreate />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'users/:id/update',
              element: (
                <RoleBasedGuard accessibleRoles={['superAdmin']}>
                  <SuperUserCreate />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'notifications',
              element: (
                <RoleBasedGuard accessibleRoles={['superAdmin']}>
                  <SuperAdminNotifications />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'logs',
              element: (
                <RoleBasedGuard accessibleRoles={['superAdmin']}>
                  <SystemLogs />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'new_semester',
              element: (
                <RoleBasedGuard accessibleRoles={['superAdmin']}>
                  <NewSemester />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'transcripts/list',
              element: (
                <RoleBasedGuard accessibleRoles={['superAdmin']}>
                  <TranscriptsList />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'transcript/:id/update',
              element: (
                <RoleBasedGuard accessibleRoles={['superAdmin']}>
                  <TranscriptCreate />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'transcript/create',
              element: (
                <RoleBasedGuard accessibleRoles={['superAdmin']}>
                  <TranscriptCreate />
                </RoleBasedGuard>
              ),
            },
          ],
        },

        {
          path: 'hod',
          children: [
            { element: <Navigate to="/dashboard/admissions/profile" replace />, index: true },

            // Wrap hod routes with RoleBasedGuard
            {
              path: 'courses/list',
              element: (
                <RoleBasedGuard accessibleRoles={['hod']}>
                  <CourseList />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'courses/create',
              element: (
                <RoleBasedGuard accessibleRoles={['hod']}>
                  <CourseCreate />
                </RoleBasedGuard>
              ),
            },
             {
              path: 'courses/:id/update',
              element: (
                <RoleBasedGuard accessibleRoles={['hod']}>
                  <CourseCreate />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'modules/list',
              element: (
                <RoleBasedGuard accessibleRoles={['hod']}>
                  <ModuleList />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'modules/create',
              element: (
                <RoleBasedGuard accessibleRoles={['hod']}>
                  <ModuleCreate />
                </RoleBasedGuard>
              ),
            },
             {
              path: 'modules/:id/update',
              element: (
                <RoleBasedGuard accessibleRoles={['hod']}>
                  <ModuleCreate />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'results-manager/levels',
              element: (
                <RoleBasedGuard accessibleRoles={['hod']}>
                  <ResultsManagerLevels />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'results-manager/levels_sup',
              element: (
                <RoleBasedGuard accessibleRoles={['hod']}>
                  <ResultsManagerLevelsSup />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'transcripts/list',
              element: (
                <RoleBasedGuard accessibleRoles={['hod']}>
                  <TranscriptsList />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'transcript/:id/update',
              element: (
                <RoleBasedGuard accessibleRoles={['hod']}>
                  <TranscriptCreate />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'transcript/create',
              element: (
                <RoleBasedGuard accessibleRoles={['hod']}>
                  <TranscriptCreate />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'manage_results_module_select/:year',
              element: (
                <RoleBasedGuard accessibleRoles={['hod']}>
                  <ManageResultsModuleSelect />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'manage_results_module_select_sup/:year',
              element: (
                <RoleBasedGuard accessibleRoles={['hod']}>
                  <ManageResultsModuleSelectSup />
                </RoleBasedGuard>
              ),
            },
           
           
            {
              path: 'manage_results_module_select/lecturers/:module_id',
              element: (
                <RoleBasedGuard accessibleRoles={['hod']}>
                  <ManageResultsLecturerBatchSelect />
                </RoleBasedGuard>
              ),
            },

             {
              path: 'manage_results_module_select/lecturers_sup/:module_id',
              element: (
                <RoleBasedGuard accessibleRoles={['hod']}>
                  <ManageResultsLecturerBatchSelectSup />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'manage_results/:id',
              element: (
                <RoleBasedGuard accessibleRoles={['hod']}>
                  <ManageResultsList />
                </RoleBasedGuard>
              ),
            },
             {
              path: 'withheld_results',
              element: (
                <RoleBasedGuard accessibleRoles={['hod']}>
                  <WithheldResultsList />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'manage_results_sup/:id',
              element: (
                <RoleBasedGuard accessibleRoles={['hod']}>
                  <ManageResultsListSup />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'manage_results_supplements',
              element: (
                <RoleBasedGuard accessibleRoles={['hod']}>
                  <ManageSupplementResultsList />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'archives_manage_results',
              element: (
                <RoleBasedGuard accessibleRoles={['hod']}>
                  <ArchivesManageResultsList />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'workload_manager',
              element: (
                <RoleBasedGuard accessibleRoles={['hod']}>
                  <WorkloadManager />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'workload_manager/faculty/:faculty_id',
              element: (
                <RoleBasedGuard accessibleRoles={['hod']}>
                  <WorkloadManagerFaculty />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'workload_manager/faculty/:faculty_id/modules/:course_id',
              element: (
                <RoleBasedGuard accessibleRoles={['hod']}>
                  <WorkloadManagerFacultyModules />
                </RoleBasedGuard>
              ),
            },
            {
              path: 'workload_manager/module/:module_id/lecturer',
              element: (
                <RoleBasedGuard accessibleRoles={['hod']}>
                  <AssignLecturerToModule />
                </RoleBasedGuard>
              ),
            },
          ],
        },

        {
          path: 'blog',
          children: [
            { element: <Navigate to="/dashboard/blog/posts" replace />, index: true },
            { path: 'posts', element: <BlogPosts /> },
            { path: 'post/:title', element: <BlogPost /> },
            { path: 'new-post', element: <BlogNewPost /> },
          ],
        },
        {
          path: 'mail',
          children: [
            { element: <Navigate to="/dashboard/mail/all" replace />, index: true },
            { path: 'label/:customLabel', element: <Mail /> },
            { path: 'label/:customLabel/:mailId', element: <Mail /> },
            { path: ':systemLabel', element: <Mail /> },
            { path: ':systemLabel/:mailId', element: <Mail /> },
          ],
        },
        {
          path: 'chat',
          children: [
            { element: <Chat />, index: true },
            { path: 'new', element: <Chat /> },
            { path: ':conversationKey', element: <Chat /> },
          ],
        },
        { path: 'calendar', element: <Calendar /> },
        { path: 'kanban', element: <Kanban /> },
      ],
    },

    // Main Routes
    {
      path: '*',
      element: <LogoOnlyLayout />,
      children: [
        { path: 'coming-soon', element: <ComingSoon /> },
        { path: 'maintenance', element: <Maintenance /> },
        { path: 'pricing', element: <Pricing /> },
        { path: 'payment', element: <Payment /> },
        { path: '500', element: <Page500 /> },
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" replace /> },
      ],
    },
    {
      path: '/',
      element: <LogoOnlyLayout />,
      children: [
        { element: <HomePage />, index: true },
        { path: 'about-us', element: <About /> },
        { path: 'contact-us', element: <Contact /> },
        { path: 'newa', element: <UserCreate /> },
        { path: 'faqs', element: <Faqs /> },
      ],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}

// IMPORT COMPONENTS

// Authentication
const Login = Loadable(lazy(() => import('../pages/auth/Login')));
const Register = Loadable(lazy(() => import('../pages/auth/Register')));
const ResetPassword = Loadable(lazy(() => import('../pages/auth/ResetPassword')));
const RegisterStudentTemp = Loadable(lazy(() => import('../pages/auth/RegisterStudentsTemp')));
const IDNumber = Loadable(lazy(() => import('../pages/auth/ID_Number')));
const ConfirmResetPassword = Loadable(lazy(() => import('../pages/auth/confirm-reset-password')));
const VerifyCode = Loadable(lazy(() => import('../pages/auth/VerifyCode')));
// Dashboard
const GeneralApp = Loadable(lazy(() => import('../pages/dashboard/GeneralApp')));
const GeneralEcommerce = Loadable(lazy(() => import('../pages/dashboard/GeneralEcommerce')));
const RegisterSemester = Loadable(lazy(() => import('../pages/dashboard/ReturningStudents')));
const SemesterRegistration = Loadable(lazy(() => import('../pages/dashboard/StudentSemesterReg')));
const DtefReports = Loadable(lazy(() => import('../pages/dashboard/DtefReports')));
const GeneralAnalytics = Loadable(lazy(() => import('../pages/dashboard/GeneralAnalytics')));
const GeneralBanking = Loadable(lazy(() => import('../pages/dashboard/GeneralBanking')));
const GeneralBooking = Loadable(lazy(() => import('../pages/dashboard/GeneralBooking')));
const RegistrationStatus = Loadable(lazy(() => import('../pages/dashboard/RegistrationStatus')));
const EcommerceProductDetails = Loadable(lazy(() => import('../pages/dashboard/EcommerceProductDetails')));
const EcommerceProductList = Loadable(lazy(() => import('../pages/dashboard/EcommerceProductList')));
const EcommerceProductCreate = Loadable(lazy(() => import('../pages/dashboard/EcommerceProductCreate')));
const EcommerceCheckout = Loadable(lazy(() => import('../pages/dashboard/EcommerceCheckout')));
const EcommerceInvoice = Loadable(lazy(() => import('../pages/dashboard/EcommerceInvoice')));
const BlogPosts = Loadable(lazy(() => import('../pages/dashboard/BlogPosts')));
const BlogPost = Loadable(lazy(() => import('../pages/dashboard/BlogPost')));
const BlogNewPost = Loadable(lazy(() => import('../pages/dashboard/BlogNewPost')));
const UserProfile = Loadable(lazy(() => import('../pages/dashboard/UserProfile')));
const UserCards = Loadable(lazy(() => import('../pages/dashboard/UserCards')));
const UserList = Loadable(lazy(() => import('../pages/dashboard/UserList')));
const ApplicantApplicationList = Loadable(lazy(() => import('../pages/dashboard/ApplicantApplicationList')));
const StudentList = Loadable(lazy(() => import('../pages/dashboard/StudentList')));
const RegistrationList = Loadable(lazy(() => import('../pages/dashboard/RegistrationList')));
const StudentsRegistrationList = Loadable(lazy(() => import('../pages/dashboard/StudentsRegistrationList')));
const ResultsList = Loadable(lazy(() => import('../pages/dashboard/ResultsList')));
const ApplicationList = Loadable(lazy(() => import('../pages/dashboard/ApplicationList')));
const FirstTimeApplicationList = Loadable(lazy(() => import('../pages/dashboard/FirstTimeApplicationList')));
const UserAccount = Loadable(lazy(() => import('../pages/dashboard/UserAccount')));
const UserCreate = Loadable(lazy(() => import('../pages/dashboard/SuperUserCreate')));
const NewSemester = Loadable(lazy(() => import('../pages/dashboard/newSemesterRollover')));
const SuperUserCreate = Loadable(lazy(() => import('../pages/dashboard/SuperUserCreate')));
const SemesterModules = Loadable(lazy(() => import('../pages/dashboard/SemesterModules')));
const FirstTimeRegistrants = Loadable(lazy(() => import('../pages/dashboard/FirstTimeRegistrants')));
const StudentCreate = Loadable(lazy(() => import('../pages/dashboard/StudentCreate')));
const ApplicationReview = Loadable(lazy(() => import('../pages/dashboard/ApplicationReview')));
const FirstTimeRegistrationReview = Loadable(lazy(() => import('../pages/dashboard/FirstTimeRegistrationReview')));
const Chat = Loadable(lazy(() => import('../pages/dashboard/Chat')));
const Mail = Loadable(lazy(() => import('../pages/dashboard/Mail')));
const Calendar = Loadable(lazy(() => import('../pages/dashboard/Calendar')));
const Kanban = Loadable(lazy(() => import('../pages/dashboard/Kanban')));

// Dashboard - Super Admin
const FacultyList = Loadable(lazy(() => import('../pages/dashboard/FacultyList')));
const FacultyCreate = Loadable(lazy(() => import('../pages/dashboard/FacultyCreate')));
const CourseList = Loadable(lazy(() => import('../pages/dashboard/CoursesList')));
const CourseCreate = Loadable(lazy(() => import('../pages/dashboard/CourseCreate')));
const ModuleList = Loadable(lazy(() => import('../pages/dashboard/ModuleList')));
const ModuleCreate = Loadable(lazy(() => import('../pages/dashboard/ModuleCreate')));
const SuperAdminNotifications = Loadable(lazy(() => import('../pages/dashboard/SuperAdminNotifications')));
const SystemLogs = Loadable(lazy(() => import('../pages/dashboard/SystemLogs')));

// Guest
const Application = Loadable(lazy(() => import('../pages/dashboard/UserCreate')));

// Admin
const StudentsResultsList = Loadable(lazy(() => import('../pages/dashboard/StudentsResultsList')));
const StudentsRejectedResultsList = Loadable(lazy(() => import('../pages/dashboard/StudentsRejectedResultsList')));
const ModuleSelectionResults = Loadable(lazy(() => import('../pages/dashboard/ModuleSelectionResults')));
const StudentResultsUpdate = Loadable(lazy(() => import('../pages/dashboard/StudentResultsUpdate')));
const NewStudentCreate = Loadable(lazy(() => import('../pages/dashboard/NewStudentCreate')));

// HOD
const ResultsManagerLevels = Loadable(lazy(() => import('../pages/dashboard/ResultsManagerLevels')));
const ManageResultsList = Loadable(lazy(() => import('../pages/dashboard/ManageResultsList')));
const WithheldResultsList = Loadable(lazy(() => import('../pages/dashboard/WithheldResultsList')));
const ManageResultsModuleSelect = Loadable(lazy(() => import('../pages/dashboard/ManageResultsModuleSelect')));
const ManageResultsLecturerBatchSelect = Loadable(
  lazy(() => import('../pages/dashboard/ManageResultsLecturerBatchSelect'))
);


// HOD
const ResultsManagerLevelsSup = Loadable(lazy(() => import('../pages/dashboard/ResultsManagerLevelsSup')));
const ManageResultsListSup = Loadable(lazy(() => import('../pages/dashboard/ManageResultsListSup')));
const ManageResultsModuleSelectSup = Loadable(lazy(() => import('../pages/dashboard/ManageResultsModuleSelectSup')));
const ManageResultsLecturerBatchSelectSup = Loadable(
  lazy(() => import('../pages/dashboard/ManageResultsLecturerBatchSelectSup'))
);










const ManageSupplementResultsList = Loadable(lazy(() => import('../pages/dashboard/ManageSupplementResultsList')));
const TranscriptsList = Loadable(lazy(() => import('../pages/dashboard/TranscriptsList')));
const TranscriptCreate = Loadable(lazy(() => import('../pages/dashboard/TranscriptCreate')));
const ArchivesManageResultsList = Loadable(lazy(() => import('../pages/dashboard/ArchivesStudentResultsList')));
const WorkloadManager = Loadable(lazy(() => import('../pages/dashboard/WorkloadManager')));
const WorkloadManagerFaculty = Loadable(lazy(() => import('../pages/dashboard/WorkLoadManagerFaculty')));
const WorkloadManagerFacultyModules = Loadable(lazy(() => import('../pages/dashboard/WorkloadManagerFacultyModules')));
const AssignLecturerToModule = Loadable(lazy(() => import('../pages/dashboard/AssignLecturerToModule')));

// Student
const StudentResults = Loadable(lazy(() => import('../pages/dashboard/StudentResults')));

// Main
const HomePage = Loadable(lazy(() => import('../pages/Home')));
const About = Loadable(lazy(() => import('../pages/About')));
const Contact = Loadable(lazy(() => import('../pages/Contact')));
const Faqs = Loadable(lazy(() => import('../pages/Faqs')));
const ComingSoon = Loadable(lazy(() => import('../pages/ComingSoon')));
const Maintenance = Loadable(lazy(() => import('../pages/Maintenance')));
const Pricing = Loadable(lazy(() => import('../pages/Pricing')));
const Payment = Loadable(lazy(() => import('../pages/Payment')));
const Page500 = Loadable(lazy(() => import('../pages/Page500')));
const NotFound = Loadable(lazy(() => import('../pages/Page404')));
