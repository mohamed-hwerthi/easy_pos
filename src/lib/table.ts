export type TableStatus = "paid" | "unpaid" | "empty" | "partial";

export interface Guest {
  id: string;
  name: string;
  amountDue: number;
  paid: boolean;
}

export interface RestaurantTable {
  id: string;
  name: string;
  number: number;
  status: TableStatus;
  guests: Guest[];
  qrCode: string;
  lastUpdated: Date;
}

export function calculateTableStatus(guests: Guest[]): TableStatus {
  if (guests.length === 0) return "empty";
  const paidCount = guests.filter((g) => g.paid).length;
  if (paidCount === guests.length) return "paid";
  if (paidCount === 0) return "unpaid";
  return "partial";
}

export function calculateTotalDue(guests: Guest[]): number {
  return guests.reduce((sum, g) => sum + (g.paid ? 0 : g.amountDue), 0);
}

export function calculateTotalAmount(guests: Guest[]): number {
  return guests.reduce((sum, g) => sum + g.amountDue, 0);
}
