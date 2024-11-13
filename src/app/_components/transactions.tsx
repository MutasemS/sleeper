"use client";

import { api } from "~/trpc/react";
import { useState } from "react";
import { useMemo } from "react";
import type { Transaction } from "~/types/transactionType";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function Transactions() {
  const { data: latestTransactions, isLoading } =
    api.transaction.getAll.useQuery();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!latestTransactions) {
    return <p>No transactions available.</p>;
  }

  const transactionsByCategory = useMemo(() => {
    return latestTransactions.reduce((acc, transaction) => {
      if (!acc[transaction.category]) {
        acc[transaction.category] = [];
      }
      // Use a non-null assertion to let TypeScript know it's defined
      acc[transaction.category]!.push(transaction);
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [latestTransactions]);

  return (
    <div>
      <h2>Latest Transactions</h2>
      {Object.entries(transactionsByCategory).map(
        ([category, transactions]) => (
          <div key={category} className="mb-4">
            <h3>{category}</h3>
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2">Amount</th>
                  <th className="border border-gray-300 p-2">Date</th>
                  <th className="border border-gray-300 p-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="border border-gray-300 p-2">
                      {transaction.amount}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {formatDate(transaction.transactionDate)}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {transaction.description ?? "No description provided"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

export function TransactionForm() {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const createTransaction = api.transaction.create.useMutation<{
    category: string;
    amount: number;
    description?: string;
  }>({
    onSuccess: () => {
      setCategory("");
      setAmount("");
      setDescription("");
    },
    onError: (error) => {
      console.error("Error creating transaction:", error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      await createTransaction.mutateAsync({
        category,
        amount: parsedAmount,
        description,
      });
    } catch (error) {
      console.error("Failed to add transaction", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2"
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2"
        />
        <button
          type="submit"
          className="mt-2 rounded bg-blue-500 p-2 text-white"
        >
          Add Transaction
        </button>
      </div>
    </form>
  );
}
