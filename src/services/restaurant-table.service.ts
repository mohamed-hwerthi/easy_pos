// src/services/restaurant-table.service.ts
import { apiClient } from "@/lib/api.config";
import { ClientPayment } from "@/models/client-payment.model";
import { RestaurantTable } from "@/models/restaurant-table.model";
import { TableClient } from "@/models/table-client.model";

export const restaurantTableService = {
  // ---------------- TABLES ----------------

  /**
   * Récupérer toutes les tables
   */
  async getAll(): Promise<RestaurantTable[]> {
    const { data } = await apiClient.get("/tables");
    return data;
  },

  occupyTable: async (tableId: string): Promise<RestaurantTable> => {
    const response = await apiClient.patch(`/tables/${tableId}/occupy`);
    return response.data; // updated table
  },

  /**
   * Create a new restaurant table.
   * @param table - Table data without ID
   * @returns Created RestaurantTable
   */
  async create(table: Omit<RestaurantTable, "id">): Promise<RestaurantTable> {
    const { data } = await apiClient.post("/tables", table);
    return data;
  },

  /**
   * Update a restaurant table by ID.
   * @param id - Table UUID
   * @param table - Partial table data
   * @returns Updated RestaurantTable
   */
  async update(
    id: string,
    table: Partial<RestaurantTable>
  ): Promise<RestaurantTable> {
    const { data } = await apiClient.put(`/tables/${id}`, table);
    return data;
  },

  /**
   * Get a restaurant table by ID.
   * @param id - Table UUID
   * @returns RestaurantTable
   */
  async getById(id: string): Promise<RestaurantTable> {
    const { data } = await apiClient.get(`/tables/${id}`);
    return data;
  },

  /**
   * Delete a restaurant table by ID.
   * @param id - Table UUID
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tables/${id}`);
  },

  /**
   * Clear a table (remove all clients)
   * @param id - Table UUID
   * @returns Updated RestaurantTable
   */
  async clearTable(id: string): Promise<RestaurantTable> {
    const { data } = await apiClient.put(`/tables/${id}/clear`);
    return data;
  },

  // ---------------- CLIENTS ----------------

  /**
   * Add a client to a table.
   * @param tableId - Table UUID
   * @param client - Client data
   * @returns Created TableClient
   */
  async addClientToTable(
    tableId: string,
    client: Omit<TableClient, "id">
  ): Promise<TableClient> {
    const { data } = await apiClient.post(`/tables/${tableId}/clients`, client);
    return data;
  },

  /**
   * Get all clients for a table
   * @param tableId - Table UUID
   * @returns List of TableClients
   */
  async getClientsByTable(tableId: string): Promise<TableClient[]> {
    const { data } = await apiClient.get(`/tables/${tableId}/clients`);
    return data;
  },

  /**
   * Update a client by ID.
   * @param clientId - Client UUID
   * @param client - Partial client data
   * @returns Updated TableClient
   */
  async updateClient(
    clientId: string,
    client: Partial<TableClient>
  ): Promise<TableClient> {
    const { data } = await apiClient.put(`/tables/clients/${clientId}`, client);
    return data;
  },

  /**
   * Remove a client from a table
   * @param clientId - Client UUID
   */
  async removeClient(clientId: string): Promise<void> {
    await apiClient.delete(`/tables/clients/${clientId}`);
  },

  // ---------------- PAYMENTS ----------------

  /**
   * Add a payment to a client.
   * @param clientId - Client UUID
   * @param payment - Payment data
   * @returns Created ClientPayment
   */
  async addPaymentToClient(
    clientId: string,
    payment: Omit<ClientPayment, "id">
  ): Promise<ClientPayment> {
    const { data } = await apiClient.post(
      `/tables/clients/${clientId}/payments`,
      payment
    );
    return data;
  },

  /**
   * Get all payments for a client.
   * @param clientId - Client UUID
   * @returns List of ClientPayments
   */
  async getPaymentsByClient(clientId: string): Promise<ClientPayment[]> {
    const { data } = await apiClient.get(
      `/tables/clients/${clientId}/payments`
    );
    return data;
  },

  /**
   * Mark client as fully paid
   * @param clientId - Client UUID
   * @returns Updated TableClient
   */
  async markClientAsPaid(clientId: string): Promise<TableClient> {
    const { data } = await apiClient.put(
      `/tables/clients/${clientId}/mark-paid`
    );
    return data;
  },

  /**
   * Get table statistics
   */
  async getStatistics(): Promise<{
    paidCount: number;
    unpaidCount: number;
    partialCount: number;
    emptyCount: number;
    totalDue: number;
  }> {
    const { data } = await apiClient.get("/tables/statistics");
    return data;
  },

  async removeClientFromTable(
    tableId: string,
    clientId: string
  ): Promise<void> {
    await this.removeClient(clientId);
  },
};
