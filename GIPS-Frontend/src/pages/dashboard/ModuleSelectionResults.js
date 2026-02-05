import { useEffect, useMemo, useState } from 'react';

import { useTheme } from '@mui/material/styles';
import { Box, Container, Grid, InputBase, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

import axios from '../../utils/axios';
import { useSelector } from '../../redux/store';
import useSettings from '../../hooks/useSettings';

import Page from '../../components/Page';
import Iconify from '../../components/Iconify';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import ModulesNotFound from '../../components/ModulesNotFound';
import { ModuleWidget } from '../../sections/@dashboard/general/Cards';

export default function ModuleSelectionResults() {
  const { record } = useSelector((state) => state.user);

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [yearFilter, setYearFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const theme = useTheme();
  const { themeStretch } = useSettings();

  useEffect(() => {
    const ac = new AbortController();

    if (!record?.id) {
      return () => ac.abort();
    }

    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const lecturerRes = await axios.get(`/v1/lecturers/user/${record.id}`, { signal: ac.signal });
        const lecturer = lecturerRes.data.data;

        if (!lecturer) {
          setModules([]);
          setError('No lecturer profile linked to this account.');
          return;
        }

        const rows = [];
        let currentPage = 1;
        let totalPages = 1;

        while (currentPage <= totalPages) {
          // eslint-disable-next-line no-await-in-loop
          const res = await axios.get('/v1/modules/lecturers', {
            signal: ac.signal,
            params: {
              lecturerId: lecturer.id,
              page: currentPage,
              limit: 100,
            },
          });

          rows.push(...(res.data.data || []));
          totalPages = res.data.totalPages || 1;
          currentPage += 1;
        }

        const normalized = rows
          .map((row) => {
            const mod = row?.expand?.module_id;
            if (!mod) return null;
            return Array.isArray(mod) ? mod : [mod];
          })
          .filter(Boolean)
          .flat()
          .filter(Boolean);

        setModules(normalized);
      } catch (err) {
        if (!ac.signal.aborted) {
          console.error(err);
          setError(err?.message || 'Failed to load modules.');
          setModules([]);
        }
      } finally {
        if (!ac.signal.aborted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => ac.abort();
  }, [record?.id]);

  const filteredModules = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const filtered = (modules || []).filter((mod) => {
      const name = String(mod?.name ?? '').toLowerCase();
      const semester = String(mod?.expand?.semester?.name ?? mod?.semester ?? '').toLowerCase();
      const yearLevel = String(mod?.year_level ?? '').toLowerCase();

      const passYear =
        yearFilter === 'All' ||
        yearLevel === yearFilter.replace('Year ', '').trim().toLowerCase() ||
        yearLevel === yearFilter.toLowerCase();

      const passSemester = semesterFilter === 'All' || semester === semesterFilter.toLowerCase();

      const passSearch =
        !search || name.includes(search) || semester.includes(search) || yearLevel.includes(search);

      return passYear && passSemester && passSearch;
    });

    const seen = new Map();
    filtered.forEach((mod) => {
      const name = String(mod?.name ?? '').toLowerCase();
      const semester = String(mod?.expand?.semester?.name ?? mod?.semester ?? '').toLowerCase();
      const key = `${name}::${semester}`;
      if (!seen.has(key)) seen.set(key, mod);
    });

    return Array.from(seen.values());
  }, [modules, yearFilter, semesterFilter, searchTerm]);

  return (
    <Page title="Select Module">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading="View Students Results Here"
          links={[{ name: 'Modules', href: '#' }, { name: 'Module Selection' }]}
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '0.5fr 0.5fr 0.6fr',
                  gap: '10px',
                  width: '50%',
                  marginBottom: '20px',
                  alignItems: 'center',
                }}
              >
                <select
                  key="year"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  style={{
                    color: '#919eab',
                    fontStyle: 'semibold',
                    fontSize: '14px',
                    border: '1px solid #dce0e4',
                    height: '54px',
                    paddingLeft: '5px',
                    paddingRight: '5px',
                    borderRadius: '8px',
                    background: 'transparent',
                    width: '100%',
                    outline: 'none',
                    borderColor: `${theme.palette.grey[500_32]} !important`,
                  }}
                >
                  {['All', 'Year 1', 'Year 2', 'Year 3', 'Year 4'].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <select
                  key="semester"
                  value={semesterFilter}
                  onChange={(e) => setSemesterFilter(e.target.value)}
                  style={{
                    color: '#919eab',
                    fontStyle: 'semibold',
                    fontSize: '14px',
                    border: '1px solid #dce0e4',
                    height: '54px',
                    paddingLeft: '5px',
                    paddingRight: '5px',
                    borderRadius: '8px',
                    background: 'transparent',
                    width: '100%',
                    outline: 'none',
                    borderColor: `${theme.palette.grey[500_32]} !important`,
                  }}
                >
                  {['All', 'Semester 1', 'Semester 2'].map((v) => (
                    <option key={v} value={v}>
                      {v}
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
                  <Iconify icon={'eva:search-fill'} sx={{ color: 'text.disabled', width: 20, height: 20, ml: '10px' }} />
                  <InputBase
                    key="search"
                    placeholder="Search by name, year, semester..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      color: '#919eab',
                      fontStyle: 'semibold',
                      fontSize: '14px',
                      padding: '10px 5px',
                      width: '100%',
                      height: '54px',
                    }}
                  />
                </Box>
              </div>
            </Box>

            {error && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="error">
                  {error}
                </Typography>
              </Box>
            )}

            {!error && filteredModules.length === 0 && (
              <ModulesNotFound searchQuery={[yearFilter, semesterFilter, searchTerm].join(' ').trim()} />
            )}

            <Grid container spacing={3}>
              {filteredModules.filter(Boolean).map((module) => {
                const semesterName = module?.expand?.semester?.name || module?.semester || 'Semester';
                return (
                  <Grid item xs={12} md={4} key={module.id}>
                    <ModuleWidget title={`${semesterName} |`} name={module.name} moduleId={module.id} />
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}
      </Container>
    </Page>
  );
}
