import { API_BASE_URL } from "@/lib/api.config";
import { ClientOrder } from "@/models/client/client-order.model";
import { PaginatedResponse } from "@/models/paginationResponse";
import axios from "axios";

export const clientOrderService = {
  /**
   * Place a new order for the client.
   * @param order - Order object to be submitted
   * @returns The created Order with read-only fields like id, status, createdAt
   */
  async placeOrder(order: ClientOrder): Promise<ClientOrder> {
    const { data } = await axios.post(`${API_BASE_URL}/client/orders`, order);
    return data;
  },

  /**
   * Get all client orders (paginated)
   * @param params - Query parameters for pagination
   * @returns PaginatedResponse<Order>
   */
  async getAll(
    params: { page?: number; limit?: number; query?: string } = {}
  ): Promise<PaginatedResponse<ClientOrder>> {
    const { data } = await axios.get(`${API_BASE_URL}/client/orders`, {
      params,
    });
    return data;
  },

  /**
   * Get a specific order by ID
   * @param id - Order UUID
   * @returns Order object
   */
  async getById(id: string): Promise<ClientOrder> {
    const { data } = await axios.get(`${API_BASE_URL}/client/orders/${id}`);
    return data;
  },

  /**
   * Get orders for the currently authenticated client
   * @returns Array of ClientOrder objects
   */
  async getMyOrders(): Promise<ClientOrder[]> {
    const { data } = await axios.get(
      `${API_BASE_URL}/client/orders/my-orders`,
      { withCredentials: true }
    );
    return data;
  },
};
