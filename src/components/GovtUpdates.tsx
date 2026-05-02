import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Landmark, RefreshCw, ExternalLink, Calendar, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Update {
  title: string;
  category: string;
  summary: string;
  date: string;
  ministry: string;
  actionUrl?: string;
}

const categoryColors: Record<string, string> = {
  Scheme: "bg-primary/10 text-primary border-primary/20",
  Subsidy: "bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400",
  MSP: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
  Advisory: "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400",
  Notification: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400",
  Insurance: "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400",
};

export const GovtUpdates = () => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("govt-updates", {
        body: { region: "India" },
      });
      if (error) throw error;
      setUpdates(data?.updates || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to load updates",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-2">
            <Landmark className="w-8 h-8" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">Government Updates</h2>
          <p className="text-xl text-muted-foreground">
            Latest schemes, subsidies and advisories for farmers and crops
          </p>
          <Button onClick={fetchUpdates} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="shadow-[var(--shadow-soft)]">
                  <CardHeader className="space-y-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                </Card>
              ))
            : updates.map((u, i) => (
                <Card
                  key={i}
                  className="shadow-[var(--shadow-soft)] border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--shadow-glow)]"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="outline" className={categoryColors[u.category] || ""}>
                        {u.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {u.date}
                      </span>
                    </div>
                    <CardTitle className="text-xl leading-tight">{u.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CardDescription className="text-base leading-relaxed">
                      {u.summary}
                    </CardDescription>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {u.ministry}
                      </span>
                      {u.actionUrl && (
                        <a
                          href={u.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          Learn more <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>
    </section>
  );
};