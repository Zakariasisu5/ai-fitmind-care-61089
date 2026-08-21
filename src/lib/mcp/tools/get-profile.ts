import { defineTool } from "@lovable.dev/mcp-js";
import { sb } from "./_sb";

export default defineTool({
  name: "get_profile",
  title: "Get my FitMind Care profile",
  description: "Return the signed-in user's FitMind Care profile (name, id).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await sb(ctx)
      .from("profiles")
      .select("id, first_name, last_name, created_at")
      .eq("id", ctx.getUserId())
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }], structuredContent: { profile: data, email: ctx.getUserEmail() } };
  },
});
