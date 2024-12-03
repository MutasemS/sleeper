export interface Transaction {
  id: string;
  category: string;
  amountspent: number;
  transactionDate: string;
  description?: string | null;
  userId: string;
}
