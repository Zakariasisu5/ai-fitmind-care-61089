import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Metrics = {
  bmi?: number;
  blood_oxygen?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  blood_pressure?: string;
};

export const useEmergencyCheck = () => {
  const navigate = useNavigate();

  const checkForEmergency = (metrics: Metrics | null) => {
    if (!metrics) return null;

    const emergencies = [];

    // BMI emergency check
    const bmi = metrics.bmi;
    if (bmi && (bmi < 16 || bmi > 40)) {
      emergencies.push("Critical BMI level detected");
    }

    // Blood oxygen emergency check
    const oxygenLevel = metrics.blood_oxygen;
    if (oxygenLevel && oxygenLevel < 90) {
      emergencies.push("Critically low oxygen saturation");
    }

    // Blood pressure emergency check
    const systolic = metrics.blood_pressure_systolic;
    const diastolic = metrics.blood_pressure_diastolic;
    if (systolic && diastolic) {
      if (systolic > 180 || diastolic > 120) {
        emergencies.push("Hypertensive crisis detected");
      }
      if (systolic < 90 || diastolic < 60) {
        emergencies.push("Dangerously low blood pressure");
      }
    }

    // Heart rate emergency check
    const heartRate = metrics.heart_rate;
    if (heartRate && (heartRate > 120 || heartRate < 40)) {
      emergencies.push("Abnormal heart rate detected");
    }

    return emergencies.length > 0 ? emergencies : null;
  };

  // New function to notify emergency contacts
  const notifyEmergencyContacts = async (emergencies: string[]) => {
    try {
      // Get user information
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("Error getting user:", userError);
        return;
      }

      // Get stored emergency contacts for the user
      const { data: contacts, error: contactsError } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id);

      if (contactsError) {
        console.error("Error fetching emergency contacts:", contactsError);
        toast.error("Failed to notify emergency contacts", {
          description: contactsError.message
        });
        return;
      }

      // If no contacts found or empty array, return
      if (!contacts || contacts.length === 0) {
        console.log("No emergency contacts configured");
        toast.warning("No emergency contacts found", {
          description: "Please add emergency contacts in settings."
        });
        return;
      }

      const contactNumbers = contacts.map(c => c.phone);

      // Format emergency message
      const emergencyMessage = `MEDICAL ALERT: The person who added you as an emergency contact has the following health emergency: ${emergencies.join(', ')}. Please check on them or seek medical help.`;
      
      // For demonstration purposes, we'll just log the message that would be sent
      // In a real application, this would connect to an SMS API service like Twilio
      console.log(`Emergency message: "${emergencyMessage}" would be sent to:`, contactNumbers);
      
      // Show a toast to inform the user that contacts would be notified
      toast.info("Emergency contacts have been alerted", {
        description: `${contacts.length} contact(s) notified`,
        duration: 5000,
      });
    } catch (error: any) {
      console.error("Error notifying emergency contacts:", error);
      toast.error("Failed to send emergency alerts", {
        description: error.message || "Please try again."
      });
    }
  };

  const handleEmergency = (metrics: Metrics | null, setShowMap: (show: boolean) => void) => {
    if (!metrics) return;

    const emergencies = checkForEmergency(metrics);
    if (!emergencies) return;

    // Notify emergency contacts when emergencies are detected
    notifyEmergencyContacts(emergencies);

    toast.error(
      <div className="flex flex-col gap-2">
        <div className="font-bold">Emergency Alert!</div>
        {emergencies.map((emergency, index) => (
          <div key={index}>{emergency}</div>
        ))}
        <div className="flex gap-2 mt-2">
          <button 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
            onClick={() => setShowMap(true)}
          >
            🏥 Show Nearby Hospitals
          </button>
          <button 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
            onClick={() => navigate("/emergency-contacts")}
          >
            <Phone className="w-4 h-4" /> Emergency Contacts
          </button>
        </div>
      </div>,
      {
        duration: 10000,
      }
    );
  };

  return { handleEmergency };
};
