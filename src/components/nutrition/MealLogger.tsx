import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Utensils, Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const DIETARY_TAGS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'High-Protein', 'Low-Carb'];

export const MealLogger: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mealType, setMealType] = useState('Breakfast');
  const [foodItems, setFoodItems] = useState<string[]>(['']);
  const [waterIntake, setWaterIntake] = useState(8);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addFoodItem = () => {
    setFoodItems([...foodItems, '']);
  };

  const removeFoodItem = (index: number) => {
    if (foodItems.length > 1) {
      setFoodItems(foodItems.filter((_, i) => i !== index));
    }
  };

  const updateFoodItem = (index: number, value: string) => {
    const updated = [...foodItems];
    updated[index] = value;
    setFoodItems(updated);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    const validFoodItems = foodItems.filter(item => item.trim() !== '');
    
    if (validFoodItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one food item',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to log meals',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('nutrition_entries').insert({
        user_id: user.id,
        meal_type: mealType,
        food_items: validFoodItems.join(', '),
        food_items_list: validFoodItems,
        water_intake: waterIntake,
        dietary_tags: selectedTags,
      });

      if (error) throw error;

      toast({
        title: 'Meal Logged',
        description: `${mealType} saved successfully`,
      });

      // Reset form
      setFoodItems(['']);
      setWaterIntake(8);
      setSelectedTags([]);
    } catch (error) {
      console.error('Error logging meal:', error);
      
      let errorMessage = 'Failed to log meal';
      
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
          <Utensils className="h-5 w-5 text-primary" />
          Log Your Meal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Meal Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Meal Type</label>
          <div className="flex flex-wrap gap-2">
            {MEAL_TYPES.map((type) => (
              <Badge
                key={type}
                variant={mealType === type ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setMealType(type)}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>

        {/* Food Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Food Items</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFoodItem}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
          <div className="space-y-2">
            {foodItems.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateFoodItem(index, e.target.value)}
                  placeholder="e.g., Grilled chicken salad"
                />
                {foodItems.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFoodItem(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Water Intake */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Water Intake: {waterIntake} glasses (8oz each)
          </label>
          <Slider
            value={[waterIntake]}
            onValueChange={(value) => setWaterIntake(value[0])}
            min={0}
            max={15}
            step={1}
          />
        </div>

        {/* Dietary Tags */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Dietary Tags (Optional)</label>
          <div className="flex flex-wrap gap-2">
            {DIETARY_TAGS.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Saving...' : 'Log Meal'}
        </Button>
      </CardContent>
    </Card>
  );
};