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
  const [categoryId, setCategoryId] = useState<number | "">("");  // Make categoryId a number
  const [transactionId, setTransactionId] = useState<number | "">("");  // Make transactionId a number
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);  // Use number for transactionToDelete
  const { userId, isSignedIn } = useAuth();
  const safeUserId = userId ?? "defaultUserId";

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
    onSuccess: (data) => {
      console.log("Transaction updated successfully:", data);
      setTransactionId("");
      setCategoryId("");
      updateAmountSpent("");
      updateTransactionDate("");
      setIsModalOpen(false);
      refetch();
    },
    onError: (error) => {
      console.error("Error updating transaction:", error);
    },
  });

  const deleteTransaction = api.transactionTable.delete.useMutation({
    onSuccess: () => {
      console.log("Transaction deleted successfully");
      setIsDeleteModalOpen(false);
      refetch();
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

  return (
    <div>
      {isTransactionsLoading ? (
        <p>Loading transactions...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount Spent</th>
              <th>Transaction Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions?.map((transaction) => (
              <tr key={transaction.transactionid}>
                <td>{transaction.categories.categoryname}</td>
                <td>{transaction.amountspent}</td>
                <td>{formatDate(transaction.transactiondate)}</td>
                <td>
                  <button
                    onClick={() =>
                      handleTransactionUpdate(
                        transaction.transactionid,
                        transaction.categoryid,
                        transaction.amountspent.toString(),
                        transaction.transactiondate
                      )
                    }
                  >
                    Update
                  </button>
                  <button onClick={() => handleDelete(transaction.transactionid)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Update Transaction</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="amountspent">Amount Spent</label>
                <input
                  id="amountspent"
                  type="number"
                  value={amountSpent}
                  onChange={(e) => updateAmountSpent(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="transactiondate">Transaction Date</label>
                <input
                  id="transactiondate"
                  type="date"
                  value={transactionDate}
                  onChange={(e) => updateTransactionDate(e.target.value)}
                />
              </div>
              <div>
                <button type="submit">Update</button>
                <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Are you sure you want to delete this transaction?</h2>
            <div>
              <button onClick={confirmDelete}>Yes, Delete</button>
              <button onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
