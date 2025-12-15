export interface TableClient {
  id: string;
  name: string;
  tableId: string;
  amountDue?: number;
  remainingAmount?: number;
  paymentIds?: string[];
}
