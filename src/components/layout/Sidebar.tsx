
import React, { useState } from "react";
import { ChatBot } from "@/components/ui/ChatBot";
import { MedicalReportForm } from "@/components/ui/MedicalReportForm";
import MapComponent from "../ui/MapComponent";
import { useNavigate } from "react-router-dom";

const MENU_ITEMS = [
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/87b026b6426c43e89a984782635271b0/5fc1d508896252fb3a28bd253302c49d1f28c1e0aa6c6c5d58af392d96080f66?placeholderIfAbsent=true",
    alt: "Home",
    name: "dashboard"
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/87b026b6426c43e89a984782635271b0/e3e062c940459229bc0507e702b42ab4b82c45d80f84c486838f16a15e51e37a?placeholderIfAbsent=true",
    alt: "Reports",
    name: "report"
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/87b026b6426c43e89a984782635271b0/ad4b8cbb6c2ca2b5b747664fcdeda439305a33a8ad9509842031a70e5863222d?placeholderIfAbsent=true",
    alt: "VoiceHealth",
    name: "voice health"
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/87b026b6426c43e89a984782635271b0/ad4b8cbb6c2ca2b5b747664fcdeda439305a33a8ad9509842031a70e5863222d?placeholderIfAbsent=true",
    alt: "Calendar",
    name: "AI health advisor"
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/87b026b6426c43e89a984782635271b0/ad4b8cbb6c2ca2b5b747664fcdeda439305a33a8ad9509842031a70e5863222d?placeholderIfAbsent=true",
    alt: "MentalHealth",
    name: "mental health"
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/87b026b6426c43e89a984782635271b0/42a15f2698bfed13c7232244a3c6daf0f4bb2ec3ef0cedfe7e3a838e77d12794?placeholderIfAbsent=true",
    alt: "Messages",
    name: "nearby doctors"
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/87b026b6426c43e89a984782635271b0/f52ffb1b9095946d84cb88b92c61ebd81dc9cfe4dd72eafaa7c5fc5c880c54d1?placeholderIfAbsent=true",
    alt: "Settings",
    name: "our service's"
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/87b026b6426c43e89a984782635271b0/8b181d90f8143bdb9e7e2bbb848f982f2d0d3c5831c82a0d6f00de438ed70729?placeholderIfAbsent=true",
    alt: "Profile",
    name: "emergency contacts"
  },
];

export const Sidebar: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const navigate = useNavigate();

  const handleItemClick = (alt: string) => {
    if (alt === "Calendar") {
      setIsChatOpen(true);
    } else if (alt === "Reports") {
      setIsReportFormOpen(true);
    } else if (alt === "Messages") {
      setIsMapOpen(true);
    } else if (alt === "VoiceHealth") {
      navigate("/voice-health");
    } else if (alt === "MentalHealth") {
      navigate("/mental-health");
    } else if (alt === "Profile") {
      navigate("/emergency-contacts");
    } else if (alt === "Settings") {
      navigate("/services");
    } else if (alt === "Home") {
      navigate("/");
    }
  };

  return (
    <>
      <aside className="flex flex-col items-center w-[131px] h-full py-12 bg-black">
        <div className="text-white text-xl font-bold tracking-[4.2px] mb-20">
          FITMIND
          <br />
          CARE
        </div>
        <nav className="flex flex-col gap-[72px]">
          {MENU_ITEMS.map((item, index) => (
            <button
              key={index}
              className="flex flex-col items-center gap-2"
              onClick={() => handleItemClick(item.alt)}
            >
              <img
                loading="lazy"
                src={item.icon}
                alt={item.alt}
                className="w-10 h-10 object-contain hover:opacity-80 transition-opacity"
              />
              <span className="text-white text-xs">
                {item.name}
              </span>
            </button>
          ))}
        </nav>
      </aside>
      {isChatOpen && (
        <ChatBot
          isFullScreen
          onClose={() => setIsChatOpen(false)}
        />
      )}
      {isReportFormOpen && (
        <MedicalReportForm onClose={() => setIsReportFormOpen(false)} />
      )}
      {isMapOpen && (
        <MapComponent onClose={() => setIsMapOpen(false)} />
      )}
    </>
  );
};
