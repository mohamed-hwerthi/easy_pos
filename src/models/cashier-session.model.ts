// Request DTO for creating a new cashier session
export interface CashierSessionRequestDTO {
  cashierId: string; // UUID as string
  openingBalance: number; // Required for opening session
  startTime?: string; // ISO string - will be set by backend if not provided
  endTime?: string; // ISO string - only for closing session
  closingBalance?: number; // Only for closing session
  totalSales?: number; // Only for closing session
  totalRefunds?: number; // Only for closing session
  isClosed?: boolean; // Default false for new sessions
}

// Response DTO for cashier session
export interface CashierSessionResponseDTO {
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
