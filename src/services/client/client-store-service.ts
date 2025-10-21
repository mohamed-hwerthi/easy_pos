import { apiClient } from "@/lib/api.config";
import { ClientStore } from "@/models/client/client-store-model";

/**
 * Service for managing Stores.
 * Provides methods to create, update, fetch, delete stores,
 * and retrieve store-related data such as currency.
 */
export const clientStoreService = {
  /**
   * Get basic store data by store slug.
   *
   * @param slug The slug of the store
   * @returns Promise resolving to ClientStore
   */
  async getBySlug(slug: string): Promise<ClientStore> {
    const { data } = await apiClient.get(`/client/stores/by-slug/${slug}`);
    return data;
  },
};
