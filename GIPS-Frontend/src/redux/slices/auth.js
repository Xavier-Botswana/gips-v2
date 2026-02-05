import { createSlice } from '@reduxjs/toolkit';

// utils
import axios from '../../utils/axios';
//
import { dispatch } from '../store';

// ----------------------------------------------------------------------

const initialState = {
  isAuthenticated: false,
  isInitialized: true,
  record: null,
  token: null,
};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.isAuthenticated = true;
      state.isInitialized = true;
      state.record = action.payload.user;
      state.token = action.payload.token;
    },
    logout(state, action) {
      state.isAuthenticated = false;
      state.isInitialized = true;
      state.record = null;
      state.token = null;
    },

    updateProfile(state, action) {
      state.record = action.payload.user;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { loginSuccess, logout,updateProfile } = slice.actions;



export async function login(identity, password) {
  try {
    const response = await axios.post('/v1/users/login', {
      identity,
      password,
    });
    dispatch(slice.actions.loginSuccess(response.data));
  } catch (error) {
    console.error(error);
  }
}
