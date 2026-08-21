import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define types for wearable data sources
export type WearableSource = "fitbit" | "apple_health" | "garmin" | "samsung_health" | "manual";

// Interface for wearable data structure
export interface WearableData {
  heart_rate?: number;
  blood_oxygen?: number;
  steps?: number;
  calories_burned?: number;
  sleep_hours?: number;
  source: WearableSource;
  timestamp: string;
}

const fetchHealthMetrics = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    const user = session.user;

    // Fetch latest metrics from database
    const { data: metrics, error: metricsError } = await supabase
      .from("health_metrics")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (metricsError) {
      console.error("Error fetching health metrics:", metricsError);
      toast.error("Failed to load health metrics", {
        description: metricsError.message
      });
    }

    // Fetch health insights
    const { data: insights, error: insightsError } = await supabase
      .from("health_insights")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (insightsError) {
      console.error("Error fetching health insights:", insightsError);
      toast.error("Failed to load health insights", {
        description: insightsError.message
      });
    }

    return { 
      metrics, 
      insights: insights || [],
    };
  } catch (error: any) {
    if (error?.name === "AuthSessionMissingError" || error?.__isAuthError) {
      return null;
    }
    console.error("Error in fetchHealthMetrics:", error);
    toast.error("Failed to load health data", {
      description: error.message || "Please try refreshing the page."
    });
    return null;
  }
};

export const useHealthData = () => {
  return useQuery({
    queryKey: ["health-data"],
    queryFn: fetchHealthMetrics,
    refetchInterval: 300000, // Refetch every 5 minutes to keep data updated
    retry: 2,
  });
};
