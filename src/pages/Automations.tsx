import { motion } from "framer-motion";
import { Zap, Plus, Clock, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const workflows = [
  {
    name: "New Lead Follow-up",
    description: "Send personalized email 1h after lead capture. If no reply, follow up at 24h and 72h.",
    active: true,
    triggers: 234,
    successRate: 68,
    steps: ["Wait 1h", "Send email", "Wait 24h", "Check reply", "Send follow-up"],
  },
  {
    name: "Hot Lead Escalation",
    description: "When AI detects high buying intent, notify team and schedule demo automatically.",
    active: true,
    triggers: 89,
    successRate: 92,
    steps: ["Detect intent", "Tag as hot", "Notify team", "Send calendar link"],
  },
  {
    name: "Re-engagement Campaign",
    description: "Reach out to cold leads after 30 days with updated offers and new features.",
    active: false,
    triggers: 45,
    successRate: 23,
    steps: ["Wait 30d", "Check status", "Send update", "Wait 7d", "Final follow-up"],
  },
  {
    name: "WhatsApp Quick Reply",
    description: "Auto-respond to WhatsApp messages within 30 seconds with AI-generated replies.",
    active: true,
    triggers: 567,
    successRate: 85,
    steps: ["Receive message", "AI analysis", "Generate reply", "Send via WhatsApp"],
  },
];

export default function Automations() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Automations</h1>
          <p className="text-sm text-muted-foreground">Automate your sales workflows and follow-ups.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      <div className="grid gap-4">
        {workflows.map((wf) => (
          <motion.div
            key={wf.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-border bg-card">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{wf.name}</h3>
                        <Badge variant={wf.active ? "default" : "secondary"} className={wf.active ? "bg-success/15 text-success border-0" : ""}>
                          {wf.active ? "Active" : "Paused"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{wf.description}</p>

                      {/* Workflow steps */}
                      <div className="mt-3 flex flex-wrap items-center gap-1">
                        {wf.steps.map((step, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                              {step}
                            </span>
                            {i < wf.steps.length - 1 && (
                              <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-center">
                      <p className="text-lg font-bold">{wf.triggers}</p>
                      <p className="text-[10px] text-muted-foreground">Triggers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-success">{wf.successRate}%</p>
                      <p className="text-[10px] text-muted-foreground">Success</p>
                    </div>
                    <Switch defaultChecked={wf.active} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
