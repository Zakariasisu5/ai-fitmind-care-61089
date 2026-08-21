import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { sb } from "./_sb";

export default defineTool({
  name: "log_nutrition_entry",
  title: "Log a meal or nutrition entry",
  description: "Record a meal or nutrition entry for the signed-in user.",
  inputSchema: {
    meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]).describe("Type of meal."),
    food_items: z.string().min(1).describe("Free-text description of what was eaten."),
    calories: z.number().int().min(0).nullable().describe("Estimated calories, or null if unknown."),
    water_intake: z.number().min(0).nullable().describe("Water intake in liters for this entry, or null."),
    notes: z.string().nullable().describe("Optional free-text notes."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await sb(ctx).from("nutrition_entries").insert({ user_id: ctx.getUserId(), ...input }).select().single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: `Logged ${input.meal_type}: ${input.food_items}` }], structuredContent: { entry: data } };
  },
});
