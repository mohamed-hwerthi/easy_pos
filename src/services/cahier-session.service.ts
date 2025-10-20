import { API_BASE_URL } from "@/lib/api.config";
import {
  CashierSessionRequestDTO,
  CashierSessionResponseDTO,
} from "@/models/cashier-session.model";
import axios from "axios";

/**
 * Service for interacting with CashierSessionController
 */
export const cashierSessionService = {
  /**
   * Create a new cashier session
   * POST /api/cashier-sessions
   */
  async createSession(
    payload: CashierSessionRequestDTO
  ): Promise<CashierSessionResponseDTO> {
    const { data } = await axios.post(
      `${API_BASE_URL}/api/cashier-sessions`,
      payload,
      { withCredentials: true }
    );
    return data;
  },

  /**
   * Update an existing cashier session
   * PUT /api/cashier-sessions/{id}
   */
  async updateSession(
    id: string,
    payload: CashierSessionRequestDTO
  ): Promise<CashierSessionResponseDTO> {
    const { data } = await axios.put(
      `${API_BASE_URL}/api/cashier-sessions/${id}`,
      payload,
      { withCredentials: true }
    );
    return data;
  },

  /**
     * Close a cashier session
     * POST /api/cashier-sessions/{id}/close?closingBalance=...export interface CashierSessionRequestDTO {
       cashierId: string;        // UUID as string
       openingBalance?: number;
       startTime?: string;        // ISO string
       endTime?: string;          // ISO string
       closingBalance?: number;
       totalSales?: number;
       totalRefunds?: number;
       isClosed?: boolean;
     }
     */
  async closeSession(
    id: string,
    closingBalance: number
  ): Promise<CashierSessionResponseDTO> {
    const { data } = await axios.post(
      `${API_BASE_URL}/api/cashier-sessions/${id}/close`,
      null,
      { params: { closingBalance }, withCredentials: true }
    );
    return data;
  },

  /**
   * Get all cashier sessions
   * GET /api/cashier-sessions
   */
  async getAllSessions(): Promise<CashierSessionResponseDTO[]> {
    const { data } = await axios.get(`${API_BASE_URL}/api/cashier-sessions`, {
      withCredentials: true,
    });
    return data;
  },

  /**
   * Get a cashier session by ID
   * GET /api/cashier-sessions/{id}
   */
  async getSessionById(id: string): Promise<CashierSessionResponseDTO> {
    const { data } = await axios.get(
      `${API_BASE_URL}/api/cashier-sessions/${id}`,
      { withCredentials: true }
    );
    return data;
  },

  /**
   * Get all sessions for a specific cashier
   * GET /api/cashier-sessions/cashier/{cashierId}
   */
  async getSessionsByCashier(
    cashierId: string
  ): Promise<CashierSessionResponseDTO[]> {
    const { data } = await axios.get(
      `${API_BASE_URL}/api/cashier-sessions/cashier/${cashierId}`,
      { withCredentials: true }
    );
    return data;
  },

  /**
   * Get sessions by status (open or closed)
   * GET /api/cashier-sessions/status/{isClosed}
   */
  async getSessionsByStatus(
    isClosed: boolean
  ): Promise<CashierSessionResponseDTO[]> {
    const { data } = await axios.get(
      `${API_BASE_URL}/api/cashier-sessions/status/${isClosed}`,
      { withCredentials: true }
    );
    return data;
  },

  /**
   * Delete a cashier session
   * DELETE /api/cashier-sessions/{id}
   */
  async deleteSession(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/api/cashier-sessions/${id}`, {
      withCredentials: true,
    });
  },
};
