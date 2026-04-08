import { useState, useRef, useEffect } from "react";
import { useAskDashboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquareIcon, SendIcon, SparklesIcon, UserIcon, ActivityIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metrics?: { label: string; value: string }[];
  sources?: string[];
};

const SUGGESTED_QUESTIONS = [
  "Why are prior auth approvals down today?",
  "Which applications are impacting claims settlement?",
  "What is the claims backlog by region?",
  "Show me the IBM AMS cost savings for this month"
];

export default function Ask() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: 'Hello. I am your Command Center AI. I have real-time access to all operational data across Horizon Payer systems. What would you like to know?'
    }
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const askMutation = useAskDashboard({
    mutation: {
      onSuccess: (data) => {
        setMessages(prev => [
          ...prev, 
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.answer,
            metrics: data.relatedMetrics,
            sources: data.sources
          }
        ]);
      },
      onError: () => {
        setMessages(prev => [
          ...prev, 
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'I encountered an error querying the operational databases. Please try again or rephrase your question.'
          }
        ]);
      }
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, askMutation.isPending]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    const newMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text
    };
    
    setMessages(prev => [...prev, newMsg]);
    setQuery("");
    
    askMutation.mutate({ data: { question: text } });
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-primary/20 p-2 rounded-lg">
          <SparklesIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ask the Dashboard</h1>
          <p className="text-muted-foreground">Natural language interface for enterprise operations data</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-border/50 shadow-lg">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-6 max-w-3xl mx-auto pb-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <ActivityIcon className="w-4 h-4 text-primary" />
                  </div>
                )}
                
                <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-muted/50 border rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  
                  {msg.role === 'assistant' && msg.metrics && msg.metrics.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.metrics.map((metric, i) => (
                        <div key={i} className="bg-card border shadow-sm rounded-md px-3 py-2 flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{metric.label}</span>
                          <span className="font-semibold text-foreground">{metric.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">Sources:</span>
                      <div className="flex gap-1">
                        {msg.sources.map((src, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] bg-background">
                            {src}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary border flex items-center justify-center flex-shrink-0 mt-1">
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {askMutation.isPending && (
              <div className="flex gap-4 justify-start">
                 <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <ActivityIcon className="w-4 h-4 text-primary animate-pulse" />
                </div>
                <div className="bg-muted/50 border rounded-xl rounded-tl-sm p-4 flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  <span className="ml-2 text-sm">Querying live data...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 bg-background border-t">
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-4 justify-center">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <Badge 
                  key={i} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors py-1.5 px-3 border border-transparent hover:border-primary/20 font-normal"
                  onClick={() => handleSend(q)}
                >
                  {q}
                </Badge>
              ))}
            </div>
          )}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(query); }}
            className="flex gap-2 max-w-4xl mx-auto relative"
          >
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about operational health, claims, prior auths..." 
              className="flex-1 bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary pr-12 h-12"
              disabled={askMutation.isPending}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!query.trim() || askMutation.isPending}
              className="absolute right-1 top-1 h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <SendIcon className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}