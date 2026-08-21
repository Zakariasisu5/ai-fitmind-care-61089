import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { sb } from "./_sb";

export default defineTool({
  name: "log_mood",
  title: "Log a mood entry",
  description: "Record a mood entry for the signed-in user with optional stress, anxiety, energy, and sleep quality scores.",
  inputSchema: {
    mood: z.string().min(1).describe("Short mood label, e.g. 'happy', 'anxious', 'tired'."),
    mood_score: z.number().int().min(1).max(10).nullable().describe("Overall mood 1-10 (10 best). Null if unknown."),
    stress_level: z.number().int().min(1).max(10).nullable().describe("Stress level 1-10. Null if unknown."),
    anxiety_level: z.number().int().min(1).max(10).nullable().describe("Anxiety level 1-10. Null if unknown."),
    energy_level: z.number().int().min(1).max(10).nullable().describe("Energy level 1-10. Null if unknown."),
    sleep_quality: z.number().int().min(1).max(10).nullable().describe("Sleep quality 1-10. Null if unknown."),
    notes: z.string().nullable().describe("Optional free-text notes."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await sb(ctx).from("mood_entries").insert({ user_id: ctx.getUserId(), ...input }).select().single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: `Logged mood: ${input.mood}` }], structuredContent: { entry: data } };
  },
});
