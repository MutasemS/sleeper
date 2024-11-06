import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { supabase } from "~/server/supabaseClient";
import { Transaction } from "~/types/transactionType";

export const transactionRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        category: z.string().min(1),
        amount: z.number().positive(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { data, error } = (await supabase
        .from("transactions")
        .insert([
          {
            category: input.category,
            amount: input.amount,
            transactionDate: new Date().toISOString(),
            description: input.description ?? null,
          },
        ])
        .select("*")) as { data: Transaction[] | null; error: any };

      if (error) {
        throw new Error(`Error inserting transaction: ${error.message}`);
      }

      return data;
    }),

  getAll: publicProcedure.query(async () => {
    const { data, error } = (await supabase
      .from("transactions")
      .select("*")) as { data: Transaction[] | null; error: any };

    if (error) {
      throw new Error(`Error fetching transactions: ${error.message}`);
    }

    return data;
  }),
});
