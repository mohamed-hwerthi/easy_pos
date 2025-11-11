import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { clientStoreService } from "@/services/client/client-store-service";

export const fetchStoreCurrency = createAsyncThunk(
  "currency/fetchStoreCurrency",
  async (slug: string) => {
    const storeData = await clientStoreService.getBySlug(slug);
    return storeData.currencySymbol; // Retourne seulement le symbole
  }
);

interface CurrencyState {
  currencySymbol: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: CurrencyState = {
  currencySymbol: null,
  loading: false,
  error: null,
};

const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    setCurrency(state, action: PayloadAction<string>) {
      state.currencySymbol = action.payload;
    },
    clearCurrency(state) {
      state.currencySymbol = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStoreCurrency.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchStoreCurrency.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.currencySymbol = action.payload;
        }
      )
      .addCase(fetchStoreCurrency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch currency";
      });
  },
});

export const { setCurrency, clearCurrency } = currencySlice.actions;
export default currencySlice.reducer;
