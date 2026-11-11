import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { User } from "../../types/user";
import { authService } from "../../services/authService";
import { accessTokenService } from "../../services/accessTokenService";
import { refreshTokenService } from "../../services/refershTokenService";
import type { ErrorResponse } from "@/types";
import type { AxiosError } from "axios";
import { userIdService } from "@/services/userIdService";

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

// Helper for avatar URL
const getAvatarUrl = (avatarId?: string | null): string | null => {
  if (!avatarId) return null;
  if (avatarId.startsWith("http") || avatarId.startsWith("blob:")) {
    return avatarId;
  }
  return `https://spots.pp.ua/api/v2/users/avatars/${avatarId}`;
};

// ==========================================
// ASYNC THUNKS
// ==========================================

export const login = createAsyncThunk(
  "auth/login",
  async (
    { emailLogin, password }: { emailLogin: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const data = await authService.login(emailLogin, password);
      accessTokenService.save(data.access_token);
      refreshTokenService.save(data.refresh_token);
      
      const rawData = data as any;
      const avatarField = rawData.avatar_url || rawData.avatar;

      return {
        id: rawData.id,
        name: rawData.display_name || rawData.name,
        email: rawData.email,
        avatar: getAvatarUrl(avatarField),
      } as User;
    } catch (err: any) {
      return rejectWithValue(err as AxiosError<ErrorResponse>);
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
      userIdService.save(data.id);

      const rawData = data as any;
      const avatarField = rawData.avatar_url || rawData.avatar;

      return {
        id: rawData.id,
        name: rawData.display_name || rawData.name,
        email: rawData.email,
        avatar: getAvatarUrl(avatarField),
      } as User;
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

    const rawData = data as any;
    const avatarField = rawData.avatar_url || rawData.avatar;

    return {
      id: rawData.id,
      name: rawData.display_name || rawData.name,
      email: rawData.email,
      avatar: getAvatarUrl(avatarField),
    } as User;
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

// ==========================================
// SLICE & REDUCERS
// ==========================================

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<Partial<User> & { display_name?: string; avatar_url?: string }>) => {
      if (state.currentUser && action.payload) {
        const raw = action.payload as any;
        const mappedName = raw.display_name || raw.name;
        const avatarField = raw.avatar_url || raw.avatar;

        state.currentUser = {
          ...state.currentUser,
          ...(mappedName !== undefined ? { name: mappedName } : {}),
          ...(raw.email !== undefined ? { email: raw.email } : {}),
          ...(avatarField !== undefined ? { avatar: getAvatarUrl(avatarField) } : {}),
        };
      }
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
        state.currentUser = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Login failed";
      });

    builder.addCase(activate.fulfilled, (state, action) => {
      state.currentUser = action.payload;
    });

    builder
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isChecked = true;
        if (action.payload) {
          state.currentUser = action.payload as User;
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isChecked = true;
      });

    builder
      .addCase(logout.fulfilled, (state) => {
        state.currentUser = null;
      })
      .addCase(logout.rejected, (state) => {
        state.isChecked = true;
      });
  },
});

// ==========================================
// EXPORTS (ACTIONS & REDUCER)
// ==========================================

export const actions = {
  ...authSlice.actions,
  login,
  activate,
  checkAuth,
  logout,
};

export default authSlice.reducer;