import { MainLayout } from '@/components/layout/MainLayout';
import { SymptomLogger } from '@/components/symptoms/SymptomLogger';
import { SymptomHistory } from '@/components/symptoms/SymptomHistory';

const SymptomsTracker = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400">
            Symptoms Tracker
          </h1>
          <p className="text-muted-foreground">
            Track your physical symptoms, monitor severity levels, and identify patterns over time.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <SymptomLogger />
          <SymptomHistory />
        </div>
      </div>
    </MainLayout>
  );
};

export default SymptomsTracker;
