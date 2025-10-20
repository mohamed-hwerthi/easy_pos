export interface CashierSessionResponse {
  id: string; // UUID as string
  sessionNumber: string;
  startTime: string; // ISO string
  endTime?: string; // ISO string
  openingBalance: number;
  closingBalance?: number;
  totalSales: number;
  totalRefunds: number;
  isClosed: boolean;
  cashierId: string; // UUID as string
  cashierName: string;
  orderIds: string[]; // Array of UUIDs as strings
  cashMovementIds: string[]; // Array of UUIDs as strings
}
