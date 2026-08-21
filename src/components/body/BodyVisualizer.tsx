
import React from 'react';

interface BodyVisualizerProps {
  activeSection: string;
  getImageForSection: (section: string) => string;
}

export const BodyVisualizer: React.FC<BodyVisualizerProps> = ({
  activeSection,
  getImageForSection
}) => {
  return (
    <div className="relative w-[586px] max-w-full h-[600px] flex items-center justify-center">
      <div className="bg-[rgba(255,255,255,0.1)] rounded-[50%] w-full h-full flex items-center justify-center overflow-hidden">
        <img 
          loading="lazy" 
          src={getImageForSection(activeSection)} 
          className="w-full h-auto object-contain" 
          alt={`${activeSection} visualization`} 
        />
      </div>
    </div>
  );
};
