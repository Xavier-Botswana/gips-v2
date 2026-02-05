import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useState, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate, useLocation } from 'react-router-dom';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton, DesktopDatePicker } from '@mui/lab';
import {
  Card,
  Stack,
  Button,
  Grid,
  Box,
  Typography,
  TextField,
  Dialog,
  Divider,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider as MuiSlider,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import axios from '../../../utils/axios';

import useAuth from '../../../hooks/useAuth';
import { logout } from '../../../redux/slices/auth';

// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// _mock
import { countries } from '../../../_mock';
// components
import { FormProvider, RHFSelect, RHFTextField, RHFRadioGroup } from '../../../components/hook-form';

// ----------------------------------------------------------------------
const SPONSORSHIP_OPTION = ['Government Regular', 'Government Re-Instatement', 'Private Sponsorship'];
const ACADEMIC_YEAR_OPTION = [
  { label: 'Year 1', key: 1 },
  { label: 'Year 2', key: 2 },
  { label: 'Year 3', key: 3 },
  { label: 'Year 4', key: 4 },
];

SemesterRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  currentUser: PropTypes.object,
};

export default function SemesterRegistrationForm({ isEdit }) {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [autoWidth, setAutoWidth] = useState(24);
  const [open, setOpen] = useState(false);
  const [semesters, setSemesters] = useState();
  const dispatch = useDispatch();
  const [openSent, setOpenSent] = useState(false);
  const navigate = useNavigate();
  const { state } = useLocation();

  const { enqueueSnackbar } = useSnackbar();
  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const NewUserSchema = Yup.object().shape({});
  const defaultValues = useMemo(
    () => ({
      email: state?.email || '',
      tr_number: state?.trnumber || '',
      semester: state?.openSemester?.name || '',
      telephone: state?.tel_number || '',
      option_one: state?.option_one || '',
      country: state?.country || '',
      next_of_kin_name: state?.next_of_kin_name || '',
      name: state?.username || '',
      firstname: state?.firstname || '',
      lastname: state?.lastname || '',
      next_of_kin_number: state?.next_of_kin_number || '',
      next_of_kin_address: state?.next_of_kin_address || '',
      date_of_birth: state?.date_of_birth || '',
      studymode: state?.study_mode || '',
      id_number: state?.national_id || '',
      phoneNumber: state?.phoneNumber || state?.phone_number || '',
      telphone: state?.tel_number || '',
      sponsorship: state?.sponsorship || '',
      sponsorname: state?.sponsorname || '',
      sponsornumber: state?.sponsornumber || '',
      physical_address: state?.physical_address || '',
      academic_year: state?.year_of_study || '',
      relationship: state?.relationship || '',
      campus: state?.campus || '',
      postqualification: state?.postqualification,
      sponsoraddress: state?.sponsoraddress,
      fileCopyOfID: state?.copy_of_id,
    }),

    [state]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    const getCurrentStudentSemester = async () => {
      await axios.get(`/v1/semesters/${state.semester_id}`).then((response) => {
        setValue('semester', response.data.name);
      });
    };
    getCurrentStudentSemester();

    if (isEdit && state) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, state]);

  const onSubmit = async (data) => {
    try {
      // const semester = semesters.find((sm) => {
      //   return sm.id === values?.semester;
      // });
      // dispatch(logout());
      navigate(PATH_DASHBOARD.student.semesterModules, {
        state: {
          studyYear: values?.academic_year,
          year_of_study: `${values?.academic_year}`,
          semesterId: state.openSemester?.id,
          semesterName: state.openSemester?.name,
          sem_start_date: state.openSemester?.start_date,
          sem_end_date: state.openSemester?.end_date,
          data: state,
          phoneNumber: values.phoneNumber,
          next_of_kin_number: values.next_of_kin_number,
          physical_address: values.physical_address,
          // next_of_kin_address:values.next_of_kin_address,
          relationship: values.relationship,
        },
      });
    } catch (error) {
      console.error(error);
    }
  };
  // --------------------------- START ==> OPTIONS PART -------------------------------------------
  const [options, setOptions] = useState([]);

  // ------------------------------ END HERE ----------------------------------------

  // ------------------------------------------------------------------------------------------------
  const [fileCopyOfID, setFileCopyOfID] = useState(null); // State for 'Copy of ID/Passport' file
  const [fileResultsSlip, setFileResultsSlip] = useState(null); // State for 'Copy of results slip' file

  const handleCopyOfIDFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    setFileCopyOfID(uploadedFile); // Set the 'Copy of ID/Passport' file to state
  };

  const handleResultsSlipFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    setFileResultsSlip(uploadedFile); // Set the 'Copy of results slip' file to state
  };

  return (
    <>
      <Dialog fullWidth maxWidth="sm" open={open || openSent}>
        <DialogTitle>{openSent ? 'Application Sent ' : 'Application Email Address'} </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {openSent
                ? 'Your application has been sent successfully. We will get back to you after reviewing your application, Thank you'
                : `The email address ${values.email} you have used is already in use by another application ,please use a different email address.`}
            </Typography>
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions>
          <>
            <Button
              color="inherit"
              variant="outlined"
              onClick={() => {
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="contained"
              onClick={() => {
                setOpen(false);
                if (openSent) {
                  navigate(PATH_DASHBOARD.general.apply);
                }
              }}
              loading={isSubmitting}
            >
              okay
            </LoadingButton>
          </>
        </DialogActions>
      </Dialog>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={16}>
            <Card sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'grid',
                  columnGap: 2,
                  rowGap: 3,
                  gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                }}
              >
                {/* <RHFTextField name="academic_year" label="Academic year" disabled/> */}
                <RHFSelect name="academic_year" label="Academic year">
                  <option value="" />
                  {ACADEMIC_YEAR_OPTION.map((option, index) => (
                    <option key={index} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </RHFSelect>
                {/* <RHFSelect name="semester" label="Semester">
                  <option value="" />
                  {semesters?.map((option, index) => (
                    <option key={index} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </RHFSelect> */}
                <RHFTextField name="semester" label="Semester" disabled />
                <RHFTextField name="firstname" label="Firstname" />
                <RHFTextField name="lastname" label="Lastname" />
              </Box>
              <Stack spacing={3} mt={2} mb={2}>
                <RHFTextField name="email" label="Email Address" disabled />
              </Stack>
              <Stack spacing={3} mt={2} mb={2}>
                <RHFTextField name="physical_address" label="Physical Address" />
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  columnGap: 2,
                  rowGap: 3,
                  gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                }}
              >
                {' '}
                <RHFTextField name="tr_number" label="TR Number" disabled />
                <RHFTextField name="id_number" label="ID/Passport Number" disabled />
                <RHFTextField name="phoneNumber" label="Phone Number" />
                <RHFTextField name="next_of_kin_number" label="Next of Kin Cell Phone Number" />
                <RHFTextField name="next_of_kin_name" label="Next of Kin names" />
                <RHFTextField name="relationship" label="Relationship" />
                {/* <RHFTextField name="next_of_kin_address" label="Next of Kin Physical Address" /> */}
              </Box>
              {/* <Box
                sx={{
                  display: 'grid',
                  columnGap: 2,
                  rowGap: 3,
                  gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                }}
              >
                <Stack spacing={3} mt={2} mb={2}>
                  <Typography
                    sx={{ color: '#000000', fontWeight: 'bold', fontSize: '13px', display: 'flex', paddingLeft: '2px' }}
                  >
                    SPONSORSHIP :
                  </Typography>

                  <RHFRadioGroup
                    name="sponsorship"
                    options={SPONSORSHIP_OPTION}
                    sx={{
                      '& .MuiFormControlLabel-root': { mr: 4 },
                    }}
                  />
                </Stack>
              </Box> */}

              <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
                <Button type="button" color="inherit" variant="outlined" size="large">
                  Discard
                </Button>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting} size="large">
                  Next
                </LoadingButton>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}

// ----------------------------------------------------------------------
