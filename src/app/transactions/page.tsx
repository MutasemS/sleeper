import { TransactionForm, CategoryForm } from "~/app/_components/transactions";

export default function TransactionsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Transaction History</h1>
      <TransactionForm />
      <CategoryForm />
    </div>
  );
}
