import { useState } from 'react';

// @mui
import {
  Box,
  Button,
  Card,
  Container,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  MenuItem,
  InputBase,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import axios from '../../utils/axios';

// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import Scrollbar from '../../components/Scrollbar';
import Iconify from '../../components/Iconify';
import MenuPopover from '../../components/MenuPopover';
import { DialogAnimate } from '../../components/animate';

function ModuleAssignmentMoreMenu({ onDelete }) {
  const [open, setOpen] = useState(null);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  return (
    <>
      <IconButton onClick={handleOpen}>
        <Iconify icon="eva:more-vertical-fill" width={20} height={20} />
      </IconButton>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        arrow="right-top"
        sx={{
          mt: -1,
          width: 180,
          '& .MuiMenuItem-root': { px: 1, typography: 'body2', borderRadius: 0.75 },
        }}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            onDelete();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2, width: 20, height: 20 }} />
          Remove assignment
        </MenuItem>
      </MenuPopover>
    </>
  );
}

export default function ModuleSelectionResults() {
  const { themeStretch } = useSettings();

  const [lecturerName, setLecturerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [modulesError, setModulesError] = useState('');
  const [modules, setModules] = useState([]);
  const [modulesPage, setModulesPage] = useState(0);
  const [modulesRowsPerPage, setModulesRowsPerPage] = useState(5);
  const [modulesQueried, setModulesQueried] = useState(false);
  const [modulesFilter, setModulesFilter] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const handleAssign = async () => {
    if (!lecturerName) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await assignModulesToLecturer(lecturerName);
      setResult(response);
    } catch (err) {
      setResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleViewModules = async () => {
    if (!lecturerName) return;

    setModulesQueried(true);
    setModulesLoading(true);
    setModulesError('');
    setModules([]);

    try {
      const data = await fetchLecturerModules(lecturerName);
      setModules(data.modules);
      setModulesPage(0);
    } catch (err) {
      setModulesError(err.message || 'Failed to load modules');
    } finally {
      setModulesLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      await axios.delete(`/v1/modules/lecturers/${assignmentId}`);
      setModules((prev) => prev.filter((row) => row.id !== assignmentId));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };


  const renderModulesSection = () => {
    if (modulesLoading) {
      return (
        <Typography variant="body2" color="text.secondary">
          Loading modules...
        </Typography>
      );
    }

    if (!modulesQueried) {
      return (
        <Typography variant="body2" color="text.secondary">
          Enter a lecturer name above and choose &quot;View Assigned Modules&quot;.
        </Typography>
      );
    }

    if (modules.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          No modules found for this lecturer.
        </Typography>
      );
    }

    const filteredModules = modules.filter((row) => {
      if (!modulesFilter) return true;
      const q = modulesFilter.toLowerCase();
      return (
        (row.code || '').toLowerCase().includes(q) ||
        (row.name || '').toLowerCase().includes(q) ||
        String(row.yearLevel ?? '').toLowerCase().includes(q)
      );
    });

    const paginatedModules = filteredModules.slice(
      modulesPage * modulesRowsPerPage,
      modulesPage * modulesRowsPerPage + modulesRowsPerPage
    );

    if (filteredModules.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          No modules match your search.
        </Typography>
      );
    }

    return (
      <>
        <Box sx={{ mb: 2, maxWidth: 360 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: 1,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              px: 1,
              py: 0.5,
            }}
          >
            <Iconify
              icon="eva:search-fill"
              sx={{ color: 'text.disabled', width: 20, height: 20, mr: 1 }}
            />
            <InputBase
              placeholder="Search modules..."
              value={modulesFilter}
              onChange={(e) => {
                setModulesFilter(e.target.value);
                setModulesPage(0);
              }}
              sx={{ flexGrow: 1, fontSize: 14 }}
            />
          </Box>
        </Box>
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Module Code</TableCell>
                  <TableCell>Module Name</TableCell>
                  <TableCell>Year Level</TableCell>
                        <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedModules.map((row) => (
                  <TableRow key={row.id || row.moduleId} hover>
                    <TableCell>{row.code || '-'}</TableCell>
                    <TableCell>{row.name || '-'}</TableCell>
                    <TableCell>{row.yearLevel ?? '-'}</TableCell>
                    <TableCell align="right">
                      <ModuleAssignmentMoreMenu
                        onDelete={() => {
                          setPendingDeleteId(row.id || row.moduleId);
                          setConfirmOpen(true);
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
        <TablePagination
          component="div"
          rowsPerPageOptions={[5, 10, 25]}
          count={filteredModules.length}
          rowsPerPage={modulesRowsPerPage}
          page={modulesPage}
          onPageChange={(_, newPage) => setModulesPage(newPage)}
          onRowsPerPageChange={(event) => {
            setModulesRowsPerPage(parseInt(event.target.value, 10));
            setModulesPage(0);
          }}
        />
      </>
    );
  };

  return (
    <Page title="Module Selection Results">
      <DialogAnimate open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Remove module assignment?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
            This will unlink the selected module from this lecturer&apos;s workload. You can always
            re-assign it again later.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="outlined" color="inherit" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              if (pendingDeleteId) {
                await handleDeleteAssignment(pendingDeleteId);
              }
              setConfirmOpen(false);
              setPendingDeleteId(null);
            }}
          >
            Remove
          </Button>
        </DialogActions>
      </DialogAnimate>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Assign Lecturer to Modules"
          links={[
            { name: 'Results', href: PATH_DASHBOARD.admissions.resultslist },
            { name: 'Results Manager' },
            { name: 'Module Selection Results' },
          ]}
        />

        <Card sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Assign all registered modules to a lecturer
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter the lecturer&apos;s name exactly as it appears in the system. This will link all
            their modules to workload management.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Lecturer name"
              value={lecturerName}
              onChange={(e) => setLecturerName(e.target.value)}
            />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1.5,
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleViewModules}
                disabled={modulesLoading || !lecturerName}
              >
                {modulesLoading ? 'Loading...' : 'View Assigned Modules'}
              </Button>
              <Button
                variant="contained"
                onClick={handleAssign}
                disabled={loading || !lecturerName}
              >
                {loading ? 'Assigning...' : 'Assign Modules'}
              </Button>
            </Box>
          </Box>

          {result && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 1,
                bgcolor: 'background.neutral',
                maxHeight: 320,
                overflow: 'auto',
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Result
              </Typography>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  fontSize: 12,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {JSON.stringify(result, null, 2)}
              </Box>
            </Box>
          )}
        </Card>

        <Card sx={{ mt: 3 }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Assigned modules{lecturerName && ` for "${lecturerName}"`}
            </Typography>

            {modulesError && (
              <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                {modulesError}
              </Typography>
            )}

          {renderModulesSection()}
          </Box>
        </Card>
      </Container>
    </Page>
  );
}

async function assignModulesToLecturer(lecturerName) {
  const res = await axios.post('/v1/modules/lecturers/assign-by-name', { lecturerName });
  return res.data;
}

async function fetchLecturerModules(lecturerName) {
  const res = await axios.get('/v1/modules/lecturers/by-name', {
    params: { lecturerName, page: 1, limit: 500 },
  });

  return { modules: res.data.data?.modules || [] };
}
