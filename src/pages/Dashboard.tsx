import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Brain, 
  Heart, 
  Stethoscope, 
  TrendingUp,
  AlertCircle,
  Zap,
  Moon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function Dashboard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVoiceLogs: 0,
    totalSymptoms: 0,
    totalMoodEntries: 0,
    recentInsights: [] as any[]
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch counts
      const [voiceLogsCount, symptomsCount, moodEntriesCount, insights] = await Promise.all([
        supabase.from('voice_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('symptoms').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('mood_entries').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('health_insights').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
      ]);

      setStats({
        totalVoiceLogs: voiceLogsCount.count || 0,
        totalSymptoms: symptomsCount.count || 0,
        totalMoodEntries: moodEntriesCount.count || 0,
        recentInsights: insights.data || []
      });

      // Fetch recent activity from all sources
      const [recentVoice, recentSymptoms, recentMood] = await Promise.all([
        supabase.from('voice_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
        supabase.from('symptoms').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
        supabase.from('mood_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3)
      ]);

      const activity = [
        ...(recentVoice.data || []).map(v => ({ type: 'voice', data: v, timestamp: v.created_at })),
        ...(recentSymptoms.data || []).map(s => ({ type: 'symptom', data: s, timestamp: s.created_at })),
        ...(recentMood.data || []).map(m => ({ type: 'mood', data: m, timestamp: m.created_at }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

      setRecentActivity(activity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error loading dashboard',
        description: error instanceof Error ? error.message : 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'voice': return <Activity className="h-4 w-4" />;
      case 'symptom': return <Stethoscope className="h-4 w-4" />;
      case 'mood': return <Heart className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <p className="text-center text-muted-foreground">Loading dashboard...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
            Health Dashboard
          </h1>
          <p className="text-muted-foreground">
            Your comprehensive health overview and recent activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voice Logs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVoiceLogs}</div>
              <p className="text-xs text-muted-foreground">Total recordings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Symptoms Tracked</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSymptoms}</div>
              <p className="text-xs text-muted-foreground">Total symptoms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mood Entries</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMoodEntries}</div>
              <p className="text-xs text-muted-foreground">Total check-ins</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentInsights.length}</div>
              <p className="text-xs text-muted-foreground">Recent insights</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No recent activity. Start tracking your health!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium capitalize">{activity.type} Entry</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {activity.type === 'voice' && activity.data.transcription}
                          {activity.type === 'symptom' && activity.data.symptom}
                          {activity.type === 'mood' && activity.data.mood}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(activity.timestamp), 'MMM dd, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Health Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentInsights.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No insights yet. Keep logging your health data!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentInsights.map((insight) => (
                    <div
                      key={insight.id}
                      className="p-4 rounded-lg border bg-primary/5 border-primary/20"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {insight.insight_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {format(new Date(insight.created_at), 'MMM dd')}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{insight.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}