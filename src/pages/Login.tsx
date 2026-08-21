import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Stethoscope } from "lucide-react";
import { NameInputDialog } from "@/components/ui/NameInputDialog";

function getSafeNext(): string | null {
  const raw = new URLSearchParams(window.location.search).get("next");
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return null;
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);
  const [flowers, setFlowers] = useState<Array<{ id: number; left: number; delay: number }>>([]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();

      if (!profile?.first_name || !profile?.last_name) {
        setShowNameDialog(true);
      } else {
        const next = getSafeNext();
        if (next) {
          window.location.href = next;
          return;
        }
        // Create flower animations from corners
        const newFlowers = [];
        for (let i = 0; i < 20; i++) {
          newFlowers.push({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 1000,
          });
        }
        setFlowers(newFlowers);
        setShowWelcome(true);

        // Hide welcome message after 5 seconds
        setTimeout(() => {
          setShowWelcome(false);
          navigate("/");
        }, 5000);

        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      }
    } catch (error: any) {
      let errorMessage = error.message || "An error occurred during login";
      
      if (error.details) {
        errorMessage += `\n\nDetails: ${error.details}`;
      }
      if (error.hint) {
        errorMessage += `\n\nHint: ${error.hint}`;
      }
      if (error.code) {
        errorMessage += `\n\nError Code: ${error.code}`;
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleNameDialogClose = () => {
    setShowNameDialog(false);
    setLoading(false);
    const next = getSafeNext();
    if (next) {
      window.location.href = next;
      return;
    }
    toast({
      title: "Welcome!",
      description: "You have successfully logged in.",
    });
    navigate("/");
  };

  const handleSignupClick = () => {
    setIsLeaving(true);
    const next = getSafeNext();
    const suffix = next ? `?next=${encodeURIComponent(next)}` : "";
    setTimeout(() => {
      navigate("/signup" + suffix);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-black relative flex items-center justify-center p-4 overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-100">
          <source src="/background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
          <Stethoscope className="w-16 h-16 text-[#57B3FE] animate-pulse" />
          <p className="text-[#57B3FE] text-xl mt-4 font-bold tracking-wider">
            FITMIND CARE
          </p>
        </div>
      )}

      {showWelcome && (
        <>
          {flowers.map((flower) => (
            <div
              key={flower.id}
              className="flower"
              style={{
                left: `${flower.left}%`,
                animationDelay: `${flower.delay}ms`,
              }}
            />
          ))}
          <div className="welcome-message text-white">
            <h2 className="text-2xl font-bold mb-4">Welcome to FitMind Care!</h2>
            <p className="mb-4">Your complete healthcare companion offering:</p>
            <ul className="text-left space-y-2 mb-4">
              <li>• Real-time health monitoring and tracking</li>
              <li>• Direct communication with healthcare providers</li>
              <li>• Secure medical record management</li>
              <li>• Emergency contact system</li>
              <li>• Personalized health insights and recommendations</li>
            </ul>
            <p className="text-sm opacity-70">Redirecting to dashboard...</p>
          </div>
        </>
      )}

      <div
        className={`w-full max-w-6xl bg-[rgba(0,0,0,0.8)] backdrop-blur-sm rounded-[30px] md:rounded-[50px] p-6 md:p-8 lg:p-12 grid md:grid-cols-2 gap-6 md:gap-8 relative z-10 ${
          isLeaving ? 'animate-burn-out' : 'animate-burn-in'
        }`}
      >
        <div className="space-y-4 md:space-y-6">
          <div>
            <h2 className="text-base md:text-lg text-white uppercase tracking-wide font-medium">
              FitMind Care
            </h2>
          </div>
          <div className="space-y-2 md:space-y-4">
            <p className="text-sm md:text-base text-gray-400">
              Please Enter your credentials
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xl md:text-2xl text-white block">
                E-Mail address
              </label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[rgba(255,255,255,0.1)] border-none text-white h-10 md:h-12 text-base md:text-lg pl-10 placeholder:text-gray-500"
                  placeholder="Enter your email"
                  required
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-xl md:text-2xl text-white block">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[rgba(255,255,255,0.1)] border-none text-white h-10 md:h-12 text-base md:text-lg pl-10"
                  placeholder="Enter your password"
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-[rgba(255,255,255,0.1)] text-[#57B3FE] h-10 md:h-12 rounded-md text-base md:text-lg hover:bg-[rgba(255,255,255,0.15)] transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            <p className="text-center text-sm md:text-base text-gray-400">
              Don't have an account?{" "}
              <button
                onClick={handleSignupClick}
                className="text-[#57B3FE] hover:underline"
                type="button"
              >
                Sign Up
              </button>
            </p>
          </form>
        </div>
        <div className="hidden md:flex items-center justify-center">
          <img
            alt="Login illustration"
            className="max-w-full h-auto"
            src="/lovable-uploads/521ae32e-2dec-4d59-8976-aa12b1bec2fb.jpg"
          />
        </div>
      </div>
      <NameInputDialog isOpen={showNameDialog} onClose={handleNameDialogClose} />
    </div>
  );
};

export default Login;
