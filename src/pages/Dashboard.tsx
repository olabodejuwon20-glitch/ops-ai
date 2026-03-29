import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  MessageSquare,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
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
  BarChart,
  Bar,
} from "recharts";

const stats = [
  {
    title: "Total Leads",
    value: "2,847",
    change: "+12.5%",
    trend: "up" as const,
    icon: Users,
  },
  {
    title: "Conversion Rate",
    value: "24.8%",
    change: "+3.2%",
    trend: "up" as const,
    icon: TrendingUp,
  },
  {
    title: "AI Responses",
    value: "1,234",
    change: "+28.4%",
    trend: "up" as const,
    icon: MessageSquare,
  },
  {
    title: "Automations Run",
    value: "892",
    change: "-2.1%",
    trend: "down" as const,
    icon: Zap,
  },
];

const chartData = [
  { name: "Mon", leads: 45, conversions: 12 },
  { name: "Tue", leads: 52, conversions: 18 },
  { name: "Wed", leads: 38, conversions: 9 },
  { name: "Thu", leads: 65, conversions: 24 },
  { name: "Fri", leads: 48, conversions: 15 },
  { name: "Sat", leads: 32, conversions: 8 },
  { name: "Sun", leads: 28, conversions: 6 },
];

const recentLeads = [
  { name: "Sarah Chen", email: "sarah@acme.co", status: "hot", source: "Website", time: "2m ago" },
  { name: "Marcus Williams", email: "marcus@startup.io", status: "warm", source: "WhatsApp", time: "15m ago" },
  { name: "Elena Rodriguez", email: "elena@corp.com", status: "cold", source: "Email", time: "1h ago" },
  { name: "James Park", email: "james@tech.dev", status: "hot", source: "Website", time: "2h ago" },
  { name: "Aisha Patel", email: "aisha@growth.co", status: "warm", source: "API", time: "3h ago" },
];

const statusColors: Record<string, string> = {
  hot: "bg-destructive/20 text-destructive",
  warm: "bg-warning/20 text-warning",
  cold: "bg-info/20 text-info",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your sales performance at a glance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="border-border bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-secondary p-2">
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span
                    className={`flex items-center gap-1 text-xs font-medium ${
                      stat.trend === "up" ? "text-success" : "text-destructive"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {stat.change}
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div variants={item}>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Lead Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 12%, 18%)" />
                  <XAxis dataKey="name" stroke="hsl(215, 15%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(225, 14%, 11%)",
                      border: "1px solid hsl(225, 12%, 18%)",
                      borderRadius: "8px",
                      color: "hsl(210, 20%, 95%)",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    stroke="hsl(217, 91%, 60%)"
                    fillOpacity={1}
                    fill="url(#leadGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Conversions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 12%, 18%)" />
                  <XAxis dataKey="name" stroke="hsl(215, 15%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(225, 14%, 11%)",
                      border: "1px solid hsl(225, 12%, 18%)",
                      borderRadius: "8px",
                      color: "hsl(210, 20%, 95%)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="conversions" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Leads */}
      <motion.div variants={item}>
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div
                  key={lead.email}
                  className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                      {lead.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[lead.status]}`}>
                      {lead.status}
                    </span>
                    <span className="text-xs text-muted-foreground">{lead.source}</span>
                    <span className="text-xs text-muted-foreground">{lead.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
