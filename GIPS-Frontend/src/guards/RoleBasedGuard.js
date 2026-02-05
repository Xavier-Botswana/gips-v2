import PropTypes from 'prop-types';
import { Container, Alert, AlertTitle } from '@mui/material';
import { useSelector } from 'react-redux';

// ----------------------------------------------------------------------

RoleBasedGuard.propTypes = {
  accessibleRoles: PropTypes.array.isRequired, // Example ['admin', 'leader']
  children: PropTypes.node,
};

export default function RoleBasedGuard({ accessibleRoles, children }) {
  const { record, isAuthenticated } = useSelector((state) => state.user);

  const currentRole = record?.role || null;

  if (!isAuthenticated || !currentRole) {
    return (
      <Container>
        <Alert severity="error">
          <AlertTitle>Permission Denied</AlertTitle>
          You do not have permission to access this page
        </Alert>
      </Container>
    );
  }

  if (!accessibleRoles.includes(currentRole)) {
    return (
      <Container>
        <Alert severity="error">
          <AlertTitle>Permission Denied</AlertTitle>
          You do not have permission to access this page
        </Alert>
      </Container>
    );
  }

  return <>{children}</>;
}
