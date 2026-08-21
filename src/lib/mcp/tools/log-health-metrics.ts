import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { sb } from "./_sb";

export default defineTool({
  name: "log_health_metrics",
  title: "Log biometric health metrics",
  description: "Record a snapshot of biometric health metrics (heart rate, blood pressure, blood oxygen, sleep, steps, weight) for the signed-in user.",
  inputSchema: {
    heart_rate: z.number().int().min(20).max(250).nullable().describe("Heart rate in bpm, or null."),
    blood_pressure: z.string().nullable().describe("Blood pressure as 'systolic/diastolic', e.g. '120/80', or null."),
    blood_oxygen: z.number().int().min(50).max(100).nullable().describe("SpO2 percentage 50-100, or null."),
    sleep_hours: z.number().min(0).max(24).nullable().describe("Hours slept 0-24, or null."),
    steps: z.number().int().min(0).nullable().describe("Step count, or null."),
    weight: z.number().min(0).nullable().describe("Weight in kilograms, or null."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await sb(ctx).from("health_metrics").insert({ user_id: ctx.getUserId(), ...input }).select().single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: "Logged health metrics." }], structuredContent: { entry: data } };
  },
});
