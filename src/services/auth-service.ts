import { API_BASE_URL } from "@/lib/api.config";
import { AuthResponse } from "@/models/auth-response.model";
import axios from "axios";

export const authService = {
  // Store Owner Login
  async signIn(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const { data } = await axios.post(
      `${API_BASE_URL}/auth/sign-in`,
      credentials,
      { withCredentials: true }
    );
    return data;
  },

  // Logout
  async logout(): Promise<any> {
    const { data } = await axios.post(
      `${API_BASE_URL}/auth/logout`,
      {},
      { withCredentials: true }
    );
    return data;
  },

  // Get Current User
  async getCurrentUser(): Promise<any> {
    const { data } = await axios.get(`${API_BASE_URL}/auth/current-user`, {
      withCredentials: true,
    });
    return data;
  },

  // Token Refresh
  async refreshToken(): Promise<any> {
    const { data } = await axios.post(
      `${API_BASE_URL}/token/refresh-token`,
      {},
      { withCredentials: true }
    );
    return data;
  },
};
