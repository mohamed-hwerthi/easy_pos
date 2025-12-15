export interface ClientPayment {
  id: string;
  clientId: string;
  amount: number;
  paidAt?: string;
  method: any;
}
