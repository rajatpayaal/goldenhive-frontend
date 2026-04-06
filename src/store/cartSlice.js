import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const refreshCartCount = createAsyncThunk(
  "cart/refreshCartCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/cart/count", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        return rejectWithValue(json?.error || "Failed to fetch cart count");
      }

      return Number(json?.data?.count || 0);
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to fetch cart count");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    count: 0,
    status: "idle",
    error: null,
  },
  reducers: {
    setCartCount(state, action) {
      state.count = Number(action.payload || 0);
    },
    clearCart(state) {
      state.count = 0;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshCartCount.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(refreshCartCount.fulfilled, (state, action) => {
        state.count = action.payload;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(refreshCartCount.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
        state.count = 0;
      });
  },
});

export const { setCartCount, clearCart } = cartSlice.actions;
export const cartActions = cartSlice.actions;

export default cartSlice.reducer;

