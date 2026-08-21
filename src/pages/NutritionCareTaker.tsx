import { MainLayout } from '@/components/layout/MainLayout';
import { MealLogger } from '@/components/nutrition/MealLogger';
import { NutritionHistory } from '@/components/nutrition/NutritionHistory';

const NutritionCareTaker = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
            Nutrition Care Taker
          </h1>
          <p className="text-muted-foreground">
            Track your daily meals, water intake, and build healthy eating habits.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <MealLogger />
          <NutritionHistory />
        </div>
      </div>
    </MainLayout>
  );
};

export default NutritionCareTaker;
