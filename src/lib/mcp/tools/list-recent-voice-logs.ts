import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { sb } from "./_sb";

export default defineTool({
  name: "list_recent_voice_logs",
  title: "List recent voice health logs",
  description: "Return the signed-in user's most recent voice health logs, including transcription, extracted health data, and agent analysis.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(10).describe("Maximum number of voice logs to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await sb(ctx)
      .from("voice_logs")
      .select("id, transcription, health_data, agent_response, created_at")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }], structuredContent: { logs: data ?? [] } };
  },
});
