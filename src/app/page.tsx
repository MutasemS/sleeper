import Link from "next/link";
import { HydrateClient } from "~/trpc/server";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import BarGraph from "./_components/BarGraph";

export default function Landing() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            <span className="text-[hsl(280,100%,70%)]">Sleeper</span>
          </h1>

          <div className="mb-8 w-full max-w-4xl">
            <SignedIn>
              <BarGraph />
            </SignedIn>
            <SignedOut>
              <p>Please sign in to view the budget tracker.</p>
            </SignedOut>
          </div>

          <div className="absolute right-4 top-4">
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>

          <div className="flex w-full items-center justify-center gap-4">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="/transactions"
            >
              <h3 className="text-2xl font-bold">Add Transaction →</h3>
              <div className="text-lg">Click here to add a new transaction</div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="/edit-categories"
            >
              <h3 className="text-2xl font-bold">Edit Categories →</h3>
              <div className="text-lg">Click here to edit or update categories</div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="/edit-transactions"
            >
              <h3 className="text-2xl font-bold">Edit Transactions →</h3>
              <div className="text-lg">Click here to modify existing transactions</div>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2"></div>
        </div>
      </main>
    </HydrateClient>
  );
}
