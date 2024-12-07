import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { supabase } from "~/server/supabaseClient";
import type { Transaction } from "~/types/transactionTableType";
import type { PostgrestError } from "@supabase/supabase-js";
import { clerkClient } from "@clerk/nextjs/server";

export const transactionTableRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        categoryid: z.number().positive(), 
        amountspent: z.number().positive(),
        userid: z.string().nonempty(),
        transactiondate: z
          .string()
          .optional()
          .refine(
            (date) => !date || !isNaN(new Date(date).getTime()),
            "Invalid date format",
          ),
      }),
    )
    .mutation(async ({ input }) => {
      const { categoryid, amountspent, transactiondate, userid } = input;

      const { data, error } = (await supabase
        .from("transactionstable")
        .insert([{
          categoryid,  // This is now a number
          amountspent,
          transactiondate,
          userid,
        }])
        .select("*")) as {
        data: Transaction[] | null;
        error: PostgrestError | null;
      };

      if (error) {
        throw new Error(`Error inserting transaction: ${error.message}`);
      }

      return data;
    }),

  getAll: publicProcedure
    .input(z.object({ userId: z.string().min(1, "User ID must be provided.") }))
    .query(async ({ input }) => {
      const { userId } = input;
      console.log(`getAll called for userId: ${userId}`); // Debugging log
      const { data, error } = (await supabase
        .from("transactionstable")
        .select(
          `transactionid, categoryid, amountspent, transactiondate, userid, categories (categoryid, categoryname)`
        )
        .eq("userid", userId)) as {
        data:
          | (Transaction & {
              categories: { categoryid: number; categoryname: string }; // categoryid is a number now
            })[] 
          | null;
        error: PostgrestError | null;
      };

      if (error) {
        throw new Error(`Error fetching transactions: ${error.message}`);
      }
      console.log(`getAll returning data: ${JSON.stringify(data)}`); // Debugging log
      return data;
    }),

  getByCategory: publicProcedure
    .input(
      z.object({
        categoryid: z.number().positive(), // categoryid should be a number now
      }),
    )
    .query(async ({ input }) => {
      const { categoryid } = input;

      const { data, error } = (await supabase
        .from("transactionstable")
        .select("*")
        .eq("categoryid", categoryid)) as {
        data: Transaction[] | null;
        error: PostgrestError | null;
      };

      if (error) {
        throw new Error(
          `Error fetching transactions by category: ${error.message}`,
        );
      }

      return data;
    }),

  delete: publicProcedure
    .input(
      z.object({
        transactionid: z.number().positive(), // transactionid should be a number now
      }),
    )
    .mutation(async ({ input }) => {
      const { transactionid } = input;

      const { data, error } = (await supabase
        .from("transactionstable")
        .delete()
        .eq("transactionid", transactionid)) as {
        data: Transaction[] | null;
        error: PostgrestError | null;
      };

      if (error) {
        throw new Error(`Error deleting transaction: ${error.message}`);
      }

      return data;
    }),

  update: publicProcedure
    .input(
      z.object({
        transactionid: z.number().positive(), // transactionid should be a number now
        categoryid: z.number().optional(), // categoryid is now a number
        amountspent: z.number().positive().optional(),
        transactiondate: z
          .string()
          .optional()
          .refine(
            (date) => !date || !isNaN(new Date(date).getTime()),
            "Invalid date format",
          ),
      }),
    )
    .mutation(async ({ input }) => {
      const { transactionid, ...updates } = input;
      if (Object.keys(updates).length === 0) {
        throw new Error("At least one field must be updated.");
      }

      const { data, error } = (await supabase
        .from("transactionstable")
        .update(updates)
        .eq("transactionid", transactionid)
        .select("*")) as {
        data: Transaction[] | null;
        error: PostgrestError | null;
      };

      if (error) {
        throw new Error(`Error updating transaction: ${error.message}`);
      }

      return data;
    }),
});
