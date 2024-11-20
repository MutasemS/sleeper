import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { supabase } from "~/server/supabaseClient";

export const categoryRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        categoryname: z.string().min(1, "Category name is required"),
        maxspendlimit: z.number().positive().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { data, error } = await supabase
        .from("categories")
        .insert([
          {
            categoryname: input.categoryname,
            maxspendlimit: input.maxspendlimit ?? null,
          },
        ])
        .select("*");

      if (error) {
        throw new Error(`Error inserting category: ${error.message}`);
      }

      return data;
    }),

  getAll: publicProcedure.query(async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*");

    if (error) {
      throw new Error(`Error fetching categories: ${error.message}`);
    }

    return data;
  }),

  delete: publicProcedure
    .input(
      z.object({
        categoryid: z.number().positive(),
      })
    )
    .mutation(async ({ input }) => {
      const { data, error } = await supabase
        .from("categories")
        .delete()
        .eq("categoryid", input.categoryid);

      if (error) {
        throw new Error(`Error deleting category: ${error.message}`);
      }

      return data;
    }),

  update: publicProcedure
    .input(
      z.object({
        categoryid: z.number().positive(),
        categoryname: z.string().optional(),
        maxspendlimit: z.number().positive().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { categoryid, ...updates } = input;

      const { data, error } = await supabase
        .from("categories")
        .update(updates)
        .eq("categoryid", categoryid);

      if (error) {
        throw new Error(`Error updating category: ${error.message}`);
      }

      return data;
    }),
});