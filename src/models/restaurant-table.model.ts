import { TableStatus } from "./table-status";

export interface RestaurantTable {
  id: string;
  tableNumber: string;
  status: TableStatus;
  qrCode?: string;
  remainingAmount?: number;
  clientIds?: string[];
  orderIds?: string[];
  totalAmount: number;
}
