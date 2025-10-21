export interface CashierSessionResponse {
  id: string;
  sessionNumber: string;
  startTime: string;
  endTime?: string;
  openingBalance: number;
  closingBalance?: number;
  totalSales: number;
  totalRefunds: number;
  isClosed: boolean;
  cashierId: string;
  cashierName: string;
  orderIds: string[];
  cashMovementIds: string[];
}
