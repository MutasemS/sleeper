import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { supabase } from "~/server/supabaseClient";

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
      const { data, error } = await supabase.from("transactions").insert([
        {
          category: input.category,
          amount: input.amount,
          transactionDate: new Date().toISOString(),
          description: input.description ?? null,
        },
      ]);

      if (error) {
        throw new Error(`Error inserting transaction: ${error.message}`);
      }

      return data;
    }),

  getAll: publicProcedure.query(async () => {
    const { data, error } = await supabase.from("transactions").select("*");

    if (error) {
      throw new Error(`Error fetching transactions: ${error.message}`);
    }

    return data;
  }),
});
