import { ClientOrderItem } from "@/models/client/client-order-item.model";
import { ClientOrder } from "@/models/client/client-order.model";
import { clientOrderService } from "@/services/client/client-order.service";

/**
 * Helper functions for creating and managing POS orders
 */

/**
 * Create a POS order from cart items
 * @param cartItems - Array of items in the cart
 * @param customer - Customer information
 * @param deliveryAddress - Delivery address
 * @param cashReceived - Amount of cash received (optional for card payments)
 * @returns Promise with the created order
 */
export async function createPOSOrder(
  cartItems: ClientOrderItem[],
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  },
  deliveryAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  },
  cashReceived?: number
): Promise<ClientOrder> {
  // Get current session from localStorage
  const sessionStr = localStorage.getItem("currentSession");
  if (!sessionStr) {
    throw new Error("No active cashier session. Please open a register first.");
  }

  const session = JSON.parse(sessionStr);

  // Calculate totals
  const subTotal = cartItems.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    const optionsTotal =
      item.options?.reduce(
        (optSum, opt) => optSum + (opt.optionPrice || 0),
        0
      ) || 0;
    return sum + itemTotal + optionsTotal;
  }, 0);

  const total = subTotal; // Add tax/delivery fees if needed

  // Calculate change if cash payment
  const changeGiven = cashReceived ? cashReceived - total : undefined;

  // Validate cash payment
  if (cashReceived !== undefined && cashReceived < total) {
    throw new Error(
      `Insufficient cash received. Total: ${total.toFixed(
        2
      )}, Received: ${cashReceived.toFixed(2)}`
    );
  }

  // Create order object
  const order: Omit<
    ClientOrder,
    "cashierSessionId" | "cashReceived" | "changeGiven" | "source"
  > = {
    orderItems: cartItems,
    total,
    subTotal,
    tableId: "",
    clientId: "",
  };

  // Place the order using the POS-specific method
  return await clientOrderService.placePOSOrder(
    order,
    session.id,
    cashReceived,
    changeGiven
  );
}

/**
 * Get the current cashier session ID
 * @returns Session ID or null if no active session
 */
export function getCurrentSessionId(): string | null {
  const sessionStr = localStorage.getItem("currentSession");
  if (!sessionStr) return null;
  const session = JSON.parse(sessionStr);
  return session.id;
}

/**
 * Validate if there's an active cashier session
 * @throws Error if no active session
 */
export function validateActiveSession(): void {
  const sessionId = getCurrentSessionId();
  if (!sessionId) {
    throw new Error("No active cashier session. Please open a register first.");
  }
}

/**
 * Create a quick cash sale order
 * @param cartItems - Items to sell
 * @param cashReceived - Cash amount received
 * @param customerPhone - Customer phone number (optional)
 * @returns Promise with the created order
 */
export async function createQuickCashSale(
  cartItems: ClientOrderItem[],
  cashReceived: number,
  customerPhone?: string
): Promise<ClientOrder> {
  // Default customer for quick sales
  const defaultCustomer = {
    firstName: "Walk-in",
    lastName: "Customer",
    email: customerPhone ? `${customerPhone}@pos.local` : "walkin@pos.local",
    phoneNumber: customerPhone || "N/A",
  };

  // Default delivery address for in-store pickup
  const defaultAddress = {
    street: "In-Store Pickup",
    city: "Store",
    postalCode: "00000",
    country: "Local",
  };

  return createPOSOrder(
    cartItems,
    defaultCustomer,
    defaultAddress,
    cashReceived
  );
}

/**
 * Get all orders for the current session
 * @returns Promise with array of orders
 */
export async function getCurrentSessionOrders(): Promise<ClientOrder[]> {
  validateActiveSession();
  return await clientOrderService.getCurrentSessionOrders();
}

/**
 * Calculate session totals from orders
 * @param orders - Array of orders
 * @returns Object with total sales, cash, and card amounts
 */
export function calculateSessionTotals(orders: ClientOrder[]) {
  const totals = {
    totalSales: 0,
    totalCash: 0,
    totalCard: 0,
    orderCount: orders.length,
  };

  orders.forEach((order) => {
    totals.totalSales += order.total;
    if (order.cashReceived !== undefined) {
      totals.totalCash += order.total;
    } else {
      totals.totalCard += order.total;
    }
  });

  return totals;
}
