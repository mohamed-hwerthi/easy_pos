import { apiClient } from "@/lib/api.config";
import { UserDTO } from "@/models/user.model";
import { UserRole } from "@/models/user-role.model";

export const userService = {
  /**
   * Get the currently authenticated user's information
   * GET /api/users/me
   */
  async getCurrentUser(): Promise<UserDTO> {
    const { data } = await apiClient.get("/users/me");
    return data;
  },

  /**
   * Create a new user
   * POST /api/users
   */
  async createUser(userDTO: UserDTO): Promise<UserDTO> {
    const { data } = await apiClient.post("/users", userDTO);
    return data;
  },

  /**
   * Get all users
   * GET /api/users
   */
  async getAllUsers(): Promise<UserDTO[]> {
    const { data } = await apiClient.get("/users");
    return data;
  },

  /**
   * Get a user by ID
   * GET /api/users/{id}
   */
  async getUserById(id: string): Promise<UserDTO> {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  },

  /**
   * Update an existing user
   * PUT /api/users/{id}
   */
  async updateUser(id: string, userDTO: UserDTO): Promise<UserDTO> {
    const { data } = await apiClient.put(`/users/${id}`, userDTO);
    return data;
  },

  /**
   * Delete a user by ID
   * DELETE /api/users/{id}
   */
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  /**
   * Get all available user roles
   * GET /api/users/roles
   */
  async getAllUserRoles(): Promise<UserRole[]> {
    const { data } = await apiClient.get("/users/roles");
    return data;
  },
};
