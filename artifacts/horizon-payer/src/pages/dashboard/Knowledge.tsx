import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { 
  useListKnowledgeArticles, 
  useGetKnowledgeArticle, 
  useRecordKnowledgeArticleView, 
  useGetKnowledgeStats, 
  useListKnowledgeSources,
  useSyncKnowledgeSource,
  useGenerateKnowledgeArticles,
  useGetCurrentUser
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, Search, ArrowLeft, Eye, Clock, ShieldAlert, Sparkles, Book,
  Database, RefreshCw, Layers, CheckCircle2, AlertCircle, Bot
} from "lucide-react";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function SimpleMarkdown({ content }: { content: string }) {
  const blocks = content.split('\n\n');
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      {blocks.map((block, i) => {
        if (block.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mt-6 mb-4">{block.slice(2)}</h1>;
        if (block.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-5 mb-3">{block.slice(3)}</h2>;
        if (block.startsWith('### ')) return <h3 key={i} className="text-lg font-bold mt-4 mb-2">{block.slice(4)}</h3>;
        if (block.startsWith('- ')) {
          return (
            <ul key={i} className="list-disc pl-5 space-y-1">
              {block.split('\n').map((li, j) => <li key={j}>{li.replace(/^- /, '')}</li>)}
            </ul>
          );
        }
        if (block.match(/^\d+\. /)) {
          return (
            <ol key={i} className="list-decimal pl-5 space-y-1">
              {block.split('\n').map((li, j) => <li key={j}>{li.replace(/^\d+\. /, '')}</li>)}
            </ol>
          );
        }
        return <p key={i} className="text-muted-foreground">{block}</p>;
      })}
    </div>
  );
}

function ArticleDetail({ slug, onBack }: { slug: string, onBack: () => void }) {
  const { data: article, isLoading } = useGetKnowledgeArticle(slug as any);
  const recordView = useRecordKnowledgeArticleView();
  const recorded = useRef(false);

  useEffect(() => {
    if (slug && !recorded.current && article) {
      recorded.current = true;
      recordView.mutate({ slug } as any);
    }
  }, [slug, article]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <ShieldAlert className="w-10 h-10 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Article not found</h2>
        <Button onClick={onBack} variant="outline">Return to Knowledge Base</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search
      </Button>

      <Card>
        <CardHeader className="border-b bg-muted/20 pb-6">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary" className="bg-primary/10 text-primary">{article.domain}</Badge>
            <Badge variant="outline" className="capitalize flex items-center gap-1">
              {article.sourceType === 'ai-generated' ? <Sparkles className="w-3 h-3 text-amber-500" /> : <Database className="w-3 h-3" />}
              {article.sourceType.replace('-', ' ')}
            </Badge>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">{article.title}</CardTitle>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4 font-medium">
            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Updated {new Date(article.updatedAt).toLocaleDateString()}</div>
            <div className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {article.viewCount} views</div>
            <div className="flex items-center gap-1.5"><Book className="w-3.5 h-3.5" /> By {article.author}</div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-muted/30 p-4 rounded-md border text-sm italic text-muted-foreground mb-6">
            {article.summary}
          </div>
          <SimpleMarkdown content={article.body} />
        </CardContent>
      </Card>
    </div>
  );
}

function AdminPanel() {
  const { data: sources, refetch } = useListKnowledgeSources();
  const syncMutation = useSyncKnowledgeSource();
  const generateMutation = useGenerateKnowledgeArticles();

  const { toast } = useToast();

  const handleSync = (sourceType: string) => {
    syncMutation.mutate({ sourceType } as any, {
      onSuccess: (res: any) => {
        toast({ title: `Sync: ${sourceType}`, description: res?.message ?? "Sync completed." });
        refetch();
      },
      onError: () => {
        toast({ title: `Sync failed: ${sourceType}`, description: "This source requires connection. Please authenticate to sync.", variant: "destructive" });
      }
    });
  };

  const handleGenerate = () => {
    generateMutation.mutate({ data: {} } as any, {
      onSuccess: (res: any) => {
        toast({ title: "AI articles generated", description: `${res?.generated ?? 0} article(s) added to the corpus.` });
        refetch();
      },
      onError: () => {
        toast({ title: "AI generation unavailable", description: "The AI service is not reachable right now. Try again shortly.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Data Sources</h3>
          <p className="text-sm text-muted-foreground">Manage connections to external knowledge repositories.</p>
        </div>
        <Button onClick={handleGenerate} disabled={generateMutation.isPending} className="bg-primary text-primary-foreground">
          {generateMutation.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Generate AI Insights
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources?.map((source: any) => (
          <Card key={source.sourceType} className="border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">{source.displayName}</CardTitle>
                {source.status === 'connected' ? (
                  <CheckCircle2 className="w-5 h-5 text-status-green" />
                ) : source.status === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-status-red" />
                ) : (
                  <Database className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <CardDescription className="text-xs">
                Status: <span className="font-semibold capitalize">{source.status.replace('_', ' ')}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm mb-4">
                <span className="text-muted-foreground">Articles synced</span>
                <span className="font-bold">{source.articleCount}</span>
              </div>
              {source.lastSyncMessage && (
                <div className="text-[10px] text-muted-foreground bg-muted/50 p-2 rounded mb-4 line-clamp-2">
                  {source.lastSyncMessage}
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => handleSync(source.sourceType)}
                disabled={syncMutation.isPending && syncMutation.variables?.sourceType === source.sourceType}
              >
                {syncMutation.isPending && syncMutation.variables?.sourceType === source.sourceType ? (
                  <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 mr-2" />
                )}
                Sync Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Knowledge() {
  const [location, setLocation] = useLocation();
  const searchString = useSearch();
  const queryParams = new URLSearchParams(searchString);
  const articleSlug = queryParams.get("article");
  const { data: user } = useGetCurrentUser();
  const isAdmin = user?.role === "admin";

  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 300);
  const { data: articles, isLoading: isArticlesLoading } = useListKnowledgeArticles({ q: debouncedQ } as any);
  const { data: stats } = useGetKnowledgeStats();

  if (articleSlug) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <ArticleDetail slug={articleSlug} onBack={() => setLocation("/dashboard/knowledge")} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" /> Knowledge Base
          </h1>
          <p className="text-muted-foreground mt-1">
            Enterprise corpus powering the CareOps360 AI Assistant.
          </p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
              <span className="text-3xl font-black text-primary mb-1">{stats.totalArticles}</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Articles</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
              <span className="text-3xl font-black mb-1">{stats.totalViews}</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Views</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
              <span className="text-3xl font-black text-amber-500 mb-1">{stats.aiGeneratedCount}</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Sparkles className="w-3 h-3"/> AI Generated</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
              <span className="text-sm font-bold mb-1 truncate max-w-[120px]" title={stats.topViewed?.[0]?.title}>{stats.topViewed?.[0]?.title || "N/A"}</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Eye className="w-3 h-3"/> Top Viewed</span>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="browse">Browse Corpus</TabsTrigger>
          {isAdmin && <TabsTrigger value="admin">Data Sources</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="browse" className="space-y-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search policies, SOPs, and system docs..." 
              className="pl-9 bg-card border-muted-foreground/20 h-11 shadow-inner"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isArticlesLoading ? (
              <div className="col-span-full py-12 flex justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : articles && articles.length > 0 ? (
              articles.map((article: any) => (
                <Link key={article.slug} href={`/dashboard/knowledge?article=${article.slug}`} className="block group">
                  <Card className="h-full border hover:border-primary/50 hover:shadow-md transition-all duration-200 bg-card group-hover:bg-primary/[0.02]">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-[10px] font-semibold bg-background">{article.domain}</Badge>
                        {article.sourceType === 'ai-generated' && <Sparkles className="w-3 h-3 text-amber-500" />}
                      </div>
                      <CardTitle className="text-sm font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex flex-col justify-between h-[100px]">
                      <p className="text-xs text-muted-foreground line-clamp-3 mb-2">{article.summary}</p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground/70 font-medium">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {article.viewCount}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(article.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded-lg bg-card/50">
                <Search className="w-8 h-8 mb-3 opacity-20" />
                <p className="text-sm font-medium">No articles found matching your criteria.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin">
            <AdminPanel />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
