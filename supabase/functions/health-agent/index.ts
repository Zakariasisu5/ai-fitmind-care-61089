import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { healthData, userHistory, action } = await req.json();
    
    console.log('Health Agent processing:', { action, healthData });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Define agent's system prompt
    const systemPrompt = `You are FitMind Care AI Agent, an autonomous health companion.

Your role:
- Analyze health data (biometrics, symptoms, emotional state)
- Detect patterns and anomalies
- Provide personalized health suggestions
- Escalate emergencies appropriately
- Support mental wellness through empathetic interaction

Guidelines:
- Be empathetic and culturally sensitive
- Prioritize user safety (escalate severe symptoms)
- Provide actionable, evidence-based advice
- Respect privacy and medical boundaries
- Never diagnose - suggest professional consultation when needed

Current action: ${action}`;

    // Build context from user data
    const userContext = `
Current Health Data:
${JSON.stringify(healthData, null, 2)}

Recent History:
${userHistory ? JSON.stringify(userHistory, null, 2) : 'No previous data'}

Task: ${action === 'analyze' ? 'Analyze the current health data and provide insights' : 
        action === 'suggest' ? 'Generate health improvement suggestions' :
        action === 'assess_risk' ? 'Assess health risks and alert if needed' :
        'Process the health data'}

Provide a comprehensive response with actionable insights.`;

    console.log('Calling AI gateway...');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContext }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract response
    const agentResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({
        agentResponse,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in health-agent:', error);
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
