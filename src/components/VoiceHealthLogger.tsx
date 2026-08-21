import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Square, Loader2, Activity, Brain, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface HealthData {
  symptoms?: string[];
  mood?: string;
  biometrics?: {
    heart_rate?: number;
    blood_pressure_systolic?: number;
    blood_pressure_diastolic?: number;
    blood_oxygen?: number;
    temperature?: number;
    bmi?: number;
  };
  severity?: string;
  sentiment?: string;
  notes?: string;
}

export const VoiceHealthLogger = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [agentResponse, setAgentResponse] = useState('');
  const { toast } = useToast();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = processRecording;

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Share your health status...",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Could not access microphone. Please check your browser permissions.';
      
      toast({
        title: "Recording failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const processRecording = async () => {
    setIsProcessing(true);
    
    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('You must be logged in to save voice logs');

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        try {
          const base64Audio = (reader.result as string).split(',')[1];
          
          // Step 1: Voice to health data extraction
          const { data: extractionData, error: extractionError } = await supabase.functions.invoke(
            'voice-to-health-data',
            {
              body: { audio: base64Audio }
            }
          );

          if (extractionError) throw extractionError;

          console.log('Extraction result:', extractionData);
          setTranscription(extractionData.transcription);
          setHealthData(extractionData.healthData);

          // Step 2: Run ADK-TS agent analysis
          const { data: agentData, error: agentError } = await supabase.functions.invoke(
            'health-agent',
            {
              body: {
                healthData: extractionData.healthData,
                userHistory: null,
                action: 'analyze'
              }
            }
          );

          if (agentError) throw agentError;

          console.log('Agent result:', agentData);
          setAgentResponse(agentData.agentResponse);

          // Save to database
          const { error: insertError } = await supabase
            .from('voice_logs')
            .insert({
              user_id: user.id,
              transcription: extractionData.transcription,
              health_data: extractionData.healthData,
              agent_response: agentData.agentResponse
            });

          if (insertError) throw insertError;

          toast({
            title: "Health data logged",
            description: "AI agent has analyzed your input",
          });
        } catch (innerError) {
          throw innerError;
        } finally {
          setIsProcessing(false);
        }
      };
    } catch (error) {
      console.error('Error processing recording:', error);
      
      let errorMessage = 'Failed to process audio. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const err = error as any;
        if (err.message) errorMessage = err.message;
        if (err.error) errorMessage = err.error;
        if (err.details) errorMessage = `${errorMessage} - ${err.details}`;
      }
      
      toast({
        title: "Processing failed",
        description: errorMessage,
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'emergency': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Recording Control */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Voice Health Logger
          </CardTitle>
          <CardDescription>
            Share your symptoms, mood, or biometric data by voice
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Button
            size="lg"
            variant={isRecording ? "destructive" : "default"}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className="w-32 h-32 rounded-full"
          >
            {isProcessing ? (
              <Loader2 className="w-12 h-12 animate-spin" />
            ) : isRecording ? (
              <Square className="w-12 h-12" />
            ) : (
              <Mic className="w-12 h-12" />
            )}
          </Button>
          
          <p className="text-sm text-muted-foreground text-center">
            {isProcessing ? 'Processing your voice input...' :
             isRecording ? 'Recording... Tap to stop' :
             'Tap to start recording'}
          </p>
        </CardContent>
      </Card>

      {/* Transcription */}
      {transcription && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">What you said</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground italic">&ldquo;{transcription}&rdquo;</p>
          </CardContent>
        </Card>
      )}

      {/* Extracted Health Data */}
      {healthData && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Extracted Health Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthData.symptoms && healthData.symptoms.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Symptoms:</p>
                <div className="flex flex-wrap gap-2">
                  {healthData.symptoms.map((symptom, i) => (
                    <span key={i} className="px-3 py-1 bg-primary/10 rounded-full text-sm">
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {healthData.mood && (
              <div>
                <p className="text-sm font-medium">Mood: <span className="font-normal text-muted-foreground">{healthData.mood}</span></p>
              </div>
            )}

            {healthData.biometrics && Object.keys(healthData.biometrics).length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Biometrics:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(healthData.biometrics).map(([key, value]) => 
                    value !== null && (
                      <div key={key}>
                        <span className="text-muted-foreground">{key.replace(/_/g, ' ')}:</span> {value}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {healthData.severity && (
              <div className="flex items-center gap-2">
                <AlertCircle className={`w-4 h-4 ${getSeverityColor(healthData.severity)}`} />
                <p className="text-sm">
                  Severity: <span className={getSeverityColor(healthData.severity)}>{healthData.severity}</span>
                </p>
              </div>
            )}

            {healthData.sentiment && (
              <div>
                <p className="text-sm">
                  Sentiment: <span className="text-muted-foreground">{healthData.sentiment}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Agent Response */}
      {agentResponse && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Brain className="w-5 h-5" />
              AI Health Agent Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{agentResponse}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
