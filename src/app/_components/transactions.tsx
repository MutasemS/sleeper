"use client";

import { api } from "~/trpc/react";
import { useState, useEffect } from "react";
import { Loading } from "./loading";
import { useAuth } from "@clerk/nextjs";


export function TransactionForm() {
  const [categoryid, setCategoryid] = useState<number | "">("");
  const [amount, setAmount] = useState("");
  const { userId, isSignedIn } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const safeUserId = userId ?? "defaultUserId";

  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [isSignedIn]);

  const { data: categories, isLoading: isCategoriesLoading } =
    api.category.getAll.useQuery(
      {
        userid: safeUserId,
      },
      {
        enabled: Boolean(userId && isSignedIn),
      },
    );

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
    if (categoryid === "") {
      alert("Please select a category.");
      return;
    }
    if (!userId) {
      alert("Please log in to add a transaction.");
      return;
    }
    try {
      const currentDate = new Date().toISOString();
      await createTransaction.mutateAsync({
        categoryid: categoryid, 
        amountspent: parsedAmount,
        transactiondate: currentDate,
        userid: userId,
      });
    } catch (error) {
      console.error("Failed to add transaction", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg bg-white/10 p-6 shadow-lg backdrop-blur-lg"
    >
      <h2 className="mb-4 text-center text-xl font-bold text-[hsl(280,100%,70%)]">
        Add Transaction
      </h2>
      <div className="flex flex-col gap-4">
        {isCategoriesLoading ? (
          <Loading />
        ) : (
          <select
            value={categoryid}
            onChange={(e) => setCategoryid(e.target.value ? Number(e.target.value) : "")}
            className="rounded-full border-none bg-white/10 p-4 text-black focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories?.map((cat: { categoryid: number; categoryname: string }) => (
              <option key={cat.categoryid} value={Number(cat.categoryid)}>
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
          className="rounded-full border-none bg-white/10 p-4 text-white focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
          required
        />
        <button
          type="submit"
          className="rounded-full bg-blue-500 p-4 text-white hover:bg-blue-600"
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
  const { userId } = useAuth();

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

    if (!userId) {
      alert("Please log in to add a category.");
      return;
    }

    try {
      await createCategory.mutateAsync({
        categoryname,
        maxspendlimit: parsedLimit,
        userid: userId,
      });
    } catch (error) {
      console.error("Failed to add category", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg bg-white/10 p-6 shadow-lg backdrop-blur-lg"
    >
      <h2 className="mb-4 text-center text-xl font-bold text-[hsl(280,100%,70%)]">
        Add Category
      </h2>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Category Name"
          value={categoryname}
          onChange={(e) => setName(e.target.value)}
          className="rounded-full border-none bg-white/10 p-4 text-white placeholder-black focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
          required
        />
        <input
          type="number"
          placeholder="Max Spend Limit"
          value={maxspendlimit}
          onChange={(e) => setMaxspendlimit(e.target.value)}
          className="rounded-full border-none bg-white/10 p-4 text-white focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
          required
        />
        <button
          type="submit"
          className="rounded-full bg-blue-500 p-4 text-white hover:bg-blue-600"
        >
          Add Category
        </button>
      </div>
    </form>
  );
}

export function CSVUploadForm() {
  const [categoryname, setCategoryname] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const { userId, isSignedIn } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const safeUserId = userId ?? "defaultUserId";
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [isSignedIn]);

  const { data: categories, isLoading: isCategoriesLoading } =
    api.category.getAll.useQuery(
      {
        userid: safeUserId,
      },
      {
        enabled: Boolean(userId && isSignedIn),
      },
    );

  const createTransaction = api.transactionTable.create.useMutation({
    onSuccess: () => {
      setCategoryname("");
      setAmount("");
      setMessage("Transactions added successfully!");
    },
    onError: (error) => {
      console.error("Error creating transaction:", error);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const text = reader.result as string;
        const rows = text
          .split("\n")
          .map((row) => row.trim())
          .filter(Boolean);
        const failedRows: string[] = [];

        for (const row of rows) {
          const [categoryname, amountStr] = row.split(",");

          if (!amountStr) {
            failedRows.push(`Invalid row: "${row}" (missing amount)`);
            continue;
          }

          const amount = parseFloat(amountStr);

          if (!categoryname || isNaN(amount)) {
            failedRows.push(`Invalid data in row: "${row}"`);
            continue;
          }

          const category = categories?.find(
            (cat) =>
              cat.categoryname.toLowerCase() ===
              categoryname.trim().toLowerCase(),
          );

          if (!category) {
            failedRows.push(`Category not found: "${categoryname}"`);
            continue;
          }

          if (!userId) {
            failedRows.push("Please log in to add transactions.");
            continue;
          }

          try {
            await createTransaction.mutateAsync({
              categoryid: category.categoryid,
              amountspent: amount,
              transactiondate: new Date().toISOString(),
              userid: userId,
            });
          } catch (error) {
            failedRows.push(`Failed to process: "${row}"`);
          }
        }
        if (failedRows.length === 0) {
          setMessage("File uploaded successfully!");
        } else {
          setMessage(`Errors: ${failedRows.join(", ")}`);
        }
        setFile(null);
      } catch (error) {
        setMessage("Failed to process file. Please try again.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="rounded-lg bg-white/10 p-6 shadow-lg backdrop-blur-lg">
      <h2 className="mb-4 text-center text-xl font-bold text-[hsl(280,100%,70%)]">
        Upload Transactions CSV
      </h2>
      <div className="flex flex-col gap-4">
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <label
          htmlFor="file-upload"
          className="flex cursor-pointer items-center justify-center rounded-full bg-white/10 p-4 text-white transition-colors hover:bg-white/20 focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
        >
          {fileName ? fileName : "Choose File"}
        </label>

        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-full bg-blue-500 p-4 text-white hover:bg-blue-600"
        >
          Process CSV
        </button>
        {message && (
          <div className="mt-4">
            <h3
              className={
                message.startsWith("Error")
                  ? "font-bold text-red-500"
                  : "font-bold text-green-500"
              }
            >
              {message}
            </h3>
          </div>
        )}
        {errors.length > 0 && (
          <div className="mt-4">
            <h3 className="font-bold text-red-500">Errors:</h3>
            <ul className="text-red-400">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
