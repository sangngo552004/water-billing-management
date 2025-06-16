import { createSlice } from '@reduxjs/toolkit';
import { fetchContracts } from './contractService';

const initialState = {
  contracts: [],
  status: 'idle',
  error: null,
};

const contractSlice = createSlice({
  name: 'contracts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContracts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchContracts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.contracts = action.payload; 
      })
      .addCase(fetchContracts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; 
      });
  },
});

export default contractSlice.reducer;