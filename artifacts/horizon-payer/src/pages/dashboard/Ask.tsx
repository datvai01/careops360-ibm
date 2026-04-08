import { useState, useRef, useEffect } from "react";
import { useAskDashboard } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendIcon, SparklesIcon, UserIcon, ActivityIcon, RotateCcwIcon, ChevronRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  metrics?: { label: string; value: string }[];
  sources?: string[];
  followUpQuestions?: string[];
};

const WELCOME_MESSAGE: Message = {
  id: "init",
  role: "assistant",
  content:
    "Hello. I am your Command Center AI assistant. I have access to operational data across all Horizon Payer systems — claims, prior auth, IBM AMS service desk, application health, EDI interfaces, member services, and more. What would you like to know?",
  followUpQuestions: [
    "What is the current claims backlog by line of business?",
    "Why are prior auth approvals down today?",
    "Which applications are experiencing incidents right now?",
  ],
};

const QUESTION_GROUPS = [
  {
    label: "Operations",
    questions: [
      "Why are prior auth approvals down today?",
      "What is the claims backlog by line of business?",
      "What are the top claim denial reasons this week?",
      "How is member services performing today?",
    ],
  },
  {
    label: "Application Health",
    questions: [
      "Which applications are experiencing incidents right now?",
      "What is impacting claims settlement today?",
      "What is the EDI interface health status?",
      "Which provider systems have open issues?",
    ],
  },
  {
    label: "IBM AMS",
    questions: [
      "How is IBM AMS SLA compliance tracking?",
      "Show me the IBM AMS cost savings for this quarter.",
      "Which automation runbooks are running today?",
      "How does IBM AMS shift-left rate compare to target?",
    ],
  },
];

export default function Ask() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isDelaying, setIsDelaying] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conversationGenRef = useRef(0);

  const askMutation = useAskDashboard({
    mutation: {
      onSuccess: (data) => {
        const gen = conversationGenRef.current;
        const delay = 350 + Math.random() * 250;
        delayTimerRef.current = setTimeout(() => {
          delayTimerRef.current = null;
          if (conversationGenRef.current !== gen) return;
          setIsDelaying(false);
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: data.answer,
              metrics: data.relatedMetrics,
              sources: data.sources,
              followUpQuestions: data.followUpQuestions,
            },
          ]);
        }, delay);
      },
      onError: () => {
        delayTimerRef.current = null;
        setIsDelaying(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content:
              "I encountered an error querying the operational data. Please try again or rephrase your question.",
          },
        ]);
      },
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, askMutation.isPending, isDelaying]);

  const handleSend = (text: string) => {
    if (!text.trim() || askMutation.isPending || isDelaying) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, newMsg]);
    setQuery("");
    setIsDelaying(true);
    askMutation.mutate({ data: { question: text } });
  };

  const handleReset = () => {
    conversationGenRef.current += 1;
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    setIsDelaying(false);
    setMessages([WELCOME_MESSAGE]);
    setQuery("");
  };

  const isLoading = askMutation.isPending || isDelaying;
  const showSuggestions = !query.trim() && !isLoading;
  const lastMsg = messages[messages.length - 1];
  const lastFollowUps =
    lastMsg?.role === "assistant" && lastMsg.followUpQuestions?.length
      ? lastMsg.followUpQuestions
      : [];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <SparklesIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ask the Dashboard</h1>
            <p className="text-muted-foreground">
              Natural language interface for enterprise operations data
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={handleReset}
        >
          <RotateCcwIcon className="w-3.5 h-3.5" />
          New conversation
        </Button>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-border/50 shadow-lg">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-6 max-w-3xl mx-auto pb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <ActivityIcon className="w-4 h-4 text-primary" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`p-4 rounded-xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted/50 border rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>

                  {msg.role === "assistant" && msg.metrics && msg.metrics.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.metrics.map((metric, i) => (
                        <div
                          key={i}
                          className="bg-card border shadow-sm rounded-md px-3 py-2 flex flex-col"
                        >
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                            {metric.label}
                          </span>
                          <span className="font-semibold text-foreground">{metric.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">Sources:</span>
                      <div className="flex gap-1 flex-wrap">
                        {msg.sources.map((src, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] bg-background">
                            {src}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.role === "assistant" &&
                    msg.followUpQuestions &&
                    msg.followUpQuestions.length > 0 && (
                      <div className="mt-3 flex flex-col gap-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Follow up
                        </span>
                        <div className="flex flex-col gap-1">
                          {msg.followUpQuestions.map((q, i) => (
                            <button
                              key={i}
                              onClick={() => handleSend(q)}
                              disabled={isLoading}
                              className="flex items-center gap-1.5 text-xs text-left text-primary/80 hover:text-primary transition-colors group disabled:opacity-40"
                            >
                              <ChevronRightIcon className="w-3 h-3 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                              <span className="hover:underline underline-offset-2">{q}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary border flex items-center justify-center flex-shrink-0 mt-1">
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <ActivityIcon className="w-4 h-4 text-primary animate-pulse" />
                </div>
                <div className="bg-muted/50 border rounded-xl rounded-tl-sm p-4 flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  />
                  <span className="ml-2 text-sm">Querying operational data...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 bg-background border-t space-y-3">
          {showSuggestions && (
            <div className="grid grid-cols-3 gap-3">
              {QUESTION_GROUPS.map((group) => (
                <div key={group.label} className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                    {group.label}
                  </p>
                  <div className="flex flex-col gap-1">
                    {group.questions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(q)}
                        className="text-left text-xs px-2 py-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-transparent hover:border-border"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!showSuggestions && lastFollowUps.length > 0 && !isLoading && (
            <div className="flex flex-wrap gap-1.5">
              {lastFollowUps.map((q, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors py-1 px-2.5 border border-transparent hover:border-primary/20 font-normal text-xs"
                  onClick={() => handleSend(q)}
                >
                  {q}
                </Badge>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(query);
            }}
            className="flex gap-2 max-w-4xl mx-auto relative"
          >
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about claims, prior auth, IBM AMS, application health, EDI..."
              className="flex-1 bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary pr-12 h-12"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!query.trim() || isLoading}
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
