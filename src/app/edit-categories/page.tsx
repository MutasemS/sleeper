import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { EditCategoryForm } from "../_components/edit-category-forms";

export default function EditCategoriesPage() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-gradient-to-b from-[#2e026d] to-[#15162c] p-8 text-white">
      <h1 className="mb-8 text-center text-3xl font-bold">Categories</h1>
      <div className="flex flex-col items-start justify-center gap-8 md:flex-row">
        <div className="w-full md:w-1/2">
            <EditCategoryForm />
        </div>
      </div>
      <div className="absolute left-4 top-8">
        <Link
          href="/"
          className="rounded-full bg-blue-500 p-4 text-white hover:bg-blue-600"
        >
          Go Home
        </Link>
      </div>
      <div className="absolute right-4 top-4">
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}