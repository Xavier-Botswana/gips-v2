// ----------------------------------------------------------------------

function path(root, sublink) {
  return `${root}${sublink}`;
}

const ROOTS_AUTH = '/auth';
const ROOTS_DASHBOARD = '/dashboard';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, '/login'),
  loginUnprotected: path(ROOTS_AUTH, '/login-unprotected'),
  idNumber: path(ROOTS_AUTH, '/id_number'),
  registerUnprotected: path(ROOTS_AUTH, '/register'),
  resetPassword: path(ROOTS_AUTH, '/reset-password'),
  registerStudent_email: path(ROOTS_AUTH, '/register_student_email'),
  resetConfirmPassword: path(ROOTS_AUTH, '/confirm-password-reset'),
  verify: path(ROOTS_AUTH, '/verify'),
};

export const PATH_PAGE = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page404: '/404',
  page500: '/500',
  components: '/components',
  PickCourse: '/PickCourse',
};

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  general: {
    app: path(ROOTS_DASHBOARD, '/app'),
    apply: path(ROOTS_DASHBOARD, '/apply'),
    application: path(ROOTS_DASHBOARD, '/application'),
    register: path(ROOTS_DASHBOARD, '/registerstu'),
    firstTimeRegistration: path(ROOTS_DASHBOARD, '/firstTime_register'),
    analytics: path(ROOTS_DASHBOARD, '/analytics'),
    banking: path(ROOTS_DASHBOARD, '/banking'),
    booking: path(ROOTS_DASHBOARD, '/booking'),
    userProfile: path(ROOTS_DASHBOARD, '/user_profile'),
    status: path(ROOTS_DASHBOARD, '/registration-status'),
  },
  mail: {
    root: path(ROOTS_DASHBOARD, '/mail'),
    all: path(ROOTS_DASHBOARD, '/mail/all'),
  },
  chat: {
    root: path(ROOTS_DASHBOARD, '/chat'),
    new: path(ROOTS_DASHBOARD, '/chat/new'),
    conversation: path(ROOTS_DASHBOARD, '/chat/:conversationKey'),
  },
  calendar: path(ROOTS_DASHBOARD, '/calendar'),
  kanban: path(ROOTS_DASHBOARD, '/kanban'),

  user: {
    root: path(ROOTS_DASHBOARD, '/user'),
    profile: path(ROOTS_DASHBOARD, '/user/profile'),
    cards: path(ROOTS_DASHBOARD, '/user/cards'),
    list: path(ROOTS_DASHBOARD, '/user/list'),
    newUser: path(ROOTS_DASHBOARD, '/user/new'),
    editById: path(ROOTS_DASHBOARD, `/user/reece-chung/edit`),
    account: path(ROOTS_DASHBOARD, '/user/account'),
  },

  student: {
    root: path(ROOTS_DASHBOARD, '/student'),
    register: path(ROOTS_DASHBOARD, '/student/registerstu'),
    semesterModules: path(ROOTS_DASHBOARD, '/student/semester_modules'),
    semester_registration: path(ROOTS_DASHBOARD, '/student/semester_registration'),
    studentResults: path(ROOTS_DASHBOARD, '/student/my_results'),
  },

  admissions: {
    root: path(ROOTS_DASHBOARD, '/admissions'),
    profile: path(ROOTS_DASHBOARD, '/admissions/profile'),
    cards: path(ROOTS_DASHBOARD, '/admissions/cards'),
    applicantApplicationslist: path(ROOTS_DASHBOARD, '/admissions/applicantApplicationslist'),
    studentslist: path(ROOTS_DASHBOARD, '/admissions/list'),
    firstTimeRegistrationlist: path(ROOTS_DASHBOARD, '/admissions/registrationlist'),
    resultslist: path(ROOTS_DASHBOARD, '/admissions/resultslist'),
    applicationlist: path(ROOTS_DASHBOARD, '/admissions/applicationlist'),
    returningStudents_registrationlist: path(ROOTS_DASHBOARD, '/admissions/students_registrationlist'),
    newuser: path(ROOTS_DASHBOARD, '/admissions/new'),
    dtefReports: path(ROOTS_DASHBOARD, '/admissions/dtefReports'),
    editById: path(ROOTS_DASHBOARD, `/admissions/reece-chung/edit`),
    account: path(ROOTS_DASHBOARD, '/admissions/account'),
    studentResultsList: path(ROOTS_DASHBOARD, '/admissions/students_results'),
    studentRejectedResultsList: path(ROOTS_DASHBOARD, '/admissions/students_rej_results'),
    moduleSelectionResults: path(ROOTS_DASHBOARD, '/admissions/module-selection-results'),
    newStudent: path(ROOTS_DASHBOARD, '/admissions/new_student'),
  },

  superAdmin: {
    root: path(ROOTS_DASHBOARD, '/superadmin'),
    createUsers: path(ROOTS_DASHBOARD, '/superadmin/users/create'),
    userList: path(ROOTS_DASHBOARD, '/superadmin/users/list'),
    facultyList: path(ROOTS_DASHBOARD, '/superadmin/faculty/list'),
    facultyCreate: path(ROOTS_DASHBOARD, '/superadmin/faculty/create'),
    courseList: path(ROOTS_DASHBOARD, '/superadmin/courses/list'),
    courseCreate: path(ROOTS_DASHBOARD, '/superadmin/courses/create'),
    moduleList: path(ROOTS_DASHBOARD, '/superadmin/modules/list'),
    moduleCreate: path(ROOTS_DASHBOARD, '/superadmin/modules/create'),
    registrationReports: path(ROOTS_DASHBOARD, `/superadmin/reports/registration`),
    applicationReports: path(ROOTS_DASHBOARD, '/admissions/dtefReports'),
    systemLogs: path(ROOTS_DASHBOARD, '/superadmin/logs'),
    newSemester: path(ROOTS_DASHBOARD, '/superadmin/new_semester'),
    notifications: path(ROOTS_DASHBOARD, '/superadmin/notifications'),
    transcriptsList: path(ROOTS_DASHBOARD, '/superAdmin/transcripts/list'),
    transcriptCreate: path(ROOTS_DASHBOARD, '/superAdmin/transcript/create'),
  },

  hod: {
    root: path(ROOTS_DASHBOARD, '/hod'),
    courseList: path(ROOTS_DASHBOARD, '/hod/courses/list'),
    courseCreate: path(ROOTS_DASHBOARD, '/hod/courses/create'),
    moduleList: path(ROOTS_DASHBOARD, '/hod/modules/list'),
    moduleCreate: path(ROOTS_DASHBOARD, '/hod/modules/create'),
    levelSelection: path(ROOTS_DASHBOARD, '/hod/results-manager/levels'),
    levelSelectionSup: path(ROOTS_DASHBOARD, '/hod/results-manager/levels_sup'),
    manageResults: path(ROOTS_DASHBOARD, '/hod/manage_results'),
    withheldResults: path(ROOTS_DASHBOARD, '/hod/withheld_results'),
    manageResultsSup: path(ROOTS_DASHBOARD, '/hod/manage_results_sup'),
    manageResultsChooseModule: path(ROOTS_DASHBOARD, '/hod/manage_results_module_select'),
    manageResultsChooseModuleSup: path(ROOTS_DASHBOARD, '/hod/manage_results_module_select_sup'),
    manageResultsChooseLecturerSup: path(ROOTS_DASHBOARD, '/hod/manage_results_module_select/lecturers_sup'),
    manageResultsChooseLecturer: path(ROOTS_DASHBOARD, '/hod/manage_results_module_select/lecturers'),
    manageResultsSupplements: path(ROOTS_DASHBOARD, '/hod/manage_results_supplements'),
    transcriptsList: path(ROOTS_DASHBOARD, '/hod/transcripts/list'),
    transcriptCreate: path(ROOTS_DASHBOARD, '/hod/transcript/create'),
    archivesManageResults: path(ROOTS_DASHBOARD, '/hod/archives_manage_results'),
    workloadManager: path(ROOTS_DASHBOARD, '/hod/workload_manager'),
    workloadManagerFaculty: path(ROOTS_DASHBOARD, '/hod/workload_manager/faculty/:faculty_id'),
    workloadManagerFacultyModule: path(ROOTS_DASHBOARD, '/hod/workload_manager/faculty/:faculty_id/modules/:course_id'),
    assignLecturerToModule: path(ROOTS_DASHBOARD, '/hod/workload_manager/module/:module_id/lecturer'),
  },

  eCommerce: {
    root: path(ROOTS_DASHBOARD, '/e-commerce'),
    // shop: path(ROOTS_DASHBOARD, '/e-commerce/status'),
    product: path(ROOTS_DASHBOARD, '/e-commerce/product/:name'),
    productById: path(ROOTS_DASHBOARD, '/e-commerce/product/nike-air-force-1-ndestrukt'),
    list: path(ROOTS_DASHBOARD, '/e-commerce/list'),
    newProduct: path(ROOTS_DASHBOARD, '/e-commerce/product/new'),
    editById: path(ROOTS_DASHBOARD, '/e-commerce/product/nike-blazer-low-77-vintage/edit'),
    checkout: path(ROOTS_DASHBOARD, '/e-commerce/checkout'),
    invoice: path(ROOTS_DASHBOARD, '/e-commerce/invoice'),
  },

  blog: {
    root: path(ROOTS_DASHBOARD, '/blog'),
    posts: path(ROOTS_DASHBOARD, '/blog/posts'),
    post: path(ROOTS_DASHBOARD, '/blog/post/:title'),
    postById: path(ROOTS_DASHBOARD, '/blog/post/apply-these-7-secret-techniques-to-improve-event'),
    newPost: path(ROOTS_DASHBOARD, '/blog/new-post'),
  },
};

export const PATH_DOCS = 'https://docs-minimals.vercel.app/introduction';
