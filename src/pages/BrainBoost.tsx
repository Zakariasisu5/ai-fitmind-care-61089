import { MainLayout } from '@/components/layout/MainLayout';
import { Brain } from 'lucide-react';
import { MemoryGame } from '@/components/brain/MemoryGame';
import { MathChallenge } from '@/components/brain/MathChallenge';
import { PatternGame } from '@/components/brain/PatternGame';
import { ProgressTracker } from '@/components/brain/ProgressTracker';

const BrainBoost = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Brain Boost Buddy
          </h1>
        </div>

        <p className="text-muted-foreground mb-8">
          Challenge your mind with interactive games designed to improve memory, focus, and cognitive abilities.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <MemoryGame />
          <MathChallenge />
          <PatternGame />
        </div>

        <ProgressTracker />
      </div>
    </MainLayout>
  );
};

export default BrainBoost;
