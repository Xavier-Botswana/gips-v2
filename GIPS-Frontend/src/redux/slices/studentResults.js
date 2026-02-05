import { createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const initialState = {
  record: null,
};

const slice = createSlice({
  name: 'moduleResults',
  initialState,
  reducers: {
    // ADD RESULTS
    addResults(state, action) {
      state.record = action.payload;
    },
    // GET Results
    getResults(state, action) {
      state.record = action.payload;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const {addResults, getResults } = slice.actions;




// ----------------------------------------------------------------------
