import PropTypes from 'prop-types';
import * as Yup from 'yup';
import merge from 'lodash/merge';

import moment from 'moment';
import { isBefore } from 'date-fns';
import { useSnackbar } from 'notistack';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Box, Stack, Button, Tooltip, TextField, IconButton, DialogActions } from '@mui/material';
import { LoadingButton, MobileDateTimePicker } from '@mui/lab';
// redux
import { useDispatch, useSelector } from '../../../redux/store';
import { createEvent, updateEvent, deleteEvent } from '../../../redux/slices/calendar';
// components
import Iconify from '../../../components/Iconify';
import { ColorSinglePicker } from '../../../components/color-utils';
import { FormProvider, RHFSelect, RHFTextField, RHFSwitch } from '../../../components/hook-form';
import axios from '../../../utils/axios';
// ----------------------------------------------------------------------

const COLOR_OPTIONS = [
  '#00AB55', // theme.palette.primary.main,
  '#1890FF', // theme.palette.info.main,
  '#54D62C', // theme.palette.success.main,
  '#FFC107', // theme.palette.warning.main,
  '#FF4842', // theme.palette.error.main
  '#04297A', // theme.palette.info.darker
  '#7A0C2E', // theme.palette.error.darker
];

const getInitialValues = (event, range) => {
  const _event = {
    title: '',
    description: '',
    textColor: '#1890FF',
    allDay: false,
    start: range ? new Date(range.start) : new Date(),
    end: range ? new Date(range.end) : new Date(),
  };

  if (event || range) {
    return merge({}, _event, event);
  }

  return _event;
};

// ----------------------------------------------------------------------

CalendarForm.propTypes = {
  event: PropTypes.object,
  range: PropTypes.object,
  onCancel: PropTypes.func,
};

export default function CalendarForm({ event, range, onCancel }) {
  const { enqueueSnackbar } = useSnackbar();
  const { record, token, isAuthenticated, isInitialized } = useSelector((state) => {
    return state.user;
  });
  const dispatch = useDispatch();
  const currentUserRole = record.role;
  const isCreating = Object.keys(event).length === 0;

  const EventSchema = Yup.object().shape({
    title: Yup.string().max(255).required('Title is required'),
    description: Yup.string().max(5000),
  });

  const methods = useForm({
    resolver: yupResolver(EventSchema),
    defaultValues: getInitialValues(event, range),
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    console.log({data})
    try {
      const newEvent = {
        title: data.title,
        description: data.description,
        textColor: data.textColor,
        participants: data.participants,
        start: data.start,
        end: data.end,
        token,
        organizerId: record.id,
      };
      if (event.id) {
        dispatch(updateEvent(event.id, newEvent));
        enqueueSnackbar('Update success!');
      } else {
        enqueueSnackbar('Create success!');
        dispatch(createEvent(newEvent));
      }
      onCancel();
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!event.id) return;
    try {
      onCancel();
      const res = axios.delete(`/v1/calendar/${event.id}`);

      dispatch(deleteEvent(event.id));
      enqueueSnackbar('Delete success!');
    } catch (error) {
      console.error(error);
    }
  };

  const values = watch();

  const isDateError = isBefore(new Date(values.end), new Date(values.start));

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3} sx={{ p: 3 }}>
        <RHFTextField name="title" label="Title" disabled={currentUserRole !== 'superAdmin' && true} />

        <RHFTextField
          name="description"
          label="Description"
          multiline
          rows={4}
          disabled={currentUserRole !== 'superAdmin' && true}
        />

        {/* <RHFSwitch name="allDay" label="All day" /> */}

        {/* {currentUserRole === 'superAdmin' && (
          <RHFSelect name="" label="Select Event Frequency">
            <option value="" />
            {['Once-off', 'Daily', 'Weekly', 'Montlhy', 'Yearly'].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </RHFSelect>
        )} */}

        {currentUserRole === 'superAdmin' && (
          <RHFSelect name="participants" label="Select Attendants">
            <option value="" />
            {['All', 'All Staff', 'Academics', 'Admissions', 'Students'].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </RHFSelect>
        )}

        {currentUserRole === 'superAdmin' ? (
          <Controller
            name="start"
            control={control}
            render={({ field }) => (
              <MobileDateTimePicker
                {...field}
                label="Start date"
                inputFormat="dd/MM/yyyy hh:mm a"
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            )}
          />
        ) : (
          <Controller
            name="start"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Start date"
                value={moment(field.value).format('MMMM Do, YYYY, h:mm:ss A')} // Format date here
                disabled
              />
            )}
          />
        )}

        {currentUserRole === 'superAdmin' ? (
          <Controller
            name="end"
            control={control}
            render={({ field }) => (
              <MobileDateTimePicker
                {...field}
                label="End date"
                inputFormat="dd/MM/yyyy hh:mm a"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!isDateError}
                    helperText={isDateError && 'End date must be later than start date'}
                  />
                )}
              />
            )}
          />
        ) : (
          <Controller
            name="end"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="End date"
                value={moment(field.value).format('MMMM Do, YYYY, h:mm:ss A')} // Format date here
                disabled
              />
            )}
          />
        )}

        {currentUserRole === 'superAdmin' && (
          <Controller
            name="textColor"
            control={control}
            render={({ field }) => (
              <ColorSinglePicker value={field.value} onChange={field.onChange} colors={COLOR_OPTIONS} />
            )}
          />
        )}
      </Stack>

      <DialogActions>
        {currentUserRole === 'superAdmin' && (
          <Tooltip title="Delete Event">
            <IconButton onClick={handleDelete}>
              <Iconify icon="eva:trash-2-outline" width={20} height={20} />
            </IconButton>
          </Tooltip>
        )}
        <Box sx={{ flexGrow: 1 }} />

        <Button variant="outlined" color="inherit" onClick={onCancel}>
          Cancel
        </Button>

        {currentUserRole === 'superAdmin' && (
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Loading...">
            Add
          </LoadingButton>
        )}
      </DialogActions>
    </FormProvider>
  );
}
