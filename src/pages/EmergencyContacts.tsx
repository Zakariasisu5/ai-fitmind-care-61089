import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { Phone, Plus, ArrowLeft, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship?: string;
}

const publicEmergencyNumbers: EmergencyContact[] = [
  { id: 'emergency', name: 'Emergency Services', phone: '911' },
  { id: 'police', name: 'Police Department', phone: '911' },
  { id: 'fire', name: 'Fire Department', phone: '911' },
  { id: 'poison', name: 'Poison Control', phone: '1-800-222-1222' },
  { id: 'suicide', name: 'Suicide Prevention Lifeline', phone: '988' },
];

const EmergencyContacts: React.FC = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newRelationship, setNewRelationship] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load saved contacts from the database
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        setContacts(data);
      }
    } catch (error: any) {
      console.error("Error loading contacts:", error);
      toast.error("Failed to load emergency contacts", {
        description: error.message || "Please try refreshing the page."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!newName || !newNumber) {
      toast.error("Please fill in required fields", {
        description: "Name and phone number are required."
      });
      return;
    }

    // Simple validation for phone number format
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(newNumber.replace(/[\s-]/g, ''))) {
      toast.error("Invalid phone number", {
        description: "Please enter a valid phone number (10-15 digits)"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Authentication required", {
          description: "Please log in to add emergency contacts."
        });
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert({
          user_id: user.id,
          name: newName,
          phone: newNumber.replace(/[\s-]/g, ''),
          relationship: newRelationship || null,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setContacts([...contacts, data]);
        setNewName('');
        setNewNumber('');
        setNewRelationship('');
        toast.success("Contact added successfully", {
          description: `${newName} has been added to your emergency contacts.`
        });
      }
    } catch (error: any) {
      console.error("Error adding contact:", error);
      toast.error("Failed to add contact", {
        description: error.message || "Please try again."
      });
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContacts(contacts.filter(contact => contact.id !== id));
      toast.success("Contact removed", {
        description: "Emergency contact has been deleted."
      });
    } catch (error: any) {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete contact", {
        description: error.message || "Please try again."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 p-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-6 text-white hover:bg-white/10"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <AlertCircle className="h-8 w-8 text-red-300" />
          <h1 className="text-3xl font-bold text-white">Emergency Contacts</h1>
        </div>

        <Card className="p-6 mb-8 border-red-400/20 bg-white/5 backdrop-blur-sm">
          <p className="text-white mb-4">
            Add emergency contacts below. These people will be notified when a critical health emergency is detected.
          </p>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder="Contact Name *"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-white/10 border-red-400/30 text-white placeholder:text-red-200/50"
              />
              <Input
                placeholder="Phone Number *"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                type="tel"
                className="bg-white/10 border-red-400/30 text-white placeholder:text-red-200/50"
              />
            </div>
            <div className="flex gap-4">
              <Input
                placeholder="Relationship (optional)"
                value={newRelationship}
                onChange={(e) => setNewRelationship(e.target.value)}
                className="bg-white/10 border-red-400/30 text-white placeholder:text-red-200/50"
              />
              <Button onClick={handleAddContact} className="bg-red-500 hover:bg-red-600 whitespace-nowrap">
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Public Emergency Numbers</h2>
            <div className="grid gap-4">
              {publicEmergencyNumbers.map((contact) => (
                <Card key={contact.id} className="p-4 border-red-400/20 bg-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-red-300" />
                    <div>
                      <h3 className="font-semibold text-white">{contact.name}</h3>
                      <p className="text-red-200">{contact.phone}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Personal Emergency Contacts</h2>
            {isLoading ? (
              <div className="text-center text-red-200/70 py-8">Loading contacts...</div>
            ) : (
              <div className="grid gap-4">
                {contacts.map((contact) => (
                  <Card key={contact.id} className="p-4 border-red-400/20 bg-white/5 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Phone className="h-5 w-5 text-red-300" />
                        <div>
                          <h3 className="font-semibold text-white">{contact.name}</h3>
                          <p className="text-red-200">{contact.phone}</p>
                          {contact.relationship && (
                            <p className="text-red-200/70 text-sm">{contact.relationship}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteContact(contact.id)}
                        className="bg-red-500/20 hover:bg-red-500/40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}

                {contacts.length === 0 && (
                  <div className="text-center text-red-200/70 mt-8">
                    No personal emergency contacts added yet. Add your first contact above.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContacts;
