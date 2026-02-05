import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Box, Card, Grid, Stack, Button } from '@mui/material';
// utils
import axios from '../../../utils/axios';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import { FormProvider, RHFTextField } from '../../../components/hook-form';

StudentResultsForm.propTypes = {
  isEdit: PropTypes.bool,
  currentUser: PropTypes.object,
  moduleId: PropTypes.string,
};

const toNumber = (value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
};

export default function StudentResultsForm({ isEdit, currentUser, moduleId }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [moduleData, setModuleData] = useState(undefined);

  const student = useMemo(
    () => currentUser?.expand?.studentId || currentUser?.student || {},
    [currentUser?.expand?.studentId, currentUser?.student]
  );

  const ResultsSchema = Yup.object().shape({
    assignmentMark: Yup.number().transform(toNumber).min(0).max(100).nullable(true),
    midSemesterMark: Yup.number().transform(toNumber).min(0).max(100).nullable(true),
    examMark: Yup.number().transform(toNumber).min(0).max(100).nullable(true),
    supplementaryMark: Yup.number().transform(toNumber).min(0).max(100).nullable(true),
    nonCreditAssessments: Yup.number().transform(toNumber).min(0).max(100).nullable(true),
  });

  const defaultValues = useMemo(
    () => ({
      studentNumber: student?.national_id || currentUser?.studentId || student?.id || '',
      courseName: student?.prog_name || currentUser?.courseName || currentUser?.expand?.courseId?.course_name || '',
      firstname: student?.firstname || currentUser?.firstname || '',
      lastname: student?.lastname || currentUser?.lastname || '',
      year_of_study: student?.year_of_study || currentUser?.year_of_study || currentUser?.yearOfStudy || '',
      semester: currentUser?.semester || '',

      assignmentMark: currentUser?.assignmentMark ?? '',
      midSemesterMark: currentUser?.midSemesterMark ?? '',
      examMark: currentUser?.examMark ?? '',
      supplementaryMark: currentUser?.supplementaryMark ?? '',
      nonCreditAssessments: currentUser?.nonCreditAssessments ?? '',
      moduleMark: currentUser?.moduleMark ?? '',

      phoneNumber: student?.phoneNumber || currentUser?.phoneNumber || '',
      next_of_kin_name: student?.next_of_kin_name || currentUser?.next_of_kin_name || '',
      relationship: student?.relationship || currentUser?.relationship || '',
      next_of_kin_number: student?.next_of_kin_number || currentUser?.next_of_kin_number || '',
      sponsorship: student?.sponsor || currentUser?.sponsorship || currentUser?.sponsor || '',
    }),
    [currentUser, student]
  );

  const methods = useForm({
    resolver: yupResolver(ResultsSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    const getModuleData = async () => {
      if (!moduleId) return;

      try {
        const response = await axios.get(`/v1/modules/${moduleId}`);
        setModuleData(response.data);
      } catch (error) {
        console.error('Failed to load module:', error);
        setModuleData(undefined);
      }
    };

    getModuleData();
  }, [moduleId]);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset, isEdit]);

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const markPayload = {
        assignmentMark: values.assignmentMark,
        midSemesterMark: values.midSemesterMark,
        examMark: values.examMark,
        supplementaryMark: values.supplementaryMark,
        nonCreditAssessments: values.nonCreditAssessments,
      };

      if (currentUser?.id) {
        await axios.patch(`/v1/results/${currentUser.id}`, {
          ...markPayload,
          status: 'pending',
          progressionStatus: 'pending',
        });

        enqueueSnackbar('Results updated successfully!');
      } else {
        const basePayload = {
          studentId: currentUser?.studentId || student?.id,
          moduleId: currentUser?.moduleId || moduleId,
          courseId: currentUser?.courseId,
          facultyId: currentUser?.facultyId,
          yearOfStudy: currentUser?.yearOfStudy,
          semester: currentUser?.semester,
          semesterId: currentUser?.semesterId,
          lecturerId: currentUser?.lecturerId,
          status: 'pending',
          progressionStatus: 'pending',
        };

        await axios.post('/v1/results', {
          ...basePayload,
          ...markPayload,
        });

        enqueueSnackbar('Results captured successfully!');
      }

      navigate(`${PATH_DASHBOARD.admissions.studentResultsList}/${moduleId}`);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to save results', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
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

              <RHFTextField name="studentNumber" label="Student Number" disabled />
              <RHFTextField name="courseName" label="Course Name" disabled />

              <RHFTextField name="year_of_study" label="Academic Year" disabled />
              <RHFTextField name="semester" label="Semester" disabled />

              <RHFTextField
                name="assignmentMark"
                label={`Assignment Mark (Weight: ${moduleData?.assignment_weight ?? '-'}%)`}
              />
              <RHFTextField
                name="midSemesterMark"
                label={`Mid Semester Mark (Weight: ${moduleData?.mid_semester_weight ?? '-'}%)`}
              />

              <RHFTextField name="supplementaryMark" label="Supplement (only if failed)" />
              <RHFTextField name="nonCreditAssessments" label="Non-credit Bearing Assessments" />

              <RHFTextField name="examMark" label={`Examination Mark (Weight: ${moduleData?.exam_weight ?? '-'}%)`} />
              <RHFTextField name="moduleMark" label="Module Mark" disabled />

              <RHFTextField name="phoneNumber" label="Telephone Number" disabled />
              <RHFTextField name="next_of_kin_name" label="Next of Kin" disabled />

              <RHFTextField name="relationship" label="Relationship" disabled />
              <RHFTextField name="next_of_kin_number" label="Next of Kin Cell Phone Number" disabled />
            </Box>

            <Stack spacing={3} mt={2} mb={2}>
              <RHFTextField name="sponsorship" label="Sponsorship" disabled />
            </Stack>

            <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
              <Button
                type="button"
                color="inherit"
                variant="outlined"
                size="large"
                onClick={() => {
                  navigate(`${PATH_DASHBOARD.admissions.studentResultsList}/${moduleId}`);
                }}
              >
                Discard
              </Button>
              <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                {isEdit ? 'Update' : 'Save'}
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
