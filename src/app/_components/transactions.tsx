"use client";

import { api } from "~/trpc/react";
import { useState } from "react";
import type { Transaction } from "~/types/transactionType";

export function Transactions() {
  const { data: latestTransactions, isLoading } =
    api.transaction.getAll.useQuery();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!latestTransactions) {
    return <p>No transactions available.</p>;
  }

  return (
    <div>
      <h2>Latest Transactions</h2>
      <ul>
        {latestTransactions.map((transaction: Transaction) => (
          <li key={transaction.id}>
            <p>Category: {transaction.category}</p>
            <p>Amount: {transaction.amount}</p>
            <p>Date: {transaction.transactionDate}</p>
            <p>
              Description:{" "}
              {transaction.description ?? "No description provided"}
            </p>
          </li>
        ))}
      </ul>
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
