
import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [isBurning, setIsBurning] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; type: 'smoke' | 'ember'; left: number; top: number; delay: number; x?: number }>>([]);

  useEffect(() => {
    if (isBurning) {
      // Create smoke and ember particles
      const newParticles = [];
      // Add smoke particles
      for (let i = 0; i < 15; i++) {
        newParticles.push({
          id: i,
          type: 'smoke' as const,
          left: Math.random() * 100,
          top: Math.random() * 100,
          delay: Math.random() * 2000,
        });
      }
      // Add ember particles
      for (let i = 15; i < 30; i++) {
        newParticles.push({
          id: i,
          type: 'ember' as const,
          left: Math.random() * 100,
          top: 70 + Math.random() * 30, // Start from bottom
          delay: Math.random() * 2000,
          x: -50 + Math.random() * 100, // Random horizontal drift
        });
      }
      setParticles(newParticles);
    }
  }, [isBurning]);

  const handleLogout = async () => {
    try {
      setIsBurning(true);
      // Wait for burning animation
      setTimeout(async () => {
        await signOut();
      }, 1100); // Reduced to 1.1 seconds to match animation duration
    } catch (error) {
      setIsBurning(false);
      
      let errorMessage = "There was a problem signing out. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const err = error as any;
        if (err.message) errorMessage = err.message;
        if (err.details) errorMessage = `${errorMessage} - ${err.details}`;
      }
      
      toast({
        title: "Error signing out",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn(
      "flex min-h-screen bg-black",
      isBurning && "burning"
    )}>
      {isBurning && (
        <>
          {particles.map((particle) => (
            <div
              key={particle.id}
              className={particle.type === 'smoke' ? 'smoke-particle' : 'ember'}
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}ms`,
                ...(particle.type === 'ember' && {
                  '--x': `${particle.x}px`,
                } as React.CSSProperties),
              }}
            />
          ))}
          <div className="logout-text">Logging Out...</div>
        </>
      )}
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <Header />
        <div className={cn(
          "flex-1 p-4 md:p-8 overflow-x-hidden",
          isBurning && "burning-text"
        )}
          style={{ '--delay': '0.5s' } as React.CSSProperties}
        >
          {children}
        </div>
        <div className={cn(
          "md:hidden p-4 fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-sm border-t border-white/10",
          isBurning && "burning-text"
        )}
          style={{ '--delay': '0s' } as React.CSSProperties}
        >
          <Button 
            onClick={handleLogout}
            variant="destructive" 
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </main>
    </div>
  );
};
