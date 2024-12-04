export interface Transaction {
  id: string;
  category: string;
  amountspent: number;
  transactiondate: string;
  description?: string | null;
  userId: string;
}
