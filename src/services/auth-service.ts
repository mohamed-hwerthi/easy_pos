import { API_BASE_URL, apiClient } from "@/lib/api.config";
import { AuthResponse } from "@/models/auth-response.model";
import axios from "axios";

export const authService = {
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

  async logout(): Promise<any> {
    const { data } = await apiClient.post(`${API_BASE_URL}/auth/logout`, {});
    return data;
  },

  async getCurrentUser(): Promise<any> {
    const { data } = await apiClient.get(`${API_BASE_URL}/auth/current-user`);
    return data;
  },

  async refreshToken(): Promise<any> {
    const { data } = await apiClient.post(
      `${API_BASE_URL}/token/refresh-token`,
      {}
    );
    return data;
  },
};
