import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
// routes
import { PATH_DASHBOARD } from '../routes/paths';

// ----------------------------------------------------------------------

GuestGuard.propTypes = {
    children: PropTypes.node,
};

export default function GuestGuard({ children }) {
    const { record, isAuthenticated } = useSelector((state) => state.user);

    // Unauthenticated users can view guest routes (e.g., login/register)
    if (!isAuthenticated) {
        return <>{children}</>;
    }

    // Authenticated users are redirected by role
    if (record?.role === 'guest') {
        return <Navigate to={PATH_DASHBOARD.general.apply} />;
    }
    if (record?.role === 'returningGuest') {
        return <Navigate to={PATH_DASHBOARD.general.application} />;
    }
    if (record?.role === 'guestUser') {
        return <Navigate to={PATH_DASHBOARD.general.status} />;
    }
    if (record?.role === 'admin') {
        return <Navigate to={PATH_DASHBOARD.admissions.studentslist} />;
    }
    if (record?.role === 'student') {
        return <Navigate to={PATH_DASHBOARD.student.studentResults} />;
    }
    if (record?.role === 'lecturer') {
      return <Navigate to={PATH_DASHBOARD.admissions.moduleSelectionResults} />;
    }
    if (record?.role === 'superAdmin') {
        return <Navigate to={PATH_DASHBOARD.general.analytics} />;
    }
    if (record?.role === 'hod') {
      return <Navigate to={PATH_DASHBOARD.hod.courseList} />;
    }

    return <>{ children }</>;
}
