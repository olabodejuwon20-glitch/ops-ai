import { motion } from "framer-motion";
import { Bell, Check, Bot, Users, MessageSquare, Zap, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const notifications = [
  { id: "1", type: "lead", icon: Users, title: "New hot lead captured", desc: "Sarah Chen from Acme Corp submitted a form with high buying intent.", time: "2 min ago", read: false },
  { id: "2", type: "ai", icon: Bot, title: "AI Agent completed task", desc: "Follow-up Agent sent 2nd email to Marcus Williams.", time: "8 min ago", read: false },
  { id: "3", type: "message", icon: MessageSquare, title: "New reply from Elena Rodriguez", desc: "\"Can you send me the proposal by end of day?\"", time: "15 min ago", read: false },
  { id: "4", type: "automation", icon: Zap, title: "Automation triggered", desc: "Hot Lead Escalation workflow activated for David Kim.", time: "32 min ago", read: true },
  { id: "5", type: "warning", icon: AlertTriangle, title: "Follow-up failed", desc: "Email to james@tech.dev bounced. Please verify the address.", time: "1h ago", read: true },
  { id: "6", type: "ai", icon: Bot, title: "AI Summary generated", desc: "Weekly performance report ready: 24.8% conversion rate (+3.2%).", time: "2h ago", read: true },
  { id: "7", type: "lead", icon: Users, title: "Lead status changed", desc: "Lisa Thompson moved from Qualified to Closed (won).", time: "4h ago", read: true },
];

const typeColors: Record<string, string> = {
  lead: "bg-primary/15 text-primary",
  ai: "bg-success/15 text-success",
  message: "bg-info/15 text-info",
  automation: "bg-warning/15 text-warning",
  warning: "bg-destructive/15 text-destructive",
};

export default function Notifications() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">Stay updated on leads, AI actions, and messages.</p>
        </div>
        <Button variant="outline" className="gap-2 border-border text-sm">
          <Check className="h-4 w-4" />
          Mark all read
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0 divide-y divide-border">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                !n.read ? "bg-primary/5" : "hover:bg-secondary/20"
              }`}
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${typeColors[n.type]}`}>
                <n.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{n.title}</p>
                  {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.desc}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{n.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
