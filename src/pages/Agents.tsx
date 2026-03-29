import { motion } from "framer-motion";
import { Bot, Settings2, Sparkles, MessageSquare, Shield, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const agents = [
  {
    name: "Sales Agent",
    description: "Handles initial outreach, qualifies leads, and books demos. Analyzes buying intent signals.",
    icon: Sparkles,
    status: "active",
    tasksToday: 142,
    successRate: 87,
    tone: "Persuasive",
  },
  {
    name: "Support Agent",
    description: "Responds to product inquiries, resolves common issues, and escalates complex cases.",
    icon: Shield,
    status: "active",
    tasksToday: 89,
    successRate: 94,
    tone: "Friendly",
  },
  {
    name: "Follow-up Agent",
    description: "Sends intelligent follow-ups based on conversation history and customer intent patterns.",
    icon: RefreshCw,
    status: "active",
    tasksToday: 56,
    successRate: 72,
    tone: "Formal",
  },
];

export default function Agents() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Agents</h1>
          <p className="text-sm text-muted-foreground">Configure and monitor your AI sales agents.</p>
        </div>
        <Button variant="outline" className="gap-2 border-border">
          <Settings2 className="h-4 w-4" />
          Global Settings
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {agents.map((agent) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-border bg-card h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
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
                  <Switch defaultChecked />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{agent.description}</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-secondary/50 p-3 text-center">
                    <p className="text-lg font-bold">{agent.tasksToday}</p>
                    <p className="text-[10px] text-muted-foreground">Tasks Today</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3 text-center">
                    <p className="text-lg font-bold text-success">{agent.successRate}%</p>
                    <p className="text-[10px] text-muted-foreground">Success</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3 text-center">
                    <p className="text-xs font-medium mt-1">{agent.tone}</p>
                    <p className="text-[10px] text-muted-foreground">Tone</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full border-border text-sm">
                  <Settings2 className="h-3.5 w-3.5 mr-2" />
                  Configure Agent
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
          <div className="space-y-3">
            {[
              { agent: "Sales Agent", action: "Qualified lead Sarah Chen as 'hot' — buying intent detected", time: "2m ago" },
              { agent: "Follow-up Agent", action: "Sent 2nd follow-up to Marcus Williams — no reply in 24h", time: "8m ago" },
              { agent: "Support Agent", action: "Resolved pricing inquiry from Elena Rodriguez", time: "15m ago" },
              { agent: "Sales Agent", action: "Generated demo scheduling link for David Kim", time: "32m ago" },
              { agent: "Follow-up Agent", action: "Marked James Park as 'cold' — no engagement in 7 days", time: "1h ago" },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-secondary/20 px-4 py-3">
                <Bot className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium text-primary">{log.agent}</span>{" "}
                    <span className="text-muted-foreground">{log.action}</span>
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
