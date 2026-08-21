import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BiometricData {
  source: string;
  heart_rate?: number;
  blood_oxygen?: number;
  steps?: number;
  calories_burned?: number;
  sleep_hours?: number;
  hrv?: number;
  respiratory_rate?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  raw_data?: Record<string, any>;
  recorded_at?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { action, source, data: biometricData } = await req.json();

    console.log('MCP Biometric Sync:', { action, source, userId: user.id });

    // Fetch data from MCP server (simulated - replace with actual MCP integration)
    if (action === 'fetch') {
      const mcpData = await fetchFromMCPServer(source);
      
      // Store in database
      const { data, error } = await supabase
        .from('wearable_data')
        .insert({
          user_id: user.id,
          ...mcpData,
          synced_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Manual data upload
    if (action === 'upload') {
      const { data, error } = await supabase
        .from('wearable_data')
        .insert({
          user_id: user.id,
          ...biometricData,
          synced_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get latest data
    if (action === 'get_latest') {
      const { data, error } = await supabase
        .from('wearable_data')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in mcp-biometric-sync:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// MCP Server integration (placeholder - implement actual MCP protocol)
async function fetchFromMCPServer(source: string): Promise<BiometricData> {
  // This is a placeholder for MCP server integration
  // In production, this would connect to actual MCP servers for:
  // - Fitbit, Apple Health, Garmin, Samsung Health, etc.
  
  console.log('Fetching from MCP server:', source);
  
  // Simulated data - replace with actual MCP protocol implementation
  return {
    source,
    heart_rate: Math.floor(Math.random() * 40) + 60,
    blood_oxygen: Math.floor(Math.random() * 5) + 95,
    steps: Math.floor(Math.random() * 5000) + 5000,
    calories_burned: Math.floor(Math.random() * 1000) + 1500,
    sleep_hours: Math.random() * 3 + 6,
    recorded_at: new Date().toISOString()
  };
}
