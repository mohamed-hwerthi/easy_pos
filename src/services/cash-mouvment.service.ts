import { API_BASE_URL, apiClient } from "@/lib/api.config";
import { CashMovement } from "@/models/cash-mouvement.model";
import { PaginatedResponse } from "@/models/paginationResponse";

export const cashMovementService = {
  /**
   * Create a new cash movement
   * @param request - CashMovementRequest object
   * @returns The created CashMovement
   */
  async create(request: CashMovement): Promise<CashMovement> {
    const { data } = await apiClient.post(
      `${API_BASE_URL}/cash-movements`,
      request
    );
    return data;
  },

  /**
   * Get a cash movement by its ID
   * @param id - UUID of the cash movement
   * @returns CashMovement
   */
  async getById(id: string): Promise<CashMovement> {
    const { data } = await apiClient.get(
      `${API_BASE_URL}/cash-movements/${id}`
    );
    return data;
  },

  /**
   * Get all cash movements for a given cashier session
   * @param sessionId - UUID of the cashier session
   * @returns Array of CashMovement
   */
  async getBySessionId(sessionId: string): Promise<CashMovement[]> {
    const { data } = await apiClient.get(
      `${API_BASE_URL}/cash-movements/session/${sessionId}`
    );
    return data;
  },

  /**
   * Get all cash movements for a specific cashier
   * @param cashierId - UUID of the cashier
   * @returns Array of CashMovement
   */
  async getByCashierId(cashierId: string): Promise<CashMovement[]> {
    const { data } = await apiClient.get(
      `${API_BASE_URL}/cash-movements/cashier/${cashierId}`
    );
    return data;
  },

  /**
   * Get all cash movements with pagination
   * @param params - Pagination parameters (page, size)
   * @returns PaginatedResponse<CashMovement>
   */
  async getAll(
    params: { page?: number; size?: number } = {}
  ): Promise<PaginatedResponse<CashMovement>> {
    const { data } = await apiClient.get(`${API_BASE_URL}/cash-movements`, {
      params,
    });
    return data;
  },

  /**
   * Delete a cash movement by its ID
   * @param id - UUID of the cash movement
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${API_BASE_URL}/cash-movements/${id}`);
  },
};
