"use client";

import { useState } from "react";
import { api } from "~/trpc/react"; 
import { useAuth } from "@clerk/nextjs";

export function EditCategoryForm() {
  const [categoryname, updateName] = useState("");
  const [maxspendlimit, updateMaxspendlimit] = useState("");
  const [categoryid, setCategoryId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);  // State to manage modal visibility
  const { userId, isSignedIn } = useAuth();
  const safeUserId = userId ?? "defaultUserId";

  const { data: categories, isLoading: isCategoriesLoading } = api.category.getAll.useQuery(
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
      setIsModalOpen(false);  // Close modal after successful update
    },
    onError: (error) => {
      console.error("Error updating category:", error);
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
    setIsModalOpen(true);  // Open modal when update button is clicked
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
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
    </div>
  );
}