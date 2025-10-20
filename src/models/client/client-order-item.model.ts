import { ClientOrderItemOption } from "./client-order-item-option.model";

export interface ClientOrderItem {
  productId: string;
  productName?: string;
  unitPrice?: number;
  quantity: number;
  mediasUrls?: string[];
  options?: ClientOrderItemOption[];
  totalPrice: number;
}
