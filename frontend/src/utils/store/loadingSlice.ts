import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  percentLoaded: 100,
};

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    updateLoading(state, action: PayloadAction<{ percent: number }>) {
      state.percentLoaded = action.payload.percent;
    },
  },
});

export const { updateLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
