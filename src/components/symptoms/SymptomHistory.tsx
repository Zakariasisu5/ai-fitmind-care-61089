import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SymptomEntry {
  id: string;
  symptom: string;
  severity: string;
  body_area: string | null;
  duration: string | null;
  notes: string | null;
  created_at: string;
}

export const SymptomHistory: React.FC = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<SymptomEntry[]>([]);
  const [commonSymptoms, setCommonSymptoms] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSymptomHistory();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('symptoms-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'symptoms'
        },
        () => {
          fetchSymptomHistory();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSymptomHistory = async () => {
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
        .from('symptoms')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setEntries(data || []);

      // Calculate common symptoms
      const symptomCounts = new Map<string, number>();
      data?.forEach((entry) => {
        symptomCounts.set(entry.symptom, (symptomCounts.get(entry.symptom) || 0) + 1);
      });

      setCommonSymptoms(symptomCounts);
    } catch (error) {
      console.error('Error fetching symptom history:', error);
      toast({
        title: 'Error loading symptoms',
        description: error instanceof Error ? error.message : 'Failed to load symptom history',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (label: string) => {
    switch (label.toLowerCase()) {
      case 'mild': return 'text-yellow-500';
      case 'moderate': return 'text-orange-500';
      case 'severe': return 'text-red-500';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getSeverityBadgeVariant = (label: string) => {
    switch (label.toLowerCase()) {
      case 'critical':
      case 'severe':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  const topSymptoms = Array.from(commonSymptoms.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Symptom History</span>
          {entries.length > 0 && (
            <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>{entries.length} entries</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Most Common Symptoms */}
        {topSymptoms.length > 0 && (
          <div className="space-y-2 pb-4 border-b">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-primary" />
              Most Common Symptoms
            </div>
            <div className="flex flex-wrap gap-2">
              {topSymptoms.map(([symptom, count]) => (
                <Badge key={symptom} variant="outline">
                  {symptom} ({count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recent Entries */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Loading symptoms...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No symptoms logged yet. Start tracking your symptoms!
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Badge variant="default">
                      {entry.symptom}
                    </Badge>
                  </div>
                  <Badge variant={getSeverityBadgeVariant(entry.severity)}>
                    {entry.severity}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  {entry.body_area && (
                    <div>
                      <span className="font-medium">Area:</span> {entry.body_area}
                    </div>
                  )}
                  {entry.duration && (
                    <div>
                      <span className="font-medium">Duration:</span> {entry.duration}
                    </div>
                  )}
                </div>

                {entry.notes && (
                  <p className="text-sm text-muted-foreground border-t pt-2">
                    {entry.notes}
                  </p>
                )}

                <div className="text-xs text-muted-foreground">
                  {format(new Date(entry.created_at), 'MMM dd, yyyy • h:mm a')}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};