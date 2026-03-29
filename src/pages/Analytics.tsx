import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Bot,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";

const monthlyData = [
  { month: "Jan", leads: 120, conversions: 28 },
  { month: "Feb", leads: 145, conversions: 35 },
  { month: "Mar", leads: 198, conversions: 52 },
  { month: "Apr", leads: 230, conversions: 68 },
  { month: "May", leads: 280, conversions: 82 },
  { month: "Jun", leads: 310, conversions: 95 },
];

const sourceData = [
  { name: "Website", value: 45, color: "hsl(217, 91%, 60%)" },
  { name: "Email", value: 25, color: "hsl(160, 84%, 39%)" },
  { name: "WhatsApp", value: 20, color: "hsl(38, 92%, 50%)" },
  { name: "API", value: 10, color: "hsl(250, 91%, 65%)" },
];

const responseTimeData = [
  { day: "Mon", ai: 0.3, human: 12.5 },
  { day: "Tue", ai: 0.2, human: 15.2 },
  { day: "Wed", ai: 0.4, human: 8.7 },
  { day: "Thu", ai: 0.3, human: 22.1 },
  { day: "Fri", ai: 0.2, human: 18.3 },
];

const performanceData = [
  { metric: "Response Rate", ai: 98, human: 72 },
  { metric: "Qualification", ai: 85, human: 78 },
  { metric: "Follow-up", ai: 100, human: 45 },
  { metric: "Conversion", ai: 24, human: 31 },
];

export default function Analytics() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Track your sales performance and AI efficiency.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Leads (6mo)", value: "1,283", icon: Users, change: "+34%" },
          { label: "Avg Conversion", value: "24.8%", icon: TrendingUp, change: "+3.2%" },
          { label: "Avg Response Time", value: "0.3s", icon: Clock, change: "AI powered" },
          { label: "AI Tasks Completed", value: "8,492", icon: Bot, change: "+128%" },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-secondary p-2">
                  <kpi.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-xs text-success">{kpi.change}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Monthly Trends */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="lgLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="lgConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 12%, 18%)" />
                <XAxis dataKey="month" stroke="hsl(215, 15%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(225, 14%, 11%)", border: "1px solid hsl(225, 12%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 95%)", fontSize: "12px" }} />
                <Area type="monotone" dataKey="leads" stroke="hsl(217, 91%, 60%)" fill="url(#lgLeads)" strokeWidth={2} />
                <Area type="monotone" dataKey="conversions" stroke="hsl(160, 84%, 39%)" fill="url(#lgConv)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lead Sources</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="flex items-center gap-8">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={sourceData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {sourceData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {sourceData.map((s) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-sm text-muted-foreground">{s.name}</span>
                    <span className="text-sm font-medium">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Time: AI vs Human */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Response Time (minutes)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 12%, 18%)" />
                <XAxis dataKey="day" stroke="hsl(215, 15%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(225, 14%, 11%)", border: "1px solid hsl(225, 12%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 95%)", fontSize: "12px" }} />
                <Bar dataKey="ai" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} name="AI Agent" />
                <Bar dataKey="human" fill="hsl(215, 15%, 55%)" radius={[4, 4, 0, 0]} name="Human" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI vs Human Performance */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AI vs Human Performance (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-2">
              {performanceData.map((p) => (
                <div key={p.metric} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{p.metric}</span>
                    <span>
                      <span className="text-primary">AI {p.ai}%</span>
                      <span className="text-muted-foreground mx-2">vs</span>
                      <span className="text-muted-foreground">Human {p.human}%</span>
                    </span>
                  </div>
                  <div className="flex gap-1 h-2">
                    <div className="rounded-full bg-primary" style={{ width: `${p.ai}%` }} />
                    <div className="rounded-full bg-muted" style={{ width: `${p.human}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
