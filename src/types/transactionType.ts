export interface Transaction {
  id: string;
  category: string;
  amount: number;
  transactionDate: string; // or Date if you prefer
  description?: string | null;
}
