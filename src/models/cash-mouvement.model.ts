export interface CashMovement {
  id?: string;
  type: string;
  amount: number;
  reason?: string;
  timestamp?: string;
  cashierSessionId: string;
  cashierId: string;
  cashierName?: string;
}
