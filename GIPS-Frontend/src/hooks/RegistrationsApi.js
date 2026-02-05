/* eslint-disable camelcase */
import axios from 'axios';

const sendToDtefRegistrations = async (details) => {
  const { expand, id, modules, prog_name, accomo, sem_end_date, sem_start_date, year_of_study, study_semester, campus } = details;
  const { national_id, firstname, lastname } = expand.guest_id || {};
  const { program_code } = expand.option_one || {};

  const payload = {
    national_id,
    firstname,
    lastname,
    prog_name,
    program_code,
    campus,
    accomo,
    year_of_study,
    study_semester,
    sem_start_date,
    sem_end_date,
    modules,
  };

  try {
    await axios.post('/v1/dtef/registrations', payload);
    await axios.patch(`api/v1/registration/${id}`, { dtefStatus: true });
  } catch (error) {
    console.error('DTEF registration failed', error);
  }
};

export default sendToDtefRegistrations;
