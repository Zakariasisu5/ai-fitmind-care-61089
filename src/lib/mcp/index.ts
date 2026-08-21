import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listRecentVoiceLogs from "./tools/list-recent-voice-logs";
import logMood from "./tools/log-mood";
import listRecentMoods from "./tools/list-recent-moods";
import logSymptom from "./tools/log-symptom";
import listRecentSymptoms from "./tools/list-recent-symptoms";
import logNutrition from "./tools/log-nutrition";
import logHealthMetrics from "./tools/log-health-metrics";
import getProfile from "./tools/get-profile";

// OAuth issuer must be the direct Supabase host, built from the project ref.
// Vite inlines VITE_SUPABASE_PROJECT_ID at build time so this stays import-safe.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "fitmind-care-mcp",
  title: "AI FitMind Care",
  version: "0.1.0",
  instructions:
    "Tools for AI FitMind Care — a voice-enabled preventive health and mental wellness companion. " +
    "Use these tools to read and record the signed-in user's health data: voice logs, mood entries, " +
    "symptoms, nutrition, and biometric metrics. All operations are scoped to the authenticated user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getProfile,
    listRecentVoiceLogs,
    logMood,
    listRecentMoods,
    logSymptom,
    listRecentSymptoms,
    logNutrition,
    logHealthMetrics,
  ],
});
