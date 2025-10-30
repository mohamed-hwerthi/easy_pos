import { API_BASE_URL, apiClient } from "@/lib/api.config";
import { AuthResponse } from "@/models/auth-response.model";
import axios from "axios";

export const authService = {
  // Store Owner Login
  async signIn(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    console.log(API_BASE_URL);
    const { data } = await axios.post(
      `${API_BASE_URL}/auth/sign-in`,
      credentials,
      { withCredentials: true }
    );
    return data;
  },

  // Logout
  async logout(): Promise<any> {
    const { data } = await apiClient.post(`${API_BASE_URL}/auth/logout`, {});
    return data;
  },

  // Get Current User
  async getCurrentUser(): Promise<any> {
    const { data } = await apiClient.get(`${API_BASE_URL}/auth/current-user`);
    return data;
  },

  // Token Refresh
  async refreshToken(): Promise<any> {
    const { data } = await apiClient.post(
      `${API_BASE_URL}/token/refresh-token`,
      {}
    );
    return data;
  },
};
