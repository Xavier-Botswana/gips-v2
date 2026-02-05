import axios from 'axios';
import { store } from '../redux/store';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().user.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.log({ error });
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;
