import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { MandoBotAPI } from '../api';

interface LoginPayload {
  username: string;
  password: string;
}

interface LoginResponse {
  username: string;
  email: string;
}

export const login = createAsyncThunk<
  LoginResponse,
  LoginPayload,
  { rejectValue: { error: string } }
>('auth/login', async ({ username, password }, thunkAPI) => {
  try {
    const response = await MandoBotAPI.login(username, password);
    return response;
  } catch (error: any) {
    if (error.response) return error.response.data;
  }
});

interface AuthState {
  username: string | null;
  email: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  username: null,
  email: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserDetails(state, action) {
      state.username = action.payload.username;
      state.email = action.payload.email;
    },
    logout(state) {
      state.username = null;
      state.email = null;
      state.loading = false;
      state.error = null;
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
        state.username = action.payload.username;
        state.email = action.payload.email;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, setUserDetails } = authSlice.actions;
export default authSlice.reducer;
