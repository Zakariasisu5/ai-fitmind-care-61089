
import React from 'react';
import { cn } from "@/lib/utils";

interface BodySectionProps {
  section: string;
  activeSection: string;
  hoveredSection: string | null;
  onSectionClick: (section: string) => void;
  onSectionHover: (section: string | null) => void;
}

export const BodySection: React.FC<BodySectionProps> = ({
  section,
  activeSection,
  hoveredSection,
  onSectionClick,
  onSectionHover
}) => {
  return (
    <div className="relative">
      <button
        className={cn(
          "text-white transition-opacity",
          activeSection === section ? "text-[#9b87f5]" : "",
          hoveredSection === section ? "opacity-80" : "opacity-100"
        )}
        onClick={() => onSectionClick(section)}
        onMouseEnter={() => onSectionHover(section)}
        onMouseLeave={() => onSectionHover(null)}
      >
        {section}
      </button>
    </div>
  );
};
