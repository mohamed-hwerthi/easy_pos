import { apiClient } from "@/lib/api.config";

/**
 * Service for interacting with PaymentController
 * Backend is the source of truth for payment methods
 */
export const paymentService = {
  /**
   * Get all supported payment methods
   * GET /api/payments/methods
   */
  async getAllPaymentMethods(): Promise<string[]> {
    const { data } = await apiClient.get<string[]>("/payments/methods");
    return data;
  },
};
