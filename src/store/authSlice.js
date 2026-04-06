import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const LOCAL_STORAGE_KEY = "gh_user";

const readStoredUser = () => {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    return null;
  }
};

const persistUser = (nextUser) => {
  if (typeof window === "undefined") return;
  if (nextUser) {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextUser));
  } else {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
};

export const refreshUser = createAsyncThunk(
  "auth/refreshUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        return rejectWithValue("Not authenticated");
      }

      const json = await response.json();
      return json?.data?.user || json?.data || json || null;
    } catch (error) {
      return rejectWithValue(error?.message || "Unable to refresh user");
    }
  }
);

const initialState = {
  user: readStoredUser(),
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.status = action.payload ? "succeeded" : "idle";
      state.error = null;
      persistUser(action.payload);
    },
    clearUser(state) {
      state.user = null;
      state.status = "idle";
      state.error = null;
      persistUser(null);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "succeeded";
        state.error = null;
        persistUser(action.payload);
      })
      .addCase(refreshUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
        if (!state.user) {
          persistUser(null);
        }
      });
  },
});

export const { setUser, clearUser } = authSlice.actions;
export const authActions = authSlice.actions;

export default authSlice.reducer;
