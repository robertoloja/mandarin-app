import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { MandoBotAPI } from '../api';

interface LoginPayload {
  username: string;
  password: string;
}

interface LoginResponse {
  user: string;
  token: string;
}

export const login = createAsyncThunk<LoginResponse, LoginPayload>(
  'auth/login',
  async ({ username, password }, thunkAPI) => {
    try {
      const response = await MandoBotAPI.login(username, password);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || 'login failed');
    }
  },
);

interface AuthState {
  user: string | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
