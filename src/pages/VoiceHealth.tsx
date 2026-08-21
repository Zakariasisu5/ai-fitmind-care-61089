import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { VoiceHealthLogger } from '@/components/VoiceHealthLogger';
import { VoiceHistoryList } from '@/components/voice/VoiceHistoryList';
import { MedicalReportForm } from '@/components/ui/MedicalReportForm';
import { Button } from '@/components/ui/button';
import { FileUp } from 'lucide-react';

const VoiceHealth = () => {
  const [showReportForm, setShowReportForm] = useState(false);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Voice Health Logger
              </h1>
              <p className="text-muted-foreground">
                Your AI-powered health companion. Share your health status by voice and get instant analysis.
              </p>
            </div>
            <Button 
              onClick={() => setShowReportForm(true)}
              className="flex items-center gap-2"
            >
              <FileUp className="h-4 w-4" />
              Upload Report
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <VoiceHealthLogger />
          <VoiceHistoryList />
        </div>
        
        {showReportForm && (
          <MedicalReportForm onClose={() => setShowReportForm(false)} />
        )}
      </div>
    </MainLayout>
  );
};

export default VoiceHealth;
