import { MainLayout } from '@/components/layout/MainLayout';
import { MoodTracker } from '@/components/mood/MoodTracker';
import { MoodHistory } from '@/components/mood/MoodHistory';

const MentalHealth = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Mental Health & Mood Tracking
          </h1>
          <p className="text-muted-foreground">
            Track your daily mood, energy, and mental wellness. Build healthy habits and identify patterns.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <MoodTracker />
          <MoodHistory />
        </div>
      </div>
    </MainLayout>
  );
};

export default MentalHealth;
