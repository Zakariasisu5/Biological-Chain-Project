
import React, { useEffect, useRef, useState } from 'react';
import { Send, Bot, X, Minimize2, Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';


    interface Message {
      id: string;
      content: string;
      role: 'user' | 'assistant';
      timestamp: Date;
      type?: 'text' | 'insight' | 'alert' | 'recommendation';
      data?: any;
    }

    const defaultSuggestions = [
      "What's my current heart rate?",
      'Show me my health trends for this month',
      'When was my last health check?',
      'Explain my latest blockchain transactions',
      'What are my recommended health goals?',
      'Analyze my sleep patterns',
      'Check my stress levels',
      'Generate health report',
      'What are my risk factors?',
      'Suggest workout routine'
    ];

    const ChatBubble: React.FC<{ message: Message }> = ({ message }) => {
      const isUser = message.role === 'user';
      if (isUser || message.type === 'text' || !message.type) {
        return (
          <div className={cn('flex w-full mb-4', isUser ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-[80%] rounded-lg px-4 py-2', isUser ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
              <p className="text-sm">{message.content}</p>
              <p className="text-xs text-right mt-1 opacity-70">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        );
      }

      if (message.type === 'insight') {
        return (
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">AI Insight</span>
              <Badge variant="outline" className="text-xs">{message.data?.confidence || 85}% confidence</Badge>
            </div>
            <p className="text-sm">{message.content}</p>
          </div>
        );
      }

      if (message.type === 'alert') {
        return (
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="font-medium text-sm text-red-600">Health Alert</span>
            </div>
            <p className="text-sm">{message.content}</p>
          </div>
        );
      }

      return (
        <div className="mb-4">
          <p className="text-sm">{message.content}</p>
        </div>
      );
    };

    interface AIAssistantProps {
      className?: string;
    }

    const AIAssistant: React.FC<AIAssistantProps> = ({ className }) => {
      const [input, setInput] = useState('');
      const [messages, setMessages] = useState<Message[]>([
        { id: '1', content: "Hello! I'm your Biologic Chain assistant. How can I help you today?", role: 'assistant', timestamp: new Date() }
      ]);
      const [isMinimized, setIsMinimized] = useState(true);
      const [isLoading, setIsLoading] = useState(false);
      const { toast } = useToast();
      const { currentUser } = useAuth();
      const messagesEndRef = useRef<HTMLDivElement | null>(null);

      useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, [messages]);

      const generateResponse = async (text: string) => {
        setIsLoading(true);
        try {
          await new Promise((r) => setTimeout(r, 700));
          const lower = text.toLowerCase();
          if (lower.includes('heart') || lower.includes('pulse')) {
            return { content: 'Your current heart rate is 72 bpm, which is within the normal range. Your average for the past week has been 74 bpm.', type: 'text' };
          }
          if (lower.includes('blockchain') || lower.includes('transaction')) {
            return { content: 'Your last blockchain transaction was yesterday at 3:45 PM. Your health data was securely verified and added to block #45872.', type: 'text' };
          }
          if (lower.includes('trend') || lower.includes('history')) {
            return { content: 'Your health trends show improvement in sleep quality over the past month.', type: 'text' };
          }
          if (lower.includes('stress')) {
            return { content: 'Your current stress level is 35%, which is in the moderate range.', type: 'alert', data: { severity: 'Medium' } };
          }

          return { content: "I'm not sure how to answer that. Try asking about health trends, records or transactions.", type: 'text' };
        } finally {
          setIsLoading(false);
        }
      };

      const sendText = async (text: string) => {
        if (!text || !text.trim()) return;
        const userMessage: Message = { id: Date.now().toString(), content: text, role: 'user', timestamp: new Date(), type: 'text' };
        setMessages((p) => [...p, userMessage]);
        try {
          const res = await generateResponse(text);
          const assistantMessage: Message = { id: (Date.now() + 1).toString(), content: res.content, role: 'assistant', timestamp: new Date(), type: res.type as any, data: res.data };
          setMessages((p) => [...p, assistantMessage]);
        } catch (err) {
          toast({ title: 'AI Error', description: 'Failed to generate response' });
          setIsLoading(false);
        }
      };

      const handleSendMessage = async () => {
        if (!input.trim()) return;
        await sendText(input);
        setInput('');
      };

      const handleSuggestionClick = async (suggestion: string) => {
        await sendText(suggestion);
      };

      return (
        <div className={cn('fixed bottom-6 right-6 z-50 transition-all duration-300', isMinimized ? 'w-12 h-12' : 'w-80 h-96 md:w-96 md:h-[32rem]', className)}>
          {isMinimized ? (
            <Button onClick={() => setIsMinimized(false)} className="h-12 w-12 rounded-full shadow-lg" size="icon">
              <Bot className="h-6 w-6" />
            </Button>
          ) : (
            <Card className="flex flex-col w-full h-full">
              <CardHeader className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Biologic Chain Assistant</div>
                    <div className="text-xs text-muted-foreground">Ask about your health or blockchain records</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsMinimized(true)}>
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsMinimized(true)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-auto p-4">
                <div className="flex flex-col">
                  {messages.map((m) => (
                    <ChatBubble key={m.id} message={m} />
                  ))}

                  {isLoading && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-muted max-w-[80%] rounded-lg px-4 py-2">
                        <div className="flex space-x-2">
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150" />
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-300" />
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
                      {defaultSuggestions.map((s, i) => (
                        <Button key={i} variant="outline" size="sm" className="text-xs" onClick={() => handleSuggestionClick(s)}>
                          {s}
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
                  <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." className="flex-1" disabled={isLoading} />
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
