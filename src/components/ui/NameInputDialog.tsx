
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NameInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NameInputDialog = ({ isOpen, onClose }: NameInputDialogProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update({ first_name: firstName, last_name: lastName })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your name has been updated successfully.",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Welcome! Please enter your name</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="text-white block mb-2">
              First Name
            </label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="bg-[rgba(255,255,255,0.1)] text-white border-none"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="text-white block mb-2">
              Last Name
            </label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="bg-[rgba(255,255,255,0.1)] text-white border-none"
              required
            />
          </div>
          <Button type="submit" className="w-full bg-[rgba(255,255,255,0.1)] text-[#57B3FE] hover:bg-[rgba(255,255,255,0.15)]">
            Save
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
