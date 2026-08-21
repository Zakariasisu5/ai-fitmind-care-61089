import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, Droplets, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface NutritionEntry {
  id: string;
  meal_type: string;
  food_items: string[];
  water_intake: number;
  dietary_tags: string[];
  logged_at: string;
}

export const NutritionHistory: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [totalWater, setTotalWater] = useState(0);
  const [totalMeals, setTotalMeals] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetchNutritionHistory();

    const channel = supabase
      .channel('nutrition-entries-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'nutrition_entries', filter: `user_id=eq.${user.id}` },
        () => fetchNutritionHistory()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchNutritionHistory = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('nutrition_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const mapped: NutritionEntry[] = (data || []).map((row: any) => ({
        id: row.id,
        meal_type: row.meal_type,
        food_items: Array.isArray(row.food_items_list) && row.food_items_list.length
          ? row.food_items_list
          : (typeof row.food_items === 'string'
              ? row.food_items.split(',').map((s: string) => s.trim()).filter(Boolean)
              : []),
        water_intake: row.water_intake ?? 0,
        dietary_tags: row.dietary_tags ?? [],
        logged_at: row.created_at,
      }));

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEntries = mapped.filter((entry) => {
        const d = new Date(entry.logged_at);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });

      setEntries(mapped.slice(0, 7));
      setTotalWater(todayEntries.reduce((sum, e) => sum + (e.water_intake || 0), 0));
      setTotalMeals(todayEntries.length);
    } catch (error) {
      console.error('Error fetching nutrition history:', error);
    }
  };

  const getMealIcon = (mealType: string) => {
    return <Coffee className="h-5 w-5 text-primary" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Nutrition Tracking</span>
          <div className="flex items-center gap-4 text-sm font-normal">
            <div className="flex items-center gap-1">
              <Coffee className="h-4 w-4 text-primary" />
              <span>{totalMeals} meals today</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span>{totalWater} glasses</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No nutrition entries yet. Start logging your meals!
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="mt-1">
                  {getMealIcon(entry.meal_type)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{entry.meal_type}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(entry.logged_at), 'MMM dd, h:mm a')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <ul className="text-sm text-muted-foreground space-y-0.5">
                      {entry.food_items.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <Droplets className="h-3 w-3" />
                      <span>{entry.water_intake} glasses</span>
                    </div>
                    {entry.dietary_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.dietary_tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};