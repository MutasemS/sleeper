"use client";

import { api } from "~/trpc/react";
import { useState } from "react";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function TransactionForm() {
  const [categoryid, setCategoryid] = useState("");
  const [amount, setAmount] = useState("");

  const { data: categories, isLoading: isCategoriesLoading } =
    api.category.getAll.useQuery();

  const createTransaction = api.transactionTable.create.useMutation({
    onSuccess: () => {
      setCategoryid("");
      setAmount("");
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
      const currentDate = new Date().toISOString();
      await createTransaction.mutateAsync({
        categoryid: categoryid,
        amountspent: parsedAmount,
        transactiondate: currentDate,
      });
    } catch (error) {
      console.error("Failed to add transaction", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex flex-col gap-2">
        {isCategoriesLoading ? (
          <p>Loading categories...</p>
        ) : (
          <select
            value={categoryid}
            onChange={(e) => setCategoryid(e.target.value)}
            className="border p-2"
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories?.map((cat) => (
              <option key={cat.categoryid} value={cat.categoryid}>
                {cat.categoryname}
              </option>
            ))}
          </select>
        )}
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2"
          required
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

export function CategoryForm() {
  const [categoryname, setName] = useState("");
  const [maxspendlimit, setMaxspendlimit] = useState("");

  const createCategory = api.category.create.useMutation<{
    categoryname: string;
    maxspendlimit: number;
  }>({
    onSuccess: () => {
      setName("");
      setMaxspendlimit("");
    },
    onError: (error) => {
      console.error("Error creating transaction:", error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedLimit = parseFloat(maxspendlimit);
    if (isNaN(parsedLimit)) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      await createCategory.mutateAsync({
        categoryname,
        maxspendlimit: parsedLimit,
      });
    } catch (error) {
      console.error("Failed to add category", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Category Name"
          value={categoryname}
          onChange={(e) => setName(e.target.value)}
          className="border p-2"
          required
        />
        <textarea
          placeholder="Max Spend Limit"
          value={maxspendlimit}
          onChange={(e) => setMaxspendlimit(e.target.value)}
          className="border p-2"
          required
        />
        <button
          type="submit"
          className="mt-2 rounded bg-green-500 p-2 text-white"
        >
          Add Category
        </button>
      </div>
    </form>
  );
}
