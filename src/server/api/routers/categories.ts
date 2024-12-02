import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { supabase } from "~/server/supabaseClient";
import type { Category } from "~/types/categoryType";
import type { PostgrestError } from "@supabase/supabase-js";

export const categoryRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        categoryname: z.string().min(1, "Category name is required"),
        maxspendlimit: z.number().positive().optional(),
        userid: z.string(),
      }),
    )
    .mutation(async ({ input }): Promise<Category[] | null> => {
      const { data, error } = (await supabase
        .from("categories")
        .insert([
          {
            categoryname: input.categoryname,
            maxspendlimit: input.maxspendlimit ?? null,
            userid: input.userid,
          },
        ])
        .select("*")) as {
        data: Category[] | null;
        error: PostgrestError | null;
      };

      if (error) {
        throw new Error(`Error inserting category: ${error.message}`);
      }

      return data;
    }),

  getCategoryNameById: publicProcedure
    .input(
      z.object({
        categoryid: z.string().min(1, "Category ID is required"),
      }),
    )
    .query(async ({ input }) => {
      const { categoryid } = input;

      const { data, error } = await supabase
        .from("categories")
        .select("name")
        .eq("id", categoryid)
        .single();

      if (error) {
        throw new Error(`Error fetching category: ${error.message}`);
      }

      if (!data) {
        throw new Error("Category not found");
      }

      return data.name as string;
    }),

  getAll: publicProcedure
    .input(
      z.object({
        minSpendLimit: z.number().positive().optional(),
        maxSpendLimit: z.number().positive().optional(),
        userid: z.string().min(1, "User ID must be provided."),
      }),
    )
    .query(async ({ input }): Promise<Category[] | null> => {
      const { minSpendLimit, maxSpendLimit, userid } = input;

      const query = supabase
        .from("categories")
        .select("*")
        .eq("userid", userid);

      if (minSpendLimit) query.gte("maxspendlimit", minSpendLimit);
      if (maxSpendLimit) query.lte("maxspendlimit", maxSpendLimit);

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error fetching categories: ${error.message}`);
      }

      return data;
    }),

  delete: publicProcedure
    .input(
      z.object({
        categoryid: z.number().positive(),
      }),
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
      }),
    )
    .mutation(async ({ input }): Promise<Category[] | null> => {
      const { categoryid, ...updates } = input;

      if (Object.keys(updates).length === 0) {
        throw new Error("At least one field must be updated.");
      }

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
