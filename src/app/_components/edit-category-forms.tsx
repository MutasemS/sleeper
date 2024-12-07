"use client";

import { useState } from "react";
import { api } from "~/trpc/react"; 
import { useAuth } from "@clerk/nextjs";

export function EditCategoryForm() {
  const [categoryname, updateName] = useState("");
  const [maxspendlimit, updateMaxspendlimit] = useState("");
  const [categoryid, setCategoryId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);  // State to manage modal visibility
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State for delete confirmation modal
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null); // Category to delete
  const { userId, isSignedIn } = useAuth();
  const safeUserId = userId ?? "defaultUserId";

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
    onSuccess: (data) => {
      console.log("Category updated successfully:", data);
      setCategoryId("");
      updateName("");
      updateMaxspendlimit("");
      setIsModalOpen(false);
      refetch();
    },
    onError: (error) => {
      console.error("Error updating category:", error);
    },
  });

  const deleteCategory = api.category.delete.useMutation({
    onSuccess: () => {
      console.log("Category deleted successfully");
      setIsDeleteModalOpen(false);
      refetch();
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

  return (
    <div>
      {isCategoriesLoading ? (
        <p>Loading categories...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Category Name</th>
              <th>Max Spend Limit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((category) => (
              <tr key={category.categoryid}>
                <td>{category.categoryname}</td>
                <td>{category.maxspendlimit}</td>
                <td>
                  <button onClick={() => handleCategoryUpdate(category.categoryid.toString(), category.categoryname, category.maxspendlimit.toString())}>
                    Update
                  </button>
                  <button onClick={() => handleDelete(category.categoryid.toString())}>
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
            <h2>Update Category</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="categoryname">Category Name</label>
                <input
                  id="categoryname"
                  type="text"
                  value={categoryname}
                  onChange={(e) => updateName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="maxspendlimit">Max Spend Limit</label>
                <input
                  id="maxspendlimit"
                  type="number"
                  value={maxspendlimit}
                  onChange={(e) => updateMaxspendlimit(e.target.value)}
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
            <h2>Are you sure you want to delete this category?</h2>
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
