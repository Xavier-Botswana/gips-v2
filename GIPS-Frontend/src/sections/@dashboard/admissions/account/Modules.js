import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import {
  Box,
  Radio,
  FormControlLabel,
  FormControl,
  FormGroup,
  RadioGroup,
  FormLabel,
  Card,
  Button,
  Typography,
  Stack,
  Link,
  IconButton,
  Checkbox,
} from '@mui/material';
import axios from '../../../../utils/axios';
import useAuth from '../../../../hooks/useAuth';
// components
import { FormProvider, RHFTextField } from '../../../../components/hook-form';
import { PATH_DASHBOARD } from '../../../../routes/paths';

// ----------------------------------------------------------------------

export default function Modules({ state }) {
  const { enqueueSnackbar } = useSnackbar();
  const { record } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [recordReg, setRegRecord] = useState();
  const [checkedModules, setCheckedItems] = useState([]);

  async function fetchFileFromURL(url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error fetching file:', error);
      throw error;
    }
  }

  useEffect(() => {
    axios
      .get(`/v1/registration/by-tr/${state.data.tr_number}`)
      .then((response) => {
        const found = (response.data?.data || []).find((record_) => record_.registration_type === '');
        setRegRecord(found);
      })
      .catch((error) => {
        console.error('Error fetching registration record:', error);
        setRegRecord(undefined);
      });

    axios
      .get(`/v1/modules/course/${state.data.course_id}`)
      .then((response) => {
        // year_of_study might be "Year 1", "Year 2", etc.
        const yearKey = state?.year_of_study.slice(-1); // e.g. "1", "2", ...
        const semesterName = state.data.openSemester?.name; // e.g. "Semester 1 2023/24"

        // Safely find the key that includes the semester name
        const semesterKey = Object.keys(response.data[yearKey] || {}).find((key) => key.includes(semesterName));

        if (semesterKey) {
          const allSemesterModules = response.data[yearKey][semesterKey];
          setModules(allSemesterModules);
        } else {
          console.log('Semester data not found!');
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [state.data.course_id, state.data.openSemester?.name, state.data.tr_number, state?.year_of_study]);

  const handleSelectAll = () => {
    setCheckedItems(modules);
  };

  const handleClearAll = () => {
    setCheckedItems([]);
  };

  const handleCheckboxChange = (event) => {
    const itemName = event.target.value;

    if (event.target.checked) {
      const moduleObject = modules.find((itm) => itm.name === itemName);

      setCheckedItems((prevItems) => {
        if (!prevItems.some((mod) => mod.name === itemName)) {
          return [...prevItems, moduleObject];
        }
        return prevItems;
      });
    } else {
      setCheckedItems((prevItems) => prevItems.filter((item) => item.name !== itemName));
    }
  };

  const onSubmit = async () => {
    let blob;
    let blob1;
    let blob2;

    if (recordReg?.id && recordReg?.tr_number && recordReg?.tr_number !== '' && recordReg?.tr_number !== 'N/A') {
      const getExistingBlob = async (field) => {
        try {
          const res = await axios.get(`/v1/registration/${recordReg.id}/file/${field}`);
          const fileUrl = res.data.data?.fileUrl;
          if (!fileUrl) return null;
          return await fetchFileFromURL(fileUrl);
        } catch (err) {
          return null;
        }
      };

      try {
        if (recordReg?.copy_of_id) blob = await getExistingBlob('copy_of_id');
        if (recordReg?.results_slip) blob1 = await getExistingBlob('results_slip');
        if (recordReg?.sponsorship_letter) blob2 = await getExistingBlob('sponsorship_letter');
      } catch (error) {
        console.error(error);
      }
    }

    const modulesJSON = JSON.stringify(checkedModules);

    try {
      const formData = new FormData();
      formData.append('names', state.data?.firstname);
      formData.append('surname', state.data?.lastname);
      formData.append('prog_name', state.data.expand.course_id?.course_name);
      formData.append('email', state.data?.email);
      formData.append('student_id', state.data?.id);
      formData.append('prog_code', state.data.expand.course_id?.program_code);
      formData.append('study_mode', state.data?.study_mode);
      formData.append('date_of_birth', state.data?.date_of_birth);
      formData.append('inst', 'GIPS - GABORONE CENTRE');
      formData.append('tr_number', state.data?.tr_number);
      formData.append('campus', recordReg?.campus);
      formData.append('sponsor', recordReg?.sponsor);
      formData.append('accomo', recordReg?.accomo);
      formData.append('year_of_study', state?.year_of_study);
      formData.append('semester_id', state?.semesterId);
      formData.append('study_semester', state?.semesterName);
      formData.append('sem_start_date', state?.sem_start_date);
      formData.append('sem_end_date', state?.sem_end_date);
      formData.append('modules', modulesJSON);
      formData.append('idNumber', state.data?.national_id);
      formData.append('country', state.data?.country);
      formData.append('phoneNumber', state.phoneNumber || state.data?.phoneNumber);
      formData.append('next_of_kin_name', state.data?.next_of_kin_name);
      formData.append('next_of_kin_number', state.data?.next_of_kin_number);
      formData.append('next_of_kin_address', recordReg?.next_of_kin_address);
      formData.append('relationship', state?.relationship);
      formData.append('reg_status', 'pending');
      formData.append('course_id', state.data?.course_id);
      formData.append('dtef_status', 'pending');
      formData.append('registration_type', 'Returning');
      formData.append('batch_upload', state.data?.batch_upload || "false");
      // Append the existing documents if they exist
      if (blob && recordReg?.copy_of_id) {
        formData.append('copy_of_id', blob, recordReg?.copy_of_id || "");
      }
      if (blob1 && recordReg?.results_slip) {
        formData.append('results_slip', blob1, recordReg?.results_slip || "");
      }
      if (blob2 && recordReg?.sponsorship_letter) {
        formData.append('sponsorship_letter', blob2, recordReg?.sponsorship_letter || "");
      }

      await axios.post('/v1/registration', formData);

      await axios.patch(`/v1/students/${state.data?.id}`, formData);

      enqueueSnackbar('Registration completed successfully');
      navigate(PATH_DASHBOARD.student.register);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card sx={{ p: 4 }}>
      <FormProvider>
        <Typography
          sx={{
            color: '#437ba6',
            fontWeight: 'bold',
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {state?.studyYear} Students
        </Typography>

        <FormLabel sx={{ ml: 4 }} id="demo-form-control-label-placement">
          Modules | {state?.semesterName}
        </FormLabel>

        {state.data?.reg_status !== 'approved' && (
          <Stack direction="row" spacing={2} sx={{ ml: 8, mb: 2 }}>
            <Button variant="outlined" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button variant="outlined" onClick={handleClearAll}>
              Clear All
            </Button>
          </Stack>
        )}

        <FormGroup aria-labelledby="demo-form-control-label-placement" name="position" sx={{ pl: 8 }}>
          {modules.map((item, index) => {
            const isChecked = checkedModules.some((mod) => mod.name === item.name);

            return (
              <FormControlLabel
                key={index}
                value={item.name}
                control={
                  <Checkbox
                    checked={state.data?.reg_status === 'approved' ? true : isChecked}
                    onChange={handleCheckboxChange}
                    disabled={state.data?.reg_status === 'approved'}
                  />
                }
                label={item.name}
              />
            );
          })}
        </FormGroup>

        <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
          <Button
            type="button"
            color="inherit"
            component={RouterLink}
            to={PATH_DASHBOARD.student.register}
            variant="outlined"
            size="large"
          >
            Discard
          </Button>

          <Button variant="contained" size="large" onClick={onSubmit} disabled={state.data?.reg_status === 'approved'}>
            {state.data?.reg_status === 'approved' ? 'Registered' : 'Register'}
          </Button>
        </Stack>
      </FormProvider>
    </Card>
  );
}
