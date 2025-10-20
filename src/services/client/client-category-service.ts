import { API_BASE_URL } from "@/lib/api.config";
import { ClientCategory } from "@/models/client/client-category-model";
import axios from "axios";

export const clientCategoryService = {
  /**
   * Get all categories for storefront.
   *
   * @returns Array of ClientCategory
   */
  async getAll(): Promise<ClientCategory[]> {
    const { data } = await axios.get(`${API_BASE_URL}/client/categories`);
    return data;
  },

  /**
   * Get a specific category by ID for storefront.
   *
   * @param id - Category UUID
   * @returns ClientCategory
   */
  async getById(id: string): Promise<ClientCategory> {
    const { data } = await axios.get(`${API_BASE_URL}/client/categories/${id}`);
    return data;
  },
};
