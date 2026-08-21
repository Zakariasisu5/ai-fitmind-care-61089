import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Smile, Meh, Frown } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MoodEntry {
  id: string;
  mood: string;
  mood_score: number | null;
  energy_level: number | null;
  stress_level: number | null;
  anxiety_level: number | null;
  sleep_quality: number | null;
  activities: string[] | null;
  triggers: string[] | null;
  notes: string | null;
  created_at: string;
}

export const MoodHistory: React.FC = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMoodHistory();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('mood-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mood_entries'
        },
        () => {
          fetchMoodHistory();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMoodHistory = async () => {
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
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setEntries(data || []);
      
      if (data && data.length >= 2) {
        const recentScores = data
          .slice(0, 5)
          .map(e => e.mood_score || 5)
          .filter(score => score !== null);
        
        if (recentScores.length >= 2) {
          const avg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
          const firstHalf = recentScores.slice(0, Math.ceil(recentScores.length / 2));
          const secondHalf = recentScores.slice(Math.ceil(recentScores.length / 2));
          const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
          const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
          
          if (firstAvg > secondAvg + 1) setTrend('up');
          else if (secondAvg > firstAvg + 1) setTrend('down');
          else setTrend('stable');
        }
      }
    } catch (error) {
      console.error('Error fetching mood history:', error);
      toast({
        title: 'Error loading mood entries',
        description: error instanceof Error ? error.message : 'Failed to load mood history',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodIcon = (mood: string) => {
    const moodLower = mood.toLowerCase();
    if (moodLower.includes('excellent') || moodLower.includes('good')) {
      return <Smile className="h-4 w-4 text-green-500" />;
    } else if (moodLower.includes('okay')) {
      return <Meh className="h-4 w-4 text-yellow-500" />;
    } else {
      return <Frown className="h-4 w-4 text-red-500" />;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'down': return <TrendingDown className="h-5 w-5 text-red-500" />;
      default: return <Minus className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Mood History</span>
          {entries.length > 0 && (
            <div className="flex items-center gap-2">
              {getTrendIcon()}
              <span className="text-sm font-normal text-muted-foreground">
                {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Loading mood entries...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No mood entries yet. Start tracking your mood!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getMoodIcon(entry.mood)}
                    <span className="font-medium">{entry.mood}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(entry.created_at), 'MMM dd, yyyy • h:mm a')}
                  </span>
                </div>

                {entry.mood_score !== null && (
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    {entry.energy_level !== null && (
                      <div className="text-muted-foreground">
                        Energy: {entry.energy_level}/10
                      </div>
                    )}
                    {entry.stress_level !== null && (
                      <div className="text-muted-foreground">
                        Stress: {entry.stress_level}/10
                      </div>
                    )}
                    {entry.anxiety_level !== null && (
                      <div className="text-muted-foreground">
                        Anxiety: {entry.anxiety_level}/10
                      </div>
                    )}
                    {entry.sleep_quality !== null && (
                      <div className="text-muted-foreground">
                        Sleep: {entry.sleep_quality}/10
                      </div>
                    )}
                  </div>
                )}

                {entry.activities && entry.activities.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium mb-1">Activities:</p>
                    <div className="flex flex-wrap gap-1">
                      {entry.activities.map((activity, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {entry.triggers && entry.triggers.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium mb-1">Triggers:</p>
                    <div className="flex flex-wrap gap-1">
                      {entry.triggers.map((trigger, i) => (
                        <Badge key={i} variant="destructive" className="text-xs">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {entry.notes && (
                  <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                    {entry.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};