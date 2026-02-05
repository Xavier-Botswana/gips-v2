import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useSnackbar } from 'notistack';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Box, Card, Grid, Stack, Typography, Button } from '@mui/material';
// utils
// routes
import axios from '../../../utils/axios';
import { PATH_DASHBOARD } from '../../../routes/paths';
// _mock
import { countries } from '../../../_mock';
// components
import { FormProvider, RHFSelect, RHFSwitch, RHFTextField, RHFRadioGroup } from '../../../components/hook-form';
import { CheckoutNewAddressForm } from '../e-commerce/checkout';

// ----------------------------------------------------------------------
const SPONSORSHIP_OPTION = ['Government Regular', 'Government Re-Instatement', 'Private Sponsorship'];
const STATUS_OPTION = ['Approve', 'Decline'];
const CAMPUS_OPTION = ['Gaborone', 'Francistown', 'Maun'];
ApplicationsDetails.propTypes = {
  isEdit: PropTypes.bool,
  currentUser: PropTypes.object,
  applicantDetails: PropTypes.object,
};

export default function ApplicationsDetails({ isEdit, currentUser, applicantDetails }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  // ------------------------------ END HERE ----------------------------------------
  const [fileCopyOfID, setFileCopyOfID] = useState(null); // State for 'Copy of ID/Passport' file
  const [fileResultsSlip, setFileResultsSlip] = useState(null); // State for 'Copy of results slip' file
  const [fileDtef, setFileDTEF] = useState(null); // State for 'Copy of results slip' file
  const handleCopyOfIDFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    setFileCopyOfID(uploadedFile); // Set the 'Copy of ID/Passport' file to state
  };

  const handleDTEFFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    setFileDTEF(uploadedFile); // Set the 'Copy of ID/Passport' file to state
  };

  const handleResultsSlipFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    setFileResultsSlip(uploadedFile); // Set the 'Copy of results slip' file to state
  };
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const { enqueueSnackbar } = useSnackbar();

  const ApplicationsDetailsSchema = Yup.object().shape({
    accommodation: Yup.boolean,
    email: Yup.string(),
    telephone: Yup.string(),
    option_one: Yup.string(),
    option_two: Yup.string(),
    option_three: Yup.string(),
    country: Yup.string(),
    nextOfKin: Yup.string(),
    firstname: Yup.string(),
    nextOfKinNumber: Yup.string(),
    semester: Yup.string(),
    study_mode: Yup.string(),
    telphone: Yup.string(),
    sponsorname: Yup.string(),
    sponsornumber: Yup.string(),
    physical_address: Yup.string(),
    academic_year: Yup.string(),
    relationship: Yup.string(),
  });
  // console.log('111111111111111111111111111');
  // console.log(applicantDetails);
  // console.log('111111111111111111111111111');

  const dateObject = new Date(applicantDetails?.date_of_birth);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = dateObject.toLocaleDateString('en-US', options);

  const defaultValues = useMemo(
    () => ({
      accommodation: currentUser?.accommodation === true ? 'Yes' : 'No',
      email: applicantDetails?.email || '',
      telephone: currentUser?.tel_number || '',
      option_one: applicantDetails?.option_one || '',
      option_two: applicantDetails?.option_two || '',
      option_three: applicantDetails?.option_three || '',
      country: currentUser?.country || '',
      next_of_kin_name: currentUser?.next_of_kin_name || '',
      firstname: applicantDetails?.firstname || '',
      lastname: applicantDetails?.lastname || '',
      next_of_kin_number: currentUser?.next_of_kin_number || '',
      next_of_kin_address: currentUser?.next_of_kin_address || '',
      semester: currentUser?.semester || '',
      date_of_birth: formattedDate || '',
      studymode: currentUser?.study_mode || '',
      Id: applicantDetails?.national_id || '',
      telphone: currentUser?.tel_number || '',
      sponsorship: currentUser?.sponsorship || '',
      sponsorname: currentUser?.sponsorname || '',
      sponsornumber: currentUser?.sponsornumber || '',
      physical_address: currentUser?.physical_address || '',
      academic_year: currentUser?.year_of_study || '',
      relationship: currentUser?.relationship || '',
      campus: applicantDetails?.campus || '',
      postqualification: currentUser?.postqualification,
      sponsoraddress: currentUser?.sponsoraddress,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser, applicantDetails]
  );

  const methods = useForm({
    resolver: yupResolver(ApplicationsDetailsSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;
  const statusUpate = useRef('');
  const values = watch();

  useEffect(() => {
    if (isEdit && currentUser && applicantDetails) {
      reset(defaultValues);
    }

    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentUser, applicantDetails]);

  const onSubmit = async (data) => {
    try {
      const status = 'pending';
      const application = { ...values, status };
      axios.patch(`/v1/applications/${currentUser.id}`, application).then(() => {
        navigate(PATH_DASHBOARD.admissions.applicantApplicationslist);
        enqueueSnackbar('Update successful');
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (event) => {
    statusUpate.current = event.target.value;
    // console.log(statusUpate.current);
    handleClickOpen();
  };

  // view method
  const handleDownload = async (applicationId, field) => {
    try {
      const res = await axios.get(`/v1/applications/${applicationId}/file/${field}`);
      const urls = res.data.data?.fileUrls || (res.data.data?.fileUrl ? [res.data.data.fileUrl] : []);

      urls.forEach((url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    } catch (error) {
      console.error('Error fetching file:', error);
    }
  };


  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={16}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'grid',
                columnGap: 2,
                rowGap: 3,
                gridTemplateColumns: {
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                },
              }}
            >
              <RHFTextField name="firstname" label="First Name" disabled />
              <RHFTextField name="lastname" label="Last Name" disabled />
              <RHFTextField name="date_of_birth" label="Date of Birth" disabled />
              <RHFSelect name="country" label="Country" placeholder="Country" disabled>
                <option value="" />
                {countries.map((option) => (
                  <option key={option.code} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </RHFSelect>
            </Box>
            <Stack spacing={3} mt={2} mb={2}>
              <RHFTextField name="Id" label="ID NO:" disabled />
            </Stack>

            <Box
              sx={{
                display: 'grid',
                columnGap: 2,
                rowGap: 3,
                gridTemplateColumns: {
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                },
              }}
            >
              <RHFTextField name="studymode" label="Study Mode" disabled />
              <RHFTextField name="telephone" label="Telephone" disabled />
              <RHFTextField name="email" label="Email Address" disabled />
              <RHFTextField name="physical_address" label="Physical Address" disabled />
              <RHFTextField name="academic_year" label="Academic Year" disabled />
              <RHFTextField name="semester" label="Semester" disabled />
            </Box>

            <Stack spacing={3} mt={2} mb={2}>
              <RHFTextField name="option_one" label="Option One" placeholder="" disabled />

              <RHFTextField name="option_two" label="Option Two" placeholder="" disabled />

              <RHFTextField name="option_three" label="Option Three" placeholder="" disabled />

              <RHFTextField name="accommodation" label="Accomodation" disabled />
            </Stack>
            <Box
              sx={{
                display: 'grid',
                columnGap: 2,
                rowGap: 3,
                gridTemplateColumns: {
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                },
              }}
            >
              <RHFTextField name="next_of_kin_name" label="Next of Kin names" disabled />
              <RHFTextField name="next_of_kin_number" label="Next of Kin Cell Phone Number" disabled />
              <RHFTextField name="relationship" label="Relationship" disabled />
              <RHFTextField name="next_of_kin_address" label="Next of Kin Physical Address" disabled />
            </Box>

            <Box
              sx={{
                display: 'grid',
                columnGap: 2,
                rowGap: 3,
                gridTemplateColumns: {
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                },
              }}
            >
              <Stack spacing={3} mt={2} mb={2}>
                <Typography
                  sx={{
                    color: '#000000',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    display: 'flex',
                    paddingLeft: '2px',
                  }}
                >
                  Campus of Study :
                </Typography>

                <RHFRadioGroup
                  name="campus"
                  options={CAMPUS_OPTION}
                  sx={{
                    '& .MuiFormControlLabel-root': { mr: 4 },
                  }}
                  disable="true"
                />
              </Stack>

              <Stack spacing={3} mt={2} mb={2}>
                <Typography
                  sx={{
                    color: '#000000',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    display: 'flex',
                    paddingLeft: '2px',
                  }}
                >
                  SPONSORSHIP :
                </Typography>

                <RHFRadioGroup
                  name="sponsorship"
                  options={SPONSORSHIP_OPTION}
                  sx={{
                    '& .MuiFormControlLabel-root': { mr: 4 },
                  }}
                  disable="true"
                />
              </Stack>
            </Box>
            {values.sponsorship === 'Private Sponsorship' ? (
              <Stack spacing={3} mt={2} mb={2}>
                <Box
                  sx={{
                    display: 'grid',
                    columnGap: 2,
                    rowGap: 3,
                    gridTemplateColumns: {
                      xs: 'repeat(1, 1fr)',
                      sm: 'repeat(2, 1fr)',
                    },
                  }}
                >
                  <RHFTextField name="postqualification" label="Post School Qualification" />
                  <RHFTextField name="sponsorname" label="Sponsor Name" />
                  <RHFTextField name="sponsornumber" label="Sponsor Phone Number" />
                  <RHFTextField name="sponsoraddress" label="Sponsor Physical Address" />
                </Box>
              </Stack>
            ) : (
              ''
            )}

            <Box sx={{ marginBottom: 2 }}>
              <Box
                sx={{
                  display: 'grid',
                  columnGap: 2,
                  rowGap: 3,
                  gridTemplateColumns: {
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                  },
                }}
              >
                <div>
                  <Typography variant="subtitle1" gutterBottom>
                    Copy of your ID/Passport
                  </Typography>

                  <div
                    style={{
                      border: '1px dashed #0000FF',
                      borderRadius: '8px',
                    }}
                  >
                    <label htmlFor="copy_of_id" style={{ display: 'block' }}>
                      <input
                        id="idCopy"
                        type="file"
                        onChange={handleCopyOfIDFileChange}
                        style={{ display: 'none', border: 'none' }}
                      />
                      <Button
                        variant="outlined"
                        size="large"
                        fullWidth
                        onClick={() =>
                          handleDownload(currentUser?.id, 'copy_of_id')
                        }
                      >
                        View Copy of ID
                      </Button>
                    </label>
                  </div>
                </div>
                <div>
                  <Typography variant="subtitle1" gutterBottom>
                    Copy of results slip
                  </Typography>
                  <div
                    style={{
                      border: '1px dashed #0000FF',
                      borderRadius: '8px',
                    }}
                  >
                    <label htmlFor="results_slip" style={{ display: 'block' }}>
                      <input
                        id="resultsSlip"
                        type="file"
                        onChange={handleResultsSlipFileChange}
                        style={{ display: 'none', border: 'none' }}
                      />
                      <Button
                        variant="outlined"
                        size="large"
                        fullWidth
                        onClick={() =>
                          handleDownload(currentUser?.id, 'results_slip')
                        }
                      >
                        View Results Slip
                      </Button>
                    </label>
                  </div>
                </div>
              </Box>
            </Box>

            {currentUser.status === 'pending' ? (
              <Stack spacing={1} mt={2} mb={2}>
                <Typography
                  sx={{
                    color: '#000000',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    display: 'flex',
                    paddingLeft: '2px',
                  }}
                >
                  Update Status
                </Typography>

                <div style={{ width: 'fit-content' }}>
                  <RHFRadioGroup
                    onClick={handleChange}
                    name="status"
                    options={STATUS_OPTION}
                    sx={{
                      '& .MuiFormControlLabel-root': { mr: 4 },
                    }}
                  />
                </div>
              </Stack>
            ) : (
              ''
            )}

            <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
              <Button
                type="button"
                color="inherit"
                component={RouterLink}
                to={PATH_DASHBOARD.admissions.applicationlist}
                variant="outlined"
                size="large"
              >
                Discard
              </Button>
              {currentUser.status === 'declined' ? (
                <Button type="submit" variant="contained" loading={isSubmitting} size="large">
                  Finish
                </Button>
              ) : (
                ''
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {statusUpate.current === 'Approve' ? (
        <CheckoutNewAddressForm
          email={applicantDetails.email}
          status="approved"
          name={applicantDetails.firstname}
          open={open}
          onClose={handleClose}
          applicationID={applicantDetails.id}
        />
      ) : (
        <CheckoutNewAddressForm
          email={applicantDetails.email}
          status="declined"
          open={open}
          name={applicantDetails.firstname}
          onClose={handleClose}
          applicationID={applicantDetails.id}
        />
      )}
    </FormProvider>
  );
}
