import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Brain, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VoiceEntry {
  id: string;
  transcription: string;
  healthData: {
    symptoms?: string[];
    mood?: string;
    severity?: string;
    sentiment?: string;
    biometrics?: Record<string, number>;
  };
  agentResponse?: string;
  logged_at: string;
}

export const VoiceHistoryList: React.FC = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<VoiceEntry[]>([]);
  const [stats, setStats] = useState({
    totalEntries: 0,
    commonSymptoms: [] as Array<[string, number]>,
    moodTrend: 'neutral' as 'positive' | 'negative' | 'neutral',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('voice-logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'voice_logs'
        },
        () => {
          fetchHistory();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) {
        setEntries([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('voice_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedEntries = data.map(entry => ({
        id: entry.id,
        transcription: entry.transcription || '',
        healthData: (entry.health_data as any) || {},
        agentResponse: entry.agent_response || '',
        logged_at: entry.created_at
      }));

      setEntries(formattedEntries);

      // Calculate stats from all entries
      const { data: allData, error: allError } = await supabase
        .from('voice_logs')
        .select('health_data')
        .eq('user_id', user.id);

      if (allError) throw allError;

      const symptomCounts = new Map<string, number>();
      let positiveCount = 0;
      let negativeCount = 0;

      allData.forEach((entry: any) => {
        const healthData = entry.health_data || {};
        healthData.symptoms?.forEach((symptom: string) => {
          symptomCounts.set(symptom, (symptomCounts.get(symptom) || 0) + 1);
        });

        if (healthData.sentiment === 'positive') positiveCount++;
        if (healthData.sentiment === 'negative') negativeCount++;
      });

      const topSymptoms = Array.from(symptomCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      setStats({
        totalEntries: allData.length,
        commonSymptoms: topSymptoms,
        moodTrend: positiveCount > negativeCount ? 'positive' :
                   negativeCount > positiveCount ? 'negative' : 'neutral',
      });
    } catch (error) {
      console.error('Error fetching voice health history:', error);
      toast({
        title: 'Error loading voice logs',
        description: error instanceof Error ? error.message : 'Failed to load voice history',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'emergency': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      {stats.totalEntries > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Health Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold">{stats.totalEntries}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mood Trend</p>
                <p className={`text-2xl font-bold ${
                  stats.moodTrend === 'positive' ? 'text-green-500' :
                  stats.moodTrend === 'negative' ? 'text-red-500' : 
                  'text-yellow-500'
                }`}>
                  {stats.moodTrend === 'positive' ? '↑' : 
                   stats.moodTrend === 'negative' ? '↓' : '→'}
                </p>
              </div>
            </div>
            
            {stats.commonSymptoms.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Common Symptoms</p>
                <div className="flex flex-wrap gap-2">
                  {stats.commonSymptoms.map(([symptom, count]) => (
                    <Badge key={symptom} variant="outline">
                      {symptom} ({count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Voice Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Loading voice logs...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No voice logs yet. Start recording your health status!
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors space-y-3"
                  >
                    {/* Timestamp */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(entry.logged_at), 'MMM dd, yyyy • h:mm a')}
                      </span>
                      {entry.healthData.severity && (
                        <Badge variant={getSeverityColor(entry.healthData.severity)}>
                          {entry.healthData.severity}
                        </Badge>
                      )}
                    </div>

                    {/* Transcription */}
                    <p className="text-sm italic text-muted-foreground">
                      &ldquo;{entry.transcription}&rdquo;
                    </p>

                    {/* Health Data */}
                    <div className="space-y-2">
                      {entry.healthData.symptoms && entry.healthData.symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {entry.healthData.symptoms.map((symptom, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {entry.healthData.mood && (
                        <p className="text-xs">
                          <span className="font-medium">Mood:</span> {entry.healthData.mood}
                        </p>
                      )}
                    </div>

                    {/* Agent Response */}
                    {entry.agentResponse && (
                      <div className="pt-2 border-t">
                        <div className="flex items-start gap-2">
                          <Brain className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {entry.agentResponse}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};