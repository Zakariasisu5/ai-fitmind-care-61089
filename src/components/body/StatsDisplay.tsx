
import React from 'react';
import { StatsCard } from "@/components/ui/StatsCard";
import { Wind, Activity, Watch } from "lucide-react";

interface StatsDisplayProps {
  activeSection: string;
  hasData: boolean;
  healthData: any;
  noDataMessage: string;
  generateAISuggestion: (section: string, metrics: any) => string;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({
  activeSection,
  hasData,
  healthData,
  noDataMessage,
  generateAISuggestion
}) => {
  // Format timestamp to relative time (e.g., "2h ago")
  const formatRelativeTime = (timestamp: string) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    
    // Convert to hours
    const diffHrs = Math.round(diffMs / (1000 * 60 * 60));
    
    if (diffHrs < 1) {
      return "Just now";
    } else if (diffHrs === 1) {
      return "1h ago";
    } else if (diffHrs < 24) {
      return `${diffHrs}h ago`;
    } else {
      const diffDays = Math.round(diffHrs / 24);
      return `${diffDays}d ago`;
    }
  };

  // Get wearable source label
  const getWearableSourceLabel = (source?: string) => {
    if (!source) return '';
    
    switch(source) {
      case 'fitbit': return 'Fitbit';
      case 'apple_health': return 'Apple Health';
      case 'garmin': return 'Garmin';
      case 'samsung_health': return 'Samsung Health';
      case 'manual': return 'Manual Entry';
      default: return source;
    }
  };

  // Display wearable data timestamp if available
  const getDataSourceInfo = () => {
    if (hasData && healthData.metrics?.wearable_source) {
      const source = getWearableSourceLabel(healthData.metrics.wearable_source);
      const time = formatRelativeTime(healthData.metrics.wearable_timestamp);
      return `Data from ${source} • ${time}`;
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {activeSection === "Heart" && (
        <>
          <StatsCard title="BMI" value={hasData ? healthData.metrics.bmi : noDataMessage} icon="https://cdn.builder.io/api/v1/image/assets/87b026b6426c43e89a984782635271b0/a5657f9b0aa21fe2ce16cc84027cce6e1cfe787b9c9460bae9645d106c42729a" />
          <StatsCard title="RBC Count" value={hasData ? "84" : noDataMessage} icon="https://cdn.builder.io/api/v1/image/assets/87b026b6426c43e89a984782635271b0/f2130bdec818d159d6af214a926bf83f87c9cd3f79ec86f638f121213c4fbf92" />
          <StatsCard title="WEIGHT (in Kg.)" value={hasData ? "56" : noDataMessage} icon="https://cdn.builder.io/api/v1/image/assets/87b026b6426c43e89a984782635271b0/4891785569dfed3f58674c7fd1e0a8727172543fd0a1bc1795ee6891b319eb02" />
          <StatsCard title="HEIGHT (in m.)" value={hasData ? "1.68" : noDataMessage} icon="https://cdn.builder.io/api/v1/image/assets/87b026b6426c43e89a984782635271b0/ae9249019c779f92566055119cbe125e349534e8b189871709b9d638f8c70ac9" />
          {hasData && healthData.metrics?.heart_rate && (
            <StatsCard 
              title="HEART RATE" 
              value={`${healthData.metrics.heart_rate} bpm`} 
              icon={<Activity className="w-[65px] h-[65px] text-white" />} 
            />
          )}
        </>
      )}
      {activeSection === "Lungs" && (
        <>
          <StatsCard 
            title="Lung Capacity" 
            value={hasData ? "5.2" : noDataMessage} 
            icon={<Wind className="w-[74px] h-[74px] text-white animate-pulse" />} 
          />
          <StatsCard title="Breathing Rate" value={hasData ? "16" : noDataMessage} icon="/lovable-uploads/dcb50de4-9357-4a6b-a368-cdceaa3a466e.png" />
          <StatsCard title="O2 Saturation" value={hasData ? healthData.metrics.blood_oxygen : noDataMessage} icon="/lovable-uploads/c5c57cdc-b136-4e1f-9f5e-6383c495c392.png" />
          <StatsCard title="Air Quality" value={hasData ? "Good" : noDataMessage} icon="/lovable-uploads/592514ab-117e-48d3-8b2a-2977cb80ebcb.png" />
        </>
      )}
      {activeSection === "Stomach" && (
        <>
          <StatsCard title="Digestion Rate" value={hasData ? "Normal" : noDataMessage} icon="/lovable-uploads/e612e9d4-5a63-439b-a302-23ead14dce8a.png" />
          <StatsCard title="pH Level" value={hasData ? "2.5" : noDataMessage} icon="/lovable-uploads/26daebe9-85cc-4b06-97f0-92560f0d9a7d.png" />
          <StatsCard title="Last Meal" value={hasData ? "2h ago" : noDataMessage} icon="/lovable-uploads/672b14b9-7e9e-4e4e-a7ba-34bd850dd3a1.png" />
          <StatsCard title="Gut Health" value={hasData ? "Good" : noDataMessage} icon="/lovable-uploads/b68c7ffe-a5e9-415c-8c11-6bf497b320c5.png" />
        </>
      )}
      {activeSection === "Head" && (
        <>
          <StatsCard title="Brain Activity" value={hasData ? "Active" : noDataMessage} icon="/lovable-uploads/7cc1b9af-81a6-4303-a6be-0c7574c20b4b.png" />
          <StatsCard title="Sleep Quality" value={hasData ? (healthData.metrics?.sleep_hours ? `${healthData.metrics.sleep_hours}h` : "Good") : noDataMessage} icon="/lovable-uploads/7d894f37-d558-4836-bea7-51de09f3f6d2.png" />
          <StatsCard title="Stress Level" value={hasData ? "Low" : noDataMessage} icon="/lovable-uploads/71bf62b7-f722-4b3d-9424-0f3d7409c474.png" />
          <StatsCard title="Mood" value={hasData ? "Happy" : noDataMessage} icon="/lovable-uploads/d9e996cd-9ccc-4330-a51d-e58b1be0aa9e.png" />
        </>
      )}
      {activeSection === "Eyes" && (
        <>
          <StatsCard title="Vision Score" value={hasData ? "20/20" : noDataMessage} icon="/lovable-uploads/93a287f4-ec35-48c4-86f2-bc9ec8dc0707.png" />
          <StatsCard title="Eye Pressure" value={hasData ? "Normal" : noDataMessage} icon="/lovable-uploads/709b3dc6-e032-47b5-b231-12e8fbdb6ecc.png" />
          <StatsCard title="Color Vision" value={hasData ? "Perfect" : noDataMessage} icon="/lovable-uploads/df8db3b9-af02-4754-b201-e7a29a891185.png" />
          <StatsCard title="Last Check" value={hasData ? "2m ago" : noDataMessage} icon="/lovable-uploads/a2bc749b-c0b8-41ec-ba9f-a775d763bd48.png" />
        </>
      )}
      {hasData && (
        <>
          <div className="mt-4 text-sm text-gray-400 italic">
            {generateAISuggestion(activeSection, healthData.metrics)}
          </div>
          {getDataSourceInfo() && (
            <div className="flex items-center text-xs text-blue-300 mt-2">
              <Watch className="w-3 h-3 mr-1" />
              {getDataSourceInfo()}
            </div>
          )}
        </>
      )}
    </div>
  );
};
