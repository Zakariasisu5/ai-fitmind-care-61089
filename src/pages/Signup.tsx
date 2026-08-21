
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Mail, User, Lock } from "lucide-react";

function getSafeNext(): string | null {
  const raw = new URLSearchParams(window.location.search).get("next");
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return null;
}

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const next = getSafeNext();
      const emailRedirectTo = next
        ? `${window.location.origin}${next}`
        : window.location.origin;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });
      if (error) throw error;
      toast({
        title: "Registration successful!",
        description: "Please check your email for verification instructions.",
      });
      navigate("/login" + (next ? `?next=${encodeURIComponent(next)}` : ""));
    } catch (error: any) {
      let errorMessage = error.message || "An error occurred during registration";
      
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
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    setIsLeaving(true);
    const next = getSafeNext();
    const suffix = next ? `?next=${encodeURIComponent(next)}` : "";
    setTimeout(() => {
      navigate("/login" + suffix);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div
        className={`w-full max-w-6xl bg-[rgba(255,255,255,0.05)] rounded-[50px] p-8 md:p-12 grid md:grid-cols-2 gap-8 relative transition-transform duration-1000 ${
          isLeaving ? 'animate-burn-out' : 'animate-burn-in'
        }`}
      >
        {isLeaving && (
          <div className="fixed top-1/2 left-[-100px] transform -translate-y-1/2 z-20 pointer-events-none">
            <img
              src="/lovable-uploads/hand.png"
              alt="Dragging hand"
              className="w-32 h-32 animate-slide-hand-reverse"
            />
          </div>
        )}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg text-white uppercase tracking-wide font-medium">
              FitMind Care
            </h2>
          </div>
          <div className="space-y-4">
            <p className="text-gray-400">Create your account</p>
          </div>
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-2xl text-white block">
                First Name
              </label>
              <div className="relative">
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-[rgba(255,255,255,0.1)] border-none text-white h-12 text-lg pl-10 placeholder:text-gray-500"
                  placeholder="John"
                  required
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-2xl text-white block">
                Last Name
              </label>
              <div className="relative">
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-[rgba(255,255,255,0.1)] border-none text-white h-12 text-lg pl-10 placeholder:text-gray-500"
                  placeholder="Doe"
                  required
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-2xl text-white block">
                E-Mail address
              </label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[rgba(255,255,255,0.1)] border-none text-white h-12 text-lg pl-10 placeholder:text-gray-500"
                  placeholder="john.doe@example.com"
                  required
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-2xl text-white block">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[rgba(255,255,255,0.1)] border-none text-white h-12 text-lg pl-10"
                  required
                  minLength={6}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-[rgba(255,255,255,0.1)] text-[#57B3FE] h-12 rounded-md text-lg hover:bg-[rgba(255,255,255,0.15)] transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
            <p className="text-center text-gray-400">
              Already have an account?{" "}
              <button
                onClick={handleLoginClick}
                className="text-[#57B3FE] hover:underline"
                type="button"
              >
                Login
              </button>
            </p>
          </form>
        </div>
        <div className="hidden md:flex items-center justify-center">
          <img
            alt="Signup illustration"
            className="max-w-full h-auto"
            src="/lovable-uploads/b28df34e-c998-4034-9e3f-f1d8c27f3adb.jpg"
          />
        </div>
      </div>
    </div>
  );
};

export default Signup;
