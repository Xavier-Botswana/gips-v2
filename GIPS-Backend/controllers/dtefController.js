const HTTP_STATUS = require('../utils/httpStatus');
const axios = require('axios');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { axiosConfig } = require('../middlewares/timeout');

const DTEF_TOKEN_URL = 'https://tef2.gov.bw/rest/session/token';
const DTEF_POST_URL = 'https://tef2.gov.bw/api/post/studentregistration?_format=hal_json';

exports.sendRegistration = catchAsync(async (req, res, next) => {
  const {
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
  } = req.body || {};

  const required = {
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

  const missing = Object.entries(required)
    .filter(([, value]) => value === undefined || value === null || value === '')
    .map(([key]) => key);

  if (missing.length) {
    return next(new AppError(`Missing required fields: ${missing.join(', ')}`, 400));
  }

  const username = process.env.DTEF_USERNAME;
  const password = process.env.DTEF_PASSWORD;

  if (!username || !password) {
    return next(new AppError('DTEF credentials are not configured on the server', 500));
  }

  const payload = JSON.stringify({
    id: [{ value: `${national_id}` }],
    names: [{ value: `${firstname}` }],
    surname: [{ value: `${lastname}` }],
    prog_name: [{ value: `${prog_name}` }],
    prog_code: [{ value: `${program_code}` }],
    inst: [{ value: 'Gaborone Institute of Professional Studies' }],
    campus: [{ value: `${campus}` }],
    accomo: [{ value: `${accomo}` }],
    study_year: [{ value: `${year_of_study}` }],
    study_semester: [{ value: `${study_semester}` }],
    sem_start_date: [{ value: `${sem_start_date}` }],
    sem_end_date: [{ value: `${sem_end_date}` }],
    modules: [{ value: `${modules}` }],
  });

  const basicAuthHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

  try {
    const tokenResponse = await axios.get(DTEF_TOKEN_URL, axiosConfig('dtef'));
    const token = tokenResponse.data;

    await axios.post(DTEF_POST_URL, payload, {
      ...axiosConfig('dtef'),
      maxBodyLength: Infinity,
      headers: {
        Accept: '*/*',
        'X-CSRF-Token': token,
        'Content-Type': 'application/hal+json',
        Authorization: basicAuthHeader,
      },
    });

    return res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'DTEF registration submitted' });
  } catch (error) {
    return next(new AppError(`DTEF registration failed: ${error.message}`, error.response?.status || 502));
  }
});
