import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ClientUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface AuthState {
  email: string | null;
  isAuthenticated: boolean;
  clientUser: ClientUser | null;
  clientToken: string | null;
}

const initialState: AuthState = {
  email: null,
  isAuthenticated: false,
  clientUser: null,
  clientToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setClientAuth: (
      state,
      action: PayloadAction<{ user: ClientUser; token: string }>
    ) => {
      state.clientUser = action.payload.user;
      state.clientToken = action.payload.token;
      state.isAuthenticated = true;
    },
    updateClientUser: (state, action: PayloadAction<Partial<ClientUser>>) => {
      if (state.clientUser) {
        state.clientUser = { ...state.clientUser, ...action.payload };
      }
    },
    clearAuth: (state) => {
      state.email = null;
      state.isAuthenticated = false;
      state.clientUser = null;
      state.clientToken = null;
    },
  },
});

export const { setEmail, setClientAuth, updateClientUser, clearAuth } =
  authSlice.actions;
export default authSlice.reducer;
