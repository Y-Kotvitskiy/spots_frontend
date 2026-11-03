import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { User } from "../../types/user";
import { authService } from "../../services/authService";
import { accessTokenService } from "../../services/accessTokenService";
import { refreshTokenService } from "../../services/refershTokenService";

interface AuthState {
  currentUser: User | null;
  isChecked: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  currentUser: null,
  isChecked: false,
  loading: false,
  error: null,
};

// Асинхронные экшены (Thunks)
export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const data = await authService.login(email, password);
      accessTokenService.save(data.access_token);
      refreshTokenService.save(data.refresh_token);
      return { name: data.display_name, email: data.email } as User;
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  },
);

export const activate = createAsyncThunk(
  "auth/activate",
  async (token: string, { rejectWithValue }) => {
    try {
      const data = await authService.activate(token);
      accessTokenService.save(data.access_token);
      refreshTokenService.save(data.refresh_token);
      return { name: data.display_name, email: data.email } as User;
    } catch (error: any) {
      return rejectWithValue(error.message || "Activation failed");
    }
  },
);

export const checkAuth = createAsyncThunk("auth/checkAuth", async () => {
  try {
    const data = await authService.refresh();
    accessTokenService.save(data.access_token);
    refreshTokenService.save(data.refresh_token);
    return { name: "Display_name", email: "user@example.com" };
  } catch (error) {
    console.log("User is not authenticated");
    throw error;
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await authService.logout();
  } finally {
    accessTokenService.remove();
    refreshTokenService.remove();
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Login failed";
      });

    // Activate
    builder.addCase(activate.fulfilled, (state, action) => {
      state.currentUser = action.payload;
    });

    // Check Auth
    builder
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isChecked = true;
        action.payload && (state.currentUser = action.payload);
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isChecked = true;
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.currentUser = null;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.currentUser = null;
      });
  },
});

export const actions = {
  ...authSlice.actions,
  login,
  activate,
  checkAuth,
  logout,
};
export default authSlice.reducer;
