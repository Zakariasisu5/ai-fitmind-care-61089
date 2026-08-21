import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { WearableSource } from "@/hooks/useHealthData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp, X } from "lucide-react";

interface ReportData {
  [key: string]: {
    [key: string]: { value: string; unit: string };
  };
}

export const MedicalReportForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [includeWearableData, setIncludeWearableData] = useState(true);
  const [wearableSource, setWearableSource] = useState<WearableSource>("manual");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit medical reports",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [user, navigate, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "text/csv") {
        toast({
          title: "Error",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const parseCSV = async (file: File): Promise<ReportData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const lines = text.split('\n');
          const headers = lines[0].split(',');
          
          const data: ReportData = {};
          
          lines.slice(1).forEach(line => {
            if (!line.trim()) return;
            
            const [section, metric, value, unit] = line.split(',').map(item => item.trim());
            
            if (!data[section]) {
              data[section] = {};
            }
            
            data[section][metric] = {
              value,
              unit: unit || ''
            };
          });
          
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a medical report file",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit medical reports",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setIsLoading(true);

    try {
      const reportData = await parseCSV(file);
      
      // Calculate average BMI from all sections that have it
      const bmiValues = Object.values(reportData)
        .map(section => section["BMI"]?.value)
        .filter(Boolean)
        .map(Number);
      
      const avgBMI = bmiValues.length > 0 
        ? bmiValues.reduce((a, b) => a + b, 0) / bmiValues.length 
        : null;

      // Convert blood oxygen to number or null if not present/invalid
      const bloodOxygenStr = reportData.Lungs?.["O2 Saturation"]?.value;
      const bloodOxygen = bloodOxygenStr ? parseFloat(bloodOxygenStr) : null;

      // Extract heart rate if available
      const heartRateStr = reportData.Heart?.["Heart Rate"]?.value;
      const heartRate = heartRateStr ? parseFloat(heartRateStr) : null;

      // Extract sleep data if available
      const sleepHoursStr = reportData.Head?.["Sleep Duration"]?.value;
      const sleepHours = sleepHoursStr ? parseFloat(sleepHoursStr) : null;

      // Store the metrics in health_metrics table
      const { error: metricsError } = await supabase
        .from("health_metrics")
        .insert({
          blood_oxygen: bloodOxygen,
          heart_rate: heartRate,
          sleep_hours: sleepHours,
          user_id: user.id,
        })
        .select();

      if (metricsError) throw metricsError;

      // Store insights for each section
      const insights = Object.entries(reportData).map(([section, metrics]) => ({
        insight_type: section.toLowerCase(),
        content: Object.entries(metrics)
          .map(([metric, { value, unit }]) => `${metric}: ${value}${unit ? ` ${unit}` : ''}`)
          .join(', '),
        user_id: user.id,
      }));

      const { error: insightsError } = await supabase
        .from("health_insights")
        .insert(insights);

      if (insightsError) throw insightsError;

      // Note: Wearable data storage will be implemented in future update
      if (includeWearableData) {
        console.log("Wearable data feature coming soon:", {
          source: wearableSource,
          heart_rate: heartRate,
          blood_oxygen: bloodOxygen,
          sleep_hours: sleepHours
        });
      }

      toast({
        title: "Success",
        description: "Medical report analyzed and saved successfully",
      });

      onClose();
    } catch (error) {
      console.error("Error processing medical report:", error);
      
      let errorMessage = "Failed to process medical report. Please check the file format.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const err = error as any;
        if (err.message) {
          errorMessage = err.message;
        }
        if (err.details) {
          errorMessage = `${errorMessage}\n\nDetails: ${err.details}`;
        }
        if (err.hint) {
          errorMessage = `${errorMessage}\n\nHint: ${err.hint}`;
        }
        if (err.code) {
          errorMessage = `${errorMessage}\n\nError Code: ${err.code}`;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If user is not authenticated, don't render the form
  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <Card className="max-w-md w-full relative">
        <Button 
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            Submit Medical Report
          </CardTitle>
          <CardDescription>
            Upload your medical report in CSV format for analysis
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="report" className="block text-sm font-medium mb-2">
                Upload Medical Report (CSV)
              </label>
              <Input
                id="report"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground mt-2">
                CSV format: section, metric, value, unit
              </p>
              {file && (
                <p className="text-sm text-primary mt-2 font-medium">
                  Selected: {file.name}
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="wearableData"
                  checked={includeWearableData}
                  onChange={(e) => setIncludeWearableData(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                <label htmlFor="wearableData" className="text-sm font-medium">
                  Include as wearable device data
                </label>
              </div>
              
              {includeWearableData && (
                <div>
                  <label htmlFor="wearableSource" className="block text-sm font-medium mb-2">
                    Data Source
                  </label>
                  <select
                    id="wearableSource"
                    value={wearableSource}
                    onChange={(e) => setWearableSource(e.target.value as WearableSource)}
                    className="w-full p-2 border border-input rounded-md bg-background"
                  >
                    <option value="manual">Manual Entry</option>
                    <option value="fitbit">Fitbit</option>
                    <option value="apple_health">Apple Health</option>
                    <option value="garmin">Garmin</option>
                    <option value="samsung_health">Samsung Health</option>
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!file || isLoading}>
                {isLoading ? "Processing..." : "Submit Report"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
