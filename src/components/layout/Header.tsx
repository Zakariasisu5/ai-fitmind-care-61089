
import React, { useEffect, useState } from "react";
import { SearchBar } from "../ui/SearchBar";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const gradientColors = [
  "linear-gradient(90deg, #9b87f5, #7E69AB)",
  "linear-gradient(90deg, #8B5CF6, #D946EF)",
  "linear-gradient(90deg, #F97316, #FEF7CD)",
  "linear-gradient(90deg, #0EA5E9, #D6BCFA)",
];

export const Header: React.FC = () => {
  const [userName, setUserName] = useState("");
  const [gradientIndex, setGradientIndex] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", user.id)
          .single();

        if (profile?.first_name && profile?.last_name) {
          setUserName(`${profile.first_name} ${profile.last_name}`);
        }
      }
    };

    fetchUserName();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setGradientIndex((prev) => (prev + 1) % gradientColors.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleChatRedirect = (query: string) => {
    // This will trigger the chat bot with the search query
    const chatBotElement = document.querySelector('[data-testid="chat-bot-trigger"]');
    if (chatBotElement) {
      (chatBotElement as HTMLElement).click();
      // You can also store the query to be used by the chat bot
      localStorage.setItem('lastSearchQuery', query);
    }
    toast({
      title: "No direct matches found",
      description: "I'll help you find what you're looking for!",
    });
  };

  return (
    <header className={`flex justify-between items-center w-full px-4 md:px-8 py-4 ${isMobile ? 'bg-white/5 backdrop-blur-sm' : ''}`}>
      <div className="flex items-center gap-4 md:gap-8 w-full justify-between md:justify-start">
        {!isMobile && <SearchBar className="w-[536px]" onChatRedirect={handleChatRedirect} />}
        <div className={`flex items-center gap-4 ${isMobile ? 'w-full justify-between' : ''}`}>
          {user ? (
            <>
              <div className="flex flex-col items-start">
                <span className={`${isMobile ? 'text-xl' : 'text-2xl'} font-medium transition-all duration-300`}
                  style={{
                    backgroundImage: gradientColors[gradientIndex],
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}
                >
                  {userName || "Guest"}
                </span>
                {isMobile && (
                  <span className="text-sm text-white/60">
                    Welcome back!
                  </span>
                )}
              </div>
              {!isMobile && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleLogout}
                  className="text-white hover:text-white/80 transition-colors group"
                >
                  <LogOut className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              )}
            </>
          ) : (
            <Button 
              variant="ghost"
              onClick={handleLogin}
              className="text-white hover:text-white/80 transition-colors group flex items-center gap-2"
            >
              <span>Login</span>
              <LogIn className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
