export interface Transaction {
  id: string;
  category: string;
  amount: number;
  transactionDate: string;
  description?: string | null;
}
