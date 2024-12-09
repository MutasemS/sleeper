"use client";

import { useState } from "react";
import { api } from "~/trpc/react"; 
import { useAuth } from "@clerk/nextjs";

export function EditCategoryForm() {
  const [categoryname, updateName] = useState("");
  const [maxspendlimit, updateMaxspendlimit] = useState("");
  const [categoryid, setCategoryId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null); 
  const { userId, isSignedIn } = useAuth();
  const safeUserId = userId ?? "defaultUserId";
  const [sortField, setSortField] = useState<"categoryname" | "maxspendlimit" | null>("categoryname");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { data: categories, isLoading: isCategoriesLoading, refetch } = api.category.getAll.useQuery(
    {
      userid: safeUserId,
    },
    {
      enabled: Boolean(userId && isSignedIn),
    },
  );

  const updateCategory = api.category.update.useMutation<{
    categoryid: number;
    categoryname?: string;
    maxspendlimit?: number;
  }>({
    onSuccess: async (data) => {
      console.log("Category updated successfully:", data);
      setCategoryId("");
      updateName("");
      updateMaxspendlimit("");
      setIsModalOpen(false);
      await refetch();
    },
    onError: (error) => {
      console.error("Error updating category:", error);
    },
  });

  const deleteCategory = api.category.delete.useMutation({
    onSuccess: async () => {
      console.log("Category deleted successfully");
      setIsDeleteModalOpen(false);
      await refetch();
    },
    onError: (error) => {
      console.error("Error deleting category:", error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedLimit = parseFloat(maxspendlimit);
    const parsedId = parseFloat(categoryid);
    if (isNaN(parsedLimit)) {
      alert("Please enter a valid amount.");
      return;
    }

    if (!userId) {
      alert("Please log in to add a category.");
      return;
    }

    try {
      await updateCategory.mutateAsync({
        categoryname,
        maxspendlimit: parsedLimit,
        categoryid: parsedId,
      });
    } catch (error) {
      console.error("Failed to update category", error);
    }
  };

  const handleCategoryUpdate = (id: string, name: string, limit: string) => {
    setCategoryId(id);
    updateName(name);
    updateMaxspendlimit(limit);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setCategoryToDelete(id);
    setIsDeleteModalOpen(true); 
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory.mutate({ categoryid: parseInt(categoryToDelete) });
    }
  };

  const handleSort = (field: "categoryname" | "maxspendlimit") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedCategories = [...(categories ?? [])].sort((a, b) => {
    if (!sortField) return 0;
    const valueA = a[sortField];
    const valueB = b[sortField];

    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortOrder === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    if (typeof valueA === "number" && typeof valueB === "number") {
      return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
    }

    return 0;
  });

  return (
    <div className="rounded-lg bg-white/10 p-6 shadow-lg backdrop-blur-lg">
      {isCategoriesLoading ? (
        <p className="text-center text-white text-lg">Loading categories...</p>
      ) : (
        <table className="w-full border-separate border-spacing-y-2 text-left text-white">
          <thead className="bg-white/10 text-hsl(280,100%,70%)">
            <tr>
              <th
                className="cursor-pointer p-4"
                onClick={() => handleSort("categoryname")}
              >
                Category Name{" "}
                {sortField === "categoryname" &&
                  (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="cursor-pointer p-4"
                onClick={() => handleSort("maxspendlimit")}
              >
                Max Spend Limit{" "}
                {sortField === "maxspendlimit" &&
                  (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCategories.map((category) => (
              <tr
                key={category.categoryid}
                className="rounded-lg bg-white/10 hover:bg-white/20"
              >
                <td className="p-4">{category.categoryname}</td>
                <td className="p-4">{category.maxspendlimit}</td>
                <td className="p-4 flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleCategoryUpdate(
                        category.categoryid.toString(),
                        category.categoryname,
                        category.maxspendlimit.toString()
                      )
                    }
                    className="rounded-full bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDelete(category.categoryid.toString())}
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
              Update Category
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="categoryname"
                    className="block mb-2 text-white text-sm"
                  >
                    Category Name
                  </label>
                  <input
                    id="categoryname"
                    type="text"
                    value={categoryname}
                    onChange={(e) => updateName(e.target.value)}
                    className="rounded-full border-none bg-white/10 p-4 text-white placeholder-gray-300 focus:ring-2 focus:ring-[hsl(280,100%,70%)] w-full"
                  />
                </div>
                <div>
                  <label
                    htmlFor="maxspendlimit"
                    className="block mb-2 text-white text-sm"
                  >
                    Max Spend Limit
                  </label>
                  <input
                    id="maxspendlimit"
                    type="number"
                    value={maxspendlimit}
                    onChange={(e) => updateMaxspendlimit(e.target.value)}
                    className="rounded-full border-none bg-white/10 p-4 text-white placeholder-gray-300 focus:ring-2 focus:ring-[hsl(280,100%,70%)] w-full"
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

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="rounded-lg bg-white/20 p-6 shadow-lg backdrop-blur-lg w-full max-w-sm">
            <h2 className="mb-4 text-center text-xl font-bold text-[hsl(280,100%,70%)]">
              Confirm Delete
            </h2>
            <p className="mb-6 text-center text-white text-sm">
              Are you sure you want to delete this category? This action cannot be undone.
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
