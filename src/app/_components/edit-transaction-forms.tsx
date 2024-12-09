"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useAuth } from "@clerk/nextjs";

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

export function EditTransactionForm() {
  const [amountSpent, updateAmountSpent] = useState("");
  const [transactionDate, updateTransactionDate] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">(""); 
  const [transactionId, setTransactionId] = useState<number | "">("");  
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);  
  const { userId, isSignedIn } = useAuth();
  const safeUserId = userId ?? "defaultUserId";
  const [sortField, setSortField] = useState<"categoryname" | "amountspent" | "transactiondate">("transactiondate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");


  const { data: transactions, isLoading: isTransactionsLoading, refetch } = api.transactionTable.getAll.useQuery(
    {
      userId: safeUserId,
    },
    {
      enabled: Boolean(userId && isSignedIn),
    },
  );

  const updateTransaction = api.transactionTable.update.useMutation<{
    transactionid: number;
    categoryid?: number;
    amountspent?: number;
    transactiondate?: string;
  }>({
    onSuccess: async (data) => {
      console.log("Transaction updated successfully:", data);
      setTransactionId("");
      setCategoryId("");
      updateAmountSpent("");
      updateTransactionDate("");
      setIsModalOpen(false);
      await refetch();
    },
    onError: (error) => {
      console.error("Error updating transaction:", error);
    },
  });

  const deleteTransaction = api.transactionTable.delete.useMutation({
    onSuccess: async () => {
      console.log("Transaction deleted successfully");
      setIsDeleteModalOpen(false);
      await refetch();
    },
    onError: (error) => {
      console.error("Error deleting transaction:", error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amountSpent);
    if (isNaN(parsedAmount)) {
      alert("Please enter a valid amount.");
      return;
    }

    if (!userId) {
      alert("Please log in to update a transaction.");
      return;
    }

    try {
      await updateTransaction.mutateAsync({
        transactionid: Number(transactionId),
        categoryid: Number(categoryId), 
        amountspent: parsedAmount,
        transactiondate: transactionDate,
      });
    } catch (error) {
      console.error("Failed to update transaction", error);
    }
  };

  const handleTransactionUpdate = (id: number, categoryid: number, amountspent: string, transactiondate: string) => {
    setTransactionId(id);
    setCategoryId(categoryid); // Ensure categoryid is passed as a number
    updateAmountSpent(amountspent);
    updateTransactionDate(transactiondate);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setTransactionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (transactionToDelete !== null) {
      deleteTransaction.mutate({ transactionid: transactionToDelete });
    }
  };

  const handleSort = (field: "categoryname" | "amountspent" | "transactiondate") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedTransactions = [...(transactions ?? [])].sort((a, b) => {
    let valueA, valueB;

    switch (sortField) {
      case "categoryname":
        valueA = a.categories.categoryname.toLowerCase();
        valueB = b.categories.categoryname.toLowerCase();
        break;
      case "amountspent":
        valueA = a.amountspent;
        valueB = b.amountspent;
        break;
      case "transactiondate":
        valueA = new Date(a.transactiondate).getTime();
        valueB = new Date(b.transactiondate).getTime();
        break;
      default:
        return 0;
    }

    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
  return (
    <div className="rounded-lg bg-white/10 p-6 shadow-lg backdrop-blur-lg">
      {isTransactionsLoading ? (
        <p className="text-center text-white text-lg">Loading transactions...</p>
      ) : (
        <table className="w-full border-separate border-spacing-y-2 text-left text-white">
          <thead className="bg-white/10 text-hsl(280,100%,70%)">
            <tr>
              <th
                className="cursor-pointer p-4"
                onClick={() => handleSort("categoryname")}
              >
                Category{" "}
                {sortField === "categoryname" &&
                  (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="cursor-pointer p-4"
                onClick={() => handleSort("amountspent")}
              >
                Amount Spent{" "}
                {sortField === "amountspent" &&
                  (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="cursor-pointer p-4"
                onClick={() => handleSort("transactiondate")}
              >
                Transaction Date{" "}
                {sortField === "transactiondate" &&
                  (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((transaction) => (
              <tr
                key={transaction.transactionid}
                className="rounded-lg bg-white/10 hover:bg-white/20"
              >
                <td className="p-4">{transaction.categories.categoryname}</td>
                <td className="p-4">{transaction.amountspent}</td>
                <td className="p-4">
                  {formatDate(transaction.transactiondate)}
                </td>
                <td className="p-4 flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleTransactionUpdate(
                        transaction.transactionid,
                        transaction.categoryid,
                        transaction.amountspent.toString(),
                        transaction.transactiondate
                      )
                    }
                    className="rounded-full bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.transactionid)}
                    className="rounded-full bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="rounded-lg bg-white/20 p-6 shadow-lg backdrop-blur-lg w-full max-w-lg">
            <h2 className="mb-4 text-center text-xl font-bold text-[hsl(280,100%,70%)]">
              Update Transaction
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="amountspent"
                    className="block mb-2 text-white text-sm"
                  >
                    Amount Spent
                  </label>
                  <input
                    id="amountspent"
                    type="number"
                    value={amountSpent}
                    onChange={(e) => updateAmountSpent(e.target.value)}
                    className="rounded-full border-none bg-white/10 p-4 text-white placeholder-gray-300 focus:ring-2 focus:ring-[hsl(280,100%,70%)] w-full"
                  />
                </div>
                <div>
                  <label
                    htmlFor="transactiondate"
                    className="block mb-2 text-white text-sm"
                  >
                    Transaction Date
                  </label>
                  <input
                    id="transactiondate"
                    type="date"
                    value={transactionDate}
                    onChange={(e) => updateTransactionDate(e.target.value)}
                    className="rounded-full border-none bg-white/10 p-4 text-white focus:ring-2 focus:ring-[hsl(280,100%,70%)] w-full"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-full bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  >
                    Update
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="rounded-lg bg-white/20 p-6 shadow-lg backdrop-blur-lg w-full max-w-sm">
            <h2 className="mb-4 text-center text-xl font-bold text-[hsl(280,100%,70%)]">
              Confirm Delete
            </h2>
            <p className="mb-6 text-center text-white text-sm">
              Are you sure you want to delete this transaction? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-full bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-full bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
