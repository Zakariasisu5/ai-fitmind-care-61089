
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import EmergencyContacts from "./pages/EmergencyContacts";
import Services from "./pages/Services";
import VoiceHealth from "./pages/VoiceHealth";
import MentalHealth from "./pages/MentalHealth";
import SymptomsTracker from "./pages/SymptomsTracker";
import NutritionCareTaker from "./pages/NutritionCareTaker";
import BrainBoost from "./pages/BrainBoost";
import Dashboard from "./pages/Dashboard";
import OAuthConsent from "./pages/OAuthConsent";
import { BloodCursor } from "./components/ui/BloodCursor";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BloodCursor />
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/emergency-contacts" element={<EmergencyContacts />} />
            <Route path="/services" element={<Services />} />
            <Route path="/voice-health" element={<VoiceHealth />} />
            <Route path="/mental-health" element={<MentalHealth />} />
            <Route path="/symptoms-tracker" element={<SymptomsTracker />} />
            <Route path="/nutrition" element={<NutritionCareTaker />} />
            <Route path="/brain-boost" element={<BrainBoost />} />
            <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
  </ErrorBoundary>
);

export default App;
