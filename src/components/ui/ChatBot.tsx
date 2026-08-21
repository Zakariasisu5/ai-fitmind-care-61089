
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: string;
  content: string;
}

interface ChatBotProps {
  isFullScreen?: boolean;
  onClose?: () => void;
  systemPrompt?: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({ isFullScreen = true, onClose, systemPrompt }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const initialGreeting: Message = {
      role: 'assistant',
      content: systemPrompt 
        ? `Hello! I'm your ${systemPrompt.split('.')[0]} assistant. How can I help you today?`
        : 'Hello! I\'m your health assistant. How can I help you today?'
    };
    setMessages([initialGreeting]);

    if (user) {
      saveMessageToDatabase(initialGreeting);
    }

    return () => {
      setMessages([]);
    };
  }, [user, systemPrompt]);

  const saveMessageToDatabase = async (message: Message) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          content: message.content,
          role: message.role,
          user_id: user.id
        }]);

      if (error) {
        console.error('Error saving message:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to save message:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to use the chat feature.",
      });
      return;
    }

    const userMessage = { role: 'user', content: newMessage };
    setIsLoading(true);

    try {
      setMessages(prev => [...prev, userMessage]);
      setNewMessage("");
      await saveMessageToDatabase(userMessage);

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { 
          message: newMessage,
          userId: user.id,
          systemPrompt: systemPrompt
        }
      });

      if (error) {
        throw error;
      }
      
      if (data && data.message) {
        const aiMessage = { role: 'assistant', content: data.message };
        setMessages(prev => [...prev, aiMessage]);
        await saveMessageToDatabase(aiMessage);
      } else {
        throw new Error('Invalid response format from API');
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => prev.slice(0, -1));
      
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const err = error as any;
        if (err.message) errorMessage = err.message;
        if (err.error) errorMessage = err.error;
        if (err.details) errorMessage = `${errorMessage}\n\nDetails: ${err.details}`;
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const containerClass = isFullScreen
    ? "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    : "fixed bottom-20 right-4 w-96 z-50";

  const chatWindowClass = isFullScreen
    ? "w-full max-w-4xl h-[80vh] bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800"
    : "w-full h-[500px] bg-gradient-to-br from-blue-50/90 to-purple-50/90 dark:from-gray-900/90 dark:to-gray-800/90";

  return (
    <div className={containerClass}>
      <div className={`${chatWindowClass} rounded-lg overflow-hidden shadow-xl border border-white/10 backdrop-blur-lg`}>
        <div className="p-4 flex justify-between items-center border-b bg-white/10 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-gradient-primary">Healthcare Assistant</h2>
          {onClose && (
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="hover:bg-white/10"
            >
              ✕
            </Button>
          )}
        </div>
        <ScrollArea className={`${isFullScreen ? 'h-[calc(80vh-8rem)]' : 'h-[calc(500px-8rem)]'} px-4 py-4`}>
          <div className="space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/40 backdrop-blur-sm dark:bg-white/10"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-white/50 dark:bg-white/10 border-white/20"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="sm" 
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
