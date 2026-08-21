
import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatBot } from "@/components/ui/ChatBot";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-mobile";
import MapComponent from "@/components/ui/MapComponent";
import { useNavigate } from "react-router-dom";
import { BodySection } from "@/components/body/BodySection";
import { BodyVisualizer } from "@/components/body/BodyVisualizer";
import { StatsDisplay } from "@/components/body/StatsDisplay";
import { useHealthData } from "@/hooks/useHealthData";
import { useEmergencyCheck } from "@/hooks/useEmergencyCheck";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

const BODY_SECTIONS = ["Heart", "Lungs", "Stomach", "Head", "Eyes"];

const generateAISuggestion = (section: string, metrics: any) => {
  if (!metrics) return "";
  
  switch (section) {
    case "Heart":
      if (metrics.bmi > 25) return "Consider maintaining a healthy diet and regular exercise to improve BMI.";
      if (metrics.heart_rate > 100) return "Your heart rate is elevated. Try relaxation techniques.";
      return "Your heart metrics look good!";
    case "Lungs":
      if (metrics.blood_oxygen < 95) return "Consider deep breathing exercises to improve oxygen saturation.";
      return "Your lung function appears normal.";
    case "Stomach":
      return "Maintain a balanced diet and regular meal schedule.";
    case "Head":
      return "Ensure you're getting adequate sleep and managing stress levels.";
    case "Eyes":
      return "Remember to take regular breaks from screen time (20-20-20 rule).";
    default:
      return "";
  }
};

const getHoverIcon = (section: string) => {
  switch (section) {
    case "Heart":
      return "/lovable-uploads/b70d1f63-951b-42fe-b3af-0840e6663f4e.png";
    case "Lungs":
      return "/lovable-uploads/6cb36700-ecda-4915-9661-e8db3af5f5ab.png";
    case "Stomach":
      return "/lovable-uploads/c3a699a9-d2ea-4762-859f-9ee5cff2506b.png";
    case "Head":
      return "/lovable-uploads/abcad875-4a73-4dd8-af36-1ba44ab8195d.png";
    case "Eyes":
      return "/lovable-uploads/8ea5bd3a-eeea-43ee-b2da-bedc5ac6e243.png";
    default:
      return "";
  }
};

const getImageForSection = (section: string) => {
  switch (section) {
    case "Heart":
      return "https://cdn.builder.io/api/v1/image/assets/87b026b6426c43e89a984782635271b0/e1615f88b5cbe39cc6852b29692b8bbe32fc5ad30f295f88d01be2986b7e4e8c";
    case "Lungs":
      return "/lovable-uploads/49d2282d-a1cc-4bf1-b24f-545df1f1cfc0.png";
    case "Stomach":
      return "/lovable-uploads/bc182d75-f685-4805-823d-4872b72d853b.png";
    case "Head":
      return "/lovable-uploads/336a94f6-854a-49ab-8315-2487a1c89fbf.png";
    case "Eyes":
      return "https://i.pinimg.com/474x/f0/aa/3f/f0aa3f2c54f3373890a84b6d35ec1950.jpg";
    default:
      return "";
  }
};

const Index = () => {
  const [activeSection, setActiveSection] = useState("Heart");
  const [showMetrics, setShowMetrics] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const { data: healthData, isLoading } = useHealthData();
  const { handleEmergency } = useEmergencyCheck();

  React.useEffect(() => {
    if (healthData?.metrics) {
      handleEmergency(healthData.metrics, setShowMap);
    }
  }, [healthData]);

  const handleSectionClick = (section: string) => {
    setActiveSection(section);
    if (isMobile) {
      setShowMetrics(true);
    }
  };

  const handleBackToBody = () => {
    setShowMetrics(false);
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <MainLayout>
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div className="bg-[rgba(255,255,255,0.15)] flex items-stretch gap-5 flex-wrap justify-between px-[39px] py-[26px] rounded-[50px] text-2xl font-normal">
            {BODY_SECTIONS.map((section) => (
              <BodySection
                key={section}
                section={section}
                activeSection={activeSection}
                hoveredSection={hoveredSection}
                onSectionClick={handleSectionClick}
                onSectionHover={setHoveredSection}
              />
            ))}
          </div>
        </div>

        <div className={cn(
          "flex gap-12",
          isMobile && "flex-col items-center"
        )}>
          {(!isMobile || !showMetrics) && (
            <BodyVisualizer
              activeSection={activeSection}
              getImageForSection={getImageForSection}
            />
          )}

          {(!isMobile || showMetrics) && (
            <div className="flex flex-col w-full max-w-[266px]">
              {isMobile && (
                <button
                  onClick={handleBackToBody}
                  className="text-white mb-4 hover:opacity-80 transition-opacity"
                >
                  ← Back to body view
                </button>
              )}
              <StatsDisplay
                activeSection={activeSection}
                hasData={healthData?.metrics !== null && healthData?.metrics !== undefined}
                healthData={healthData}
                noDataMessage="Please submit the reports"
                generateAISuggestion={generateAISuggestion}
              />
            </div>
          )}
        </div>

        <Button
          onClick={toggleChat}
          className="fixed bottom-4 right-4 rounded-full w-12 h-12 p-0"
          size="icon"
          variant="default"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>

        {isChatOpen && (
          <ChatBot 
            isFullScreen={false} 
            onClose={() => setIsChatOpen(false)} 
          />
        )}
      </div>
      {showMap && <MapComponent onClose={() => setShowMap(false)} />}
    </MainLayout>
  );
};

export default Index;
