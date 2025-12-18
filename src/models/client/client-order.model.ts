import { OrderSource } from "../Order-source.model";
import { ClientCustomer } from "./client-customer.model";
import { ClientOrderItem } from "./client-order-item.model";

export interface ClientOrder {
  id?: string;
  orderItems: ClientOrderItem[];
  customer?: ClientCustomer;
  total: number;
  subTotal: number;
  status?: string;
  createdAt?: string;
  orderNumber?: string;
  source: OrderSource;
  cashierSessionId?: string;
  cashReceived?: number;
  changeGiven?: number;
  tableId: string;
  clientId: string;
}
