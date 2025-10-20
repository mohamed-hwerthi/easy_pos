import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import storeCurrencyReducer from "./slices/storeCurrencySlice";
import storeLanguageReducer from "./slices/storeLanguageSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    storeCurrency: storeCurrencyReducer,
    storeLanguage: storeLanguageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
