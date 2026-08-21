import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Smile, Meh, Frown, Heart, Brain, Moon, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const MOOD_LABELS = [
  { value: 1, label: 'Terrible', icon: Frown, color: 'text-red-500' },
  { value: 3, label: 'Bad', icon: Frown, color: 'text-orange-500' },
  { value: 5, label: 'Okay', icon: Meh, color: 'text-yellow-500' },
  { value: 7, label: 'Good', icon: Smile, color: 'text-green-500' },
  { value: 10, label: 'Excellent', icon: Smile, color: 'text-emerald-500' }
];

const ACTIVITIES = [
  'Exercise', 'Meditation', 'Social', 'Work', 'Outdoors', 
  'Reading', 'Music', 'Therapy', 'Hobby', 'Rest'
];

const TRIGGERS = [
  'Stress', 'Anxiety', 'Work Pressure', 'Relationship', 
  'Health', 'Finance', 'Sleep', 'Social', 'Other'
];

export const MoodTracker: React.FC = () => {
  const { toast } = useToast();
  const [moodScore, setMoodScore] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [notes, setNotes] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getMoodLabel = (score: number) => {
    return MOOD_LABELS.reduce((prev, curr) => 
      Math.abs(curr.value - score) < Math.abs(prev.value - score) ? curr : prev
    );
  };

  const toggleItem = (item: string, list: string[], setter: (list: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter(i => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('You must be logged in to log mood entries');

      const moodLabel = getMoodLabel(moodScore);

      const { error: insertError } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          mood: moodLabel.label,
          mood_score: moodScore,
          energy_level: energyLevel,
          stress_level: stressLevel,
          anxiety_level: anxietyLevel,
          sleep_quality: sleepQuality,
          activities: selectedActivities.length > 0 ? selectedActivities : null,
          triggers: selectedTriggers.length > 0 ? selectedTriggers : null,
          notes: notes || null
        });

      if (insertError) throw insertError;

      toast({
        title: 'Mood Logged',
        description: `Feeling ${moodLabel.label.toLowerCase()} today`,
      });

      // Reset form
      setMoodScore(5);
      setEnergyLevel(5);
      setStressLevel(5);
      setAnxietyLevel(5);
      setSleepQuality(5);
      setNotes('');
      setSelectedActivities([]);
      setSelectedTriggers([]);

    } catch (error) {
      console.error('Error logging mood:', error);
      
      let errorMessage = 'Failed to log mood entry';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const err = error as any;
        if (err.message) errorMessage = err.message;
        if (err.details) errorMessage = `${errorMessage}\n\nDetails: ${err.details}`;
        if (err.hint) errorMessage = `${errorMessage}\n\nHint: ${err.hint}`;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentMood = getMoodLabel(moodScore);
  const MoodIcon = currentMood.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Daily Mood Check-In
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">How are you feeling?</label>
            <div className="flex items-center gap-2">
              <MoodIcon className={`h-6 w-6 ${currentMood.color}`} />
              <span className={`font-semibold ${currentMood.color}`}>
                {currentMood.label}
              </span>
            </div>
          </div>
          <Slider
            value={[moodScore]}
            onValueChange={(value) => setMoodScore(value[0])}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
        </div>

        {/* Energy Level */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Energy Level: {energyLevel}/10
          </label>
          <Slider
            value={[energyLevel]}
            onValueChange={(value) => setEnergyLevel(value[0])}
            min={1}
            max={10}
            step={1}
          />
        </div>

        {/* Stress Level */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Stress Level: {stressLevel}/10
          </label>
          <Slider
            value={[stressLevel]}
            onValueChange={(value) => setStressLevel(value[0])}
            min={1}
            max={10}
            step={1}
          />
        </div>

        {/* Anxiety Level */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Anxiety Level: {anxietyLevel}/10</label>
          <Slider
            value={[anxietyLevel]}
            onValueChange={(value) => setAnxietyLevel(value[0])}
            min={1}
            max={10}
            step={1}
          />
        </div>

        {/* Sleep Quality */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Moon className="h-4 w-4" />
            Sleep Quality: {sleepQuality}/10
          </label>
          <Slider
            value={[sleepQuality]}
            onValueChange={(value) => setSleepQuality(value[0])}
            min={1}
            max={10}
            step={1}
          />
        </div>

        {/* Activities */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Activities Today</label>
          <div className="flex flex-wrap gap-2">
            {ACTIVITIES.map((activity) => (
              <Badge
                key={activity}
                variant={selectedActivities.includes(activity) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleItem(activity, selectedActivities, setSelectedActivities)}
              >
                {activity}
              </Badge>
            ))}
          </div>
        </div>

        {/* Triggers */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Triggers/Challenges</label>
          <div className="flex flex-wrap gap-2">
            {TRIGGERS.map((trigger) => (
              <Badge
                key={trigger}
                variant={selectedTriggers.includes(trigger) ? 'destructive' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleItem(trigger, selectedTriggers, setSelectedTriggers)}
              >
                {trigger}
              </Badge>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Notes (Optional)</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How are you feeling today? Any thoughts to share?"
            rows={3}
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Saving...' : 'Log Mood'}
        </Button>
      </CardContent>
    </Card>
  );
};