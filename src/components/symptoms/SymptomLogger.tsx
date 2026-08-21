import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Stethoscope, Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const COMMON_SYMPTOMS = [
  'Headache', 'Fever', 'Cough', 'Fatigue', 'Nausea',
  'Dizziness', 'Sore Throat', 'Body Ache', 'Chills', 'Shortness of Breath'
];

const BODY_AREAS = [
  'Head', 'Chest', 'Abdomen', 'Back', 'Arms', 'Legs', 'Throat', 'Other'
];

export const SymptomLogger: React.FC = () => {
  const { toast } = useToast();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [severity, setSeverity] = useState(5);
  const [bodyArea, setBodyArea] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const addCustomSymptom = () => {
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms([...selectedSymptoms, customSymptom.trim()]);
      setCustomSymptom('');
    }
  };

  const removeSymptom = (symptom: string) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
  };

  const getSeverityLabel = (value: number) => {
    if (value <= 2) return 'mild';
    if (value <= 5) return 'moderate';
    if (value <= 8) return 'severe';
    return 'critical';
  };

  const getSeverityColor = (value: number) => {
    if (value <= 2) return 'text-yellow-500';
    if (value <= 5) return 'text-orange-500';
    if (value <= 8) return 'text-red-500';
    return 'text-destructive';
  };

  const handleSubmit = async () => {
    if (selectedSymptoms.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one symptom',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('You must be logged in to log symptoms');

      const severityLabel = getSeverityLabel(severity);
      
      // Insert each symptom as a separate entry
      const symptomEntries = selectedSymptoms.map(symptom => ({
        user_id: user.id,
        symptom,
        severity: severityLabel,
        body_area: bodyArea || null,
        duration: duration || null,
        notes: notes || null
      }));

      const { error: insertError } = await supabase
        .from('symptoms')
        .insert(symptomEntries);

      if (insertError) throw insertError;

      toast({
        title: 'Symptoms Logged',
        description: `${selectedSymptoms.length} symptom${selectedSymptoms.length > 1 ? 's' : ''} recorded`,
      });

      // Reset form
      setSelectedSymptoms([]);
      setSeverity(5);
      setBodyArea('');
      setDuration('');
      setNotes('');
    } catch (error) {
      console.error('Error logging symptoms:', error);
      
      let errorMessage = 'Failed to log symptoms';
      
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          Log Your Symptoms
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Common Symptoms */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Symptoms</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map((symptom) => (
              <Badge
                key={symptom}
                variant={selectedSymptoms.includes(symptom) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleSymptom(symptom)}
              >
                {symptom}
              </Badge>
            ))}
          </div>
        </div>

        {/* Custom Symptom */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Add Custom Symptom</label>
          <div className="flex gap-2">
            <Input
              value={customSymptom}
              onChange={(e) => setCustomSymptom(e.target.value)}
              placeholder="Enter custom symptom"
              onKeyPress={(e) => e.key === 'Enter' && addCustomSymptom()}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomSymptom}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Selected Symptoms */}
        {selectedSymptoms.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Selected Symptoms</label>
            <div className="flex flex-wrap gap-2">
              {selectedSymptoms.map((symptom) => (
                <Badge
                  key={symptom}
                  variant="secondary"
                  className="cursor-pointer"
                >
                  {symptom}
                  <X
                    className="h-3 w-3 ml-1"
                    onClick={() => removeSymptom(symptom)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Severity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Severity Level</label>
            <span className={`font-semibold ${getSeverityColor(severity)}`}>
              {getSeverityLabel(severity)} ({severity}/10)
            </span>
          </div>
          <Slider
            value={[severity]}
            onValueChange={(value) => setSeverity(value[0])}
            min={1}
            max={10}
            step={1}
          />
        </div>

        {/* Body Area */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Affected Body Area</label>
          <div className="flex flex-wrap gap-2">
            {BODY_AREAS.map((area) => (
              <Badge
                key={area}
                variant={bodyArea === area ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setBodyArea(area)}
              >
                {area}
              </Badge>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Duration</label>
          <Input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g., 2 hours, 3 days"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Additional Notes (Optional)</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe your symptoms in detail, triggers, or other relevant information..."
            rows={3}
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Saving...' : 'Log Symptoms'}
        </Button>
      </CardContent>
    </Card>
  );
};