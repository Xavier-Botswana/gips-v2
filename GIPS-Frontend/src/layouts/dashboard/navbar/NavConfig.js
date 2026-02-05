// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import SvgIconStyle from '../../../components/SvgIconStyle';

// ----------------------------------------------------------------------

const getIcon = (name) => <SvgIconStyle src={`/icons/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const ICONS = {
  blog: getIcon('ic_blog'),
  cart: getIcon('ic_cart'),
  chat: getIcon('ic_chat'),
  mail: getIcon('ic_mail'),
  user: getIcon('ic_user'),
  kanban: getIcon('ic_kanban'),
  banking: getIcon('ic_banking'),
  calendar: getIcon('ic_calendar'),
  ecommerce: getIcon('ic_ecommerce'),
  analytics: getIcon('ic_analytics'),
  dashboard: getIcon('ic_dashboard'),
  booking: getIcon('ic_booking'),
};

const guest = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'General',
    items: [
      { title: 'Apply now', path: PATH_DASHBOARD.general.apply, icon: ICONS.blog },
      // { title: 'My Applications', path: PATH_DASHBOARD.general.userProfile, icon: ICONS.blog},
    ],
  },
];

const userGuest = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'General',
    items: [
      // { title: 'app', path: PATH_DASHBOARD.general.app, icon: ICONS.dashboard },
      { title: 'Register', path: PATH_DASHBOARD.root, icon: ICONS.blog },
    ],
  },
];

const student = [
  // GENERAL to be completed
  // ----------------------------------------------------------------------
  {
    subheader: 'General',
    items: [
      { title: 'Results', path: PATH_DASHBOARD.student.studentResults, icon: ICONS.blog },
      { title: 'Calendar', path: PATH_DASHBOARD.calendar, icon: ICONS.blog },
      { title: 'Register', path: PATH_DASHBOARD.student.register, icon: ICONS.blog },
    ],
  },
];

const lecturer = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'lecturer General',
    items: [
      {
        title: 'Results Manager',
        path: PATH_DASHBOARD.admissions.moduleSelectionResults,
        icon: ICONS.blog,
        children: [
          { title: 'Module Results', path: PATH_DASHBOARD.admissions.moduleSelectionResults },
          { title: 'Rejected Results', path: PATH_DASHBOARD.admissions.studentRejectedResultsList },
          // { title: 'Create', path: PATH_DASHBOARD.superAdmin.courseCreate },
        ],
      },
      { title: 'Calendar', path: PATH_DASHBOARD.calendar, icon: ICONS.blog },
    ],
  },
];

const admin = [
  {
    subheader: 'General',
    items: [
      // General : Admin
      {
        title: 'Manage Students',
        path: PATH_DASHBOARD.admissions.applicationlist,
        icon: ICONS.user,
        children: [
          { title: 'list', path: PATH_DASHBOARD.admissions.studentslist },
          { title: 'Registration', path: PATH_DASHBOARD.admissions.returningStudents_registrationlist },
          { title: 'Applications', path: PATH_DASHBOARD.admissions.applicationlist },
          { title: 'First Time Registrants', path: PATH_DASHBOARD.admissions.firstTimeRegistrationlist },
        ],
      },

      { title: 'Calendar', path: PATH_DASHBOARD.calendar, icon: ICONS.calendar },

      // {
      //   title: 'Results Manager',
      //   icon: ICONS.user,
      //   children: [{ title: 'Supplements/Retakes', path: PATH_DASHBOARD.admissions.resultslist}],
      // },

      // {
      //   title: 'DTEF Reports',
      //   path: PATH_DASHBOARD.admissions.dtefReports,
      //   icon: ICONS.analytics,
      //   // children: [{ title: 'list', path: PATH_DASHBOARD.user.list }],
      // },
    ],
  },
];

const superAdmin = [
  {
    subheader: 'Super Admin',
    items: [
      {
        title: 'Dashboard',
        path: PATH_DASHBOARD.general.analytics,
        icon: ICONS.analytics,
      },
      {
        title: 'Manage Users',
        path: PATH_DASHBOARD.superAdmin.userList,
        icon: ICONS.user,
        children: [
          { title: 'List', path: PATH_DASHBOARD.superAdmin.userList },
          { title: 'Create', path: PATH_DASHBOARD.superAdmin.createUsers },
        ],
      },
      {
        title: 'Faculties',
        path: PATH_DASHBOARD.superAdmin.facultyList,
        icon: ICONS.blog,
        children: [
          { title: 'List', path: PATH_DASHBOARD.superAdmin.facultyList },
          { title: 'Create', path: PATH_DASHBOARD.superAdmin.facultyCreate },
        ],
      },
      {
        title: 'Courses',
        path: PATH_DASHBOARD.superAdmin.courseList,
        icon: ICONS.blog,
        children: [
          { title: 'List', path: PATH_DASHBOARD.superAdmin.courseList },
          { title: 'Create', path: PATH_DASHBOARD.superAdmin.courseCreate },
        ],
      },
      {
        title: 'Modules',
        path: PATH_DASHBOARD.superAdmin.moduleList,
        icon: ICONS.user,
        children: [
          { title: 'List', path: PATH_DASHBOARD.superAdmin.moduleList },
          { title: 'Create', path: PATH_DASHBOARD.superAdmin.moduleCreate },
        ],
      },
      {
        title: 'Calendar',
        path: PATH_DASHBOARD.calendar,
        icon: ICONS.calendar,
      },
      {
        title: 'Transcripts',
        path: '#',
        icon: ICONS.user,
        children: [
          { title: 'List', path: PATH_DASHBOARD.superAdmin.transcriptsList },
          { title: 'Create', path: PATH_DASHBOARD.superAdmin.transcriptCreate },
        ],
      },
      {
        title: 'Notifications Centre',
        path: PATH_DASHBOARD.superAdmin.notifications,
        icon: ICONS.mail,
      },
      {
        title: 'System Logs',
        path: PATH_DASHBOARD.superAdmin.systemLogs,
        icon: ICONS.dashboard,
      },
      {
        title: 'Start new semester',
        path: PATH_DASHBOARD.superAdmin.newSemester,
        icon: ICONS.dashboard,
      },
    ],
  },
];

const hod = [
  {
    subheader: 'Administrator (HODS)',
    items: [
      {
        title: 'Dashboard',
        path: PATH_DASHBOARD.general.analytics,
        icon: ICONS.analytics,
      },
      {
        title: 'Courses',
        path: PATH_DASHBOARD.admissions.applicationlist,
        icon: ICONS.blog,
        children: [
          { title: 'List', path: PATH_DASHBOARD.hod.courseList },
          { title: 'Create', path: PATH_DASHBOARD.hod.courseCreate },
        ],
      },
      {
        title: 'Modules',
        path: PATH_DASHBOARD.admissions.applicationlist,
        icon: ICONS.user,
        children: [
          { title: 'List', path: PATH_DASHBOARD.hod.moduleList },
          { title: 'Create', path: PATH_DASHBOARD.hod.moduleCreate },
        ],
      },
      {
        title: 'Transcripts',
        path: '#',
        icon: ICONS.user,
        children: [
          { title: 'List', path: PATH_DASHBOARD.hod.transcriptsList },
          { title: 'Create', path: PATH_DASHBOARD.hod.transcriptCreate },
        ],
      },
      {
        title: 'Calendar',
        path: PATH_DASHBOARD.calendar,
        icon: ICONS.calendar,
      },
      {
        title: 'Results Manager',
        path: PATH_DASHBOARD.hod.levelSelection,
        icon: ICONS.analytics,
        children: [
          { title: 'Results', path: PATH_DASHBOARD.hod.levelSelection },
          { title: 'Supplements', path: PATH_DASHBOARD.hod.levelSelectionSup },
          { title: 'Archives', path: PATH_DASHBOARD.hod.archivesManageResults },
          { title: 'Withheld Results', path: PATH_DASHBOARD.hod.withheldResults},

        ],
      },
      {
        title: 'Workload Manager',
        path: PATH_DASHBOARD.hod.workloadManager,
        icon: ICONS.dashboard,
      },
    ],
  },
];

const navConfig = [...guest, ...lecturer, ...admin, ...userGuest, ...student, ...superAdmin, ...hod];

export const guestConfig = [...guest];
export const userGuestConfig = [...userGuest];
export const studentConfig = [...student];
export const lecturerConfig = [...lecturer];
export const adminConfig = [...admin];
export const superConfig = [...superAdmin];
export const hodConfig = [...hod];

export default navConfig;
