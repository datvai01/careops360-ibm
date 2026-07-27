import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useSendTeamsBotMessage } from "@workspace/api-client-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendIcon, BotIcon, UserIcon, ShieldAlert, Sparkles, Plus, MoreHorizontal, HelpCircle, Book } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  metrics?: { label: string; value: string }[];
  sources?: string[];
  followUpQuestions?: string[];
  citedArticles?: { slug: string; title: string; summary: string }[];
  answeredBy?: "ai" | "rules";
};

const WELCOME_MESSAGE: Message = {
  id: "init",
  role: "assistant",
  content: "Hi there! I'm the CareOps360 Assistant. I can help you find information across our knowledge base, check operational metrics, or troubleshoot issues. What do you need help with today?",
  followUpQuestions: [
    "What's the status of the claims pipeline?",
    "Find documentation on the new Prior Auth rules.",
    "Are there any active incidents?"
  ]
};

export default function TeamsBot() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const sendMutation = useSendTeamsBotMessage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sendMutation.isPending]);

  const handleSend = (text: string) => {
    if (!text.trim() || sendMutation.isPending) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, newMsg]);
    setQuery("");
    
    sendMutation.mutate({ data: { message: text } } as any, {
      onSuccess: (data: any) => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: data.answer,
            metrics: data.relatedMetrics,
            sources: data.sources,
            followUpQuestions: data.followUpQuestions,
            citedArticles: data.citedArticles,
            answeredBy: data.answeredBy,
          },
        ]);
      },
      onError: () => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Sorry, I'm having trouble connecting to the network right now. Please try again in a moment.",
          },
        ]);
      }
    });
  };

  const isLoading = sendMutation.isPending;

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-background border rounded-lg shadow-sm overflow-hidden animate-in fade-in duration-300">
      {/* Teams-like Header */}
      <div className="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 rounded-md bg-primary/10">
            <BotIcon className="w-4 h-4 text-primary m-auto" />
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none text-foreground flex items-center gap-2">
              Horizon Ops {">"} CareOps360 Assistant
              <span className="bg-primary/10 text-primary text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-bold">Demo Simulation</span>
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">Enterprise Knowledge & Operations AI</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Plus className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreHorizontal className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 bg-muted/10 p-4" ref={scrollRef}>
        <div className="space-y-6 max-w-4xl mx-auto pb-4 flex flex-col">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
              <Avatar className="h-8 w-8 shrink-0 border border-border shadow-sm">
                {msg.role === 'user' ? (
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs"><UserIcon className="w-4 h-4"/></AvatarFallback>
                ) : (
                  <AvatarFallback className="bg-background"><BotIcon className="w-4 h-4 text-primary"/></AvatarFallback>
                )}
              </Avatar>
              
              <div className="flex flex-col gap-1 min-w-0">
                <span className={`text-xs font-semibold text-muted-foreground ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {msg.role === 'user' ? 'You' : 'CareOps360 Assistant'}
                </span>
                <div className={`p-3 rounded-lg text-sm shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-card border border-border rounded-tl-none'}`}>
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                  {msg.metrics && msg.metrics.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.metrics.map((metric, i) => (
                        <div key={i} className="bg-muted/50 border rounded-md px-2 py-1.5 flex flex-col min-w-[100px]">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{metric.label}</span>
                          <span className="font-semibold text-foreground">{metric.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.citedArticles && msg.citedArticles.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border/50">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Book className="w-3 h-3" /> Cited Sources
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.citedArticles.map((article, i) => (
                          <Link key={i} href={`/dashboard/knowledge?article=${article.slug}`} className="block p-2.5 border rounded-md hover:border-primary/30 hover:bg-muted/50 transition-colors bg-background">
                            <div className="text-xs font-semibold mb-0.5 truncate text-foreground">{article.title}</div>
                            <div className="text-[10px] text-muted-foreground line-clamp-2 leading-snug">{article.summary}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.answeredBy && (
                    <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {msg.answeredBy === "ai" ? <Sparkles className="w-3.5 h-3.5 text-primary" /> : <ShieldAlert className="w-3.5 h-3.5 text-status-green" />}
                      <span>Answered by {msg.answeredBy === "ai" ? "AI Model" : "Verified Rule"}</span>
                    </div>
                  )}
                </div>

                {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {msg.followUpQuestions.map((q, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleSend(q)}
                        disabled={isLoading}
                        className="text-xs text-left bg-card hover:bg-muted border border-border px-3 py-1.5 rounded-full shadow-sm transition-colors hover:border-primary/30 disabled:opacity-50"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-[85%] self-start animate-in fade-in">
              <Avatar className="h-8 w-8 shrink-0 border border-border shadow-sm">
                <AvatarFallback className="bg-background"><BotIcon className="w-4 h-4 text-primary"/></AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-xs font-semibold text-muted-foreground">CareOps360 Assistant</span>
                <div className="p-4 rounded-lg bg-card border border-border rounded-tl-none shadow-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-card border-t shrink-0">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(query); }} 
          className="relative max-w-4xl mx-auto flex items-center"
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a new message..."
            className="w-full pr-12 bg-muted/30 border-muted-foreground/20 h-12 rounded-md focus-visible:ring-primary shadow-inner"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!query.trim() || isLoading}
            className="absolute right-1.5 h-9 w-9 bg-primary hover:bg-primary/90 text-primary-foreground rounded"
          >
            <SendIcon className="w-4 h-4 ml-0.5" />
          </Button>
        </form>
        <div className="text-center mt-2">
          <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
            <HelpCircle className="w-3 h-3" /> AI-generated content may be inaccurate. Verify important information.
          </span>
        </div>
      </div>
    </div>
  );
}
