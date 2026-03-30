import { motion } from "framer-motion";
import { Bot, Settings2, Sparkles, Shield, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useDashboardStats } from "@/hooks/useDashboardData";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const agentDefs = [
  {
    name: "Sales Agent",
    description: "Handles initial outreach, qualifies leads, and books demos. Analyzes buying intent signals.",
    icon: Sparkles,
    type: "sales",
    tone: "Persuasive",
  },
  {
    name: "Support Agent",
    description: "Responds to product inquiries, resolves common issues, and escalates complex cases.",
    icon: Shield,
    type: "support",
    tone: "Friendly",
  },
  {
    name: "Follow-up Agent",
    description: "Sends intelligent follow-ups based on conversation history and customer intent patterns.",
    icon: RefreshCw,
    type: "followup",
    tone: "Formal",
  },
];

export default function Agents() {
  const { companyId } = useAuth();
  const { data: stats } = useDashboardStats();
  const navigate = useNavigate();

  const { data: recentLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["activity-logs", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("company_id", companyId)
        .eq("actor_type", "ai")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Agents</h1>
          <p className="text-sm text-muted-foreground">Configure and monitor your AI sales agents.</p>
        </div>
        <Button variant="outline" className="gap-2 border-border" onClick={() => navigate("/settings")}>
          <Settings2 className="h-4 w-4" />
          Global Settings
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {agentDefs.map((agent) => (
          <motion.div key={agent.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-border bg-card h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <agent.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{agent.name}</CardTitle>
                    <Badge variant="outline" className="mt-1 border-success/30 text-success text-[10px]">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{agent.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-secondary/50 p-3 text-center">
                    <p className="text-lg font-bold">{stats?.aiMessages || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Total Tasks</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3 text-center">
                    <p className="text-xs font-medium mt-1">{agent.tone}</p>
                    <p className="text-[10px] text-muted-foreground">Tone</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full border-border text-sm" onClick={() => navigate("/messages")}>
                  <Bot className="h-3.5 w-3.5 mr-2" />
                  Open Chat
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Activity Log */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Recent AI Actions</CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No AI actions logged yet. Start chatting with the AI agent to see activity here.</p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 rounded-lg bg-secondary/20 px-4 py-3">
                  <Bot className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium text-primary">{log.action}</span>{" "}
                      {log.details && <span className="text-muted-foreground">{log.details}</span>}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
