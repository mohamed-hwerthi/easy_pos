import { API_BASE_URL, apiClient } from "@/lib/api.config";
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
    const { data } = await apiClient.post("/auth/logout", {});
    return data;
  },

  // Get Current User
  async getCurrentUser(): Promise<any> {
    const { data } = await apiClient.get("/auth/current-user");
    return data;
  },

  // Token Refresh
  async refreshToken(): Promise<any> {
    const { data } = await apiClient.post("/token/refresh-token", {});
    return data;
  },
};
