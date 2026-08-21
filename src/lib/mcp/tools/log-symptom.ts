import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { sb } from "./_sb";

export default defineTool({
  name: "log_symptom",
  title: "Log a symptom",
  description: "Record a symptom for the signed-in user with severity, duration, body area, and notes.",
  inputSchema: {
    symptom: z.string().min(1).describe("Name of the symptom, e.g. 'headache', 'nausea'."),
    severity: z.enum(["mild", "moderate", "severe", "emergency"]).describe("Severity of the symptom."),
    duration: z.string().nullable().describe("How long the symptom has lasted, e.g. '2 hours', '3 days'."),
    body_area: z.string().nullable().describe("Body area affected, e.g. 'head', 'chest'."),
    notes: z.string().nullable().describe("Optional free-text notes."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await sb(ctx).from("symptoms").insert({ user_id: ctx.getUserId(), ...input }).select().single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: `Logged symptom: ${input.symptom} (${input.severity})` }], structuredContent: { entry: data } };
  },
});
