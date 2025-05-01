
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

// Message type definition
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// Default suggestions for the AI assistant
const defaultSuggestions = [
  "What's my current heart rate?",
  "Show me my health trends for this month",
  "When was my last health check?",
  "Explain my latest blockchain transactions",
  "What are my recommended health goals?"
];

// Component to handle chat bubbles
const ChatBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] rounded-lg px-4 py-2",
        isUser ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        <p className="text-sm">{message.content}</p>
        <p className="text-xs text-right mt-1 opacity-70">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

interface AIAssistantProps {
  className?: string;
}

export const AIAssistant = ({ className }: AIAssistantProps) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    content: 'Hello! I\'m your Biologic Chain assistant. How can I help you today?',
    role: 'assistant',
    timestamp: new Date()
  }]);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to generate AI response
  const generateResponse = async (userMessage: string): Promise<string> => {
    // This would typically call an API endpoint, but for now we'll use mock responses
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple response logic based on keywords
    let response = "I'm not sure how to answer that. Could you try asking something about your health records, transactions, or account details?";
    
    const lowerCaseMessage = userMessage.toLowerCase();
    
    if (lowerCaseMessage.includes('heart rate') || lowerCaseMessage.includes('pulse')) {
      response = "Your current heart rate is 72 bpm, which is within the normal range. Your average for the past week has been 74 bpm.";
    } else if (lowerCaseMessage.includes('blockchain') || lowerCaseMessage.includes('transaction')) {
      response = "Your last blockchain transaction was yesterday at 3:45 PM. Your health data was securely verified and added to block #45872.";
    } else if (lowerCaseMessage.includes('trend') || lowerCaseMessage.includes('history')) {
      response = "Your health trends show improvement in sleep quality over the past month. Your average sleep duration has increased from 6.2 to 7.1 hours per night.";
    } else if (lowerCaseMessage.includes('goal') || lowerCaseMessage.includes('recommend')) {
      response = "Based on your recent data, I recommend focusing on increasing your daily steps. Aim for 8,000 steps per day this week, which is a 10% increase from your current average.";
    } else if (lowerCaseMessage.includes('account') || lowerCaseMessage.includes('subscription')) {
      response = `You're currently on the ${currentUser?.plan || 'Premium'} plan which gives you access to all health tracking features and AI-powered insights.`;
    }
    
    setIsLoading(false);
    return response;
  };

  // Function to handle sending a new message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    const response = await generateResponse(input);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: response,
      role: 'assistant',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
  };

  // Function to handle clicking a suggestion
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSendMessage();
  };

  // Toggle the minimized state of the chat window
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 transition-all duration-300",
      isMinimized ? "w-12 h-12" : "w-80 h-96 md:w-96 md:h-[32rem]",
      className
    )}>
      {isMinimized ? (
        <Button 
          onClick={toggleMinimize} 
          className="h-12 w-12 rounded-full shadow-lg"
          size="icon"
        >
          <Bot className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="flex flex-col h-full shadow-lg">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 border-b">
            <div className="flex items-center">
              <Bot className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-medium text-sm">Biologic Chain Assistant</h3>
            </div>
            <div className="flex">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={toggleMinimize}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => setIsMinimized(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-auto p-4">
            <div className="flex flex-col">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-muted max-w-[80%] rounded-lg px-4 py-2">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150"></div>
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-300"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {messages.length === 1 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Try asking about:</p>
                <div className="flex flex-wrap gap-2">
                  {defaultSuggestions.map((suggestion, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="pt-0 px-3 pb-3">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex w-full items-center space-x-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default AIAssistant;
