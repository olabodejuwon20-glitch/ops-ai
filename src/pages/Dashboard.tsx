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
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { useDashboardStats, useRecentLeads, useLeadsByDay } from "@/hooks/useDashboardData";
import { formatDistanceToNow } from "date-fns";

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
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentLeads, isLoading: leadsLoading } = useRecentLeads();
  const { data: chartData, isLoading: chartLoading } = useLeadsByDay();

  const kpis = [
    {
      title: "Total Leads",
      value: stats ? stats.totalLeads.toLocaleString() : "—",
      change: stats ? `${Number(stats.leadsChange) >= 0 ? "+" : ""}${stats.leadsChange}%` : "",
      trend: stats ? (Number(stats.leadsChange) >= 0 ? "up" : "down") : "up",
      icon: Users,
    },
    {
      title: "Conversion Rate",
      value: stats ? `${stats.conversionRate}%` : "—",
      change: "",
      trend: "up" as const,
      icon: TrendingUp,
    },
    {
      title: "AI Responses",
      value: stats ? stats.aiMessages.toLocaleString() : "—",
      change: "",
      trend: "up" as const,
      icon: MessageSquare,
    },
    {
      title: "Active Automations",
      value: stats ? stats.automationCount.toLocaleString() : "—",
      change: "",
      trend: "up" as const,
      icon: Zap,
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your sales performance at a glance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="border-border bg-card">
              <CardContent className="p-5">
                {statsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-7 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="rounded-lg bg-secondary p-2">
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {stat.change && (
                        <span className={`flex items-center gap-1 text-xs font-medium ${stat.trend === "up" ? "text-success" : "text-destructive"}`}>
                          {stat.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {stat.change}
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.title}</p>
                    </div>
                  </>
                )}
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Lead Activity (7 days)</CardTitle>
            </CardHeader>
            <CardContent>
              {chartLoading ? (
                <Skeleton className="h-[240px] w-full" />
              ) : (
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
                    <Tooltip contentStyle={{ backgroundColor: "hsl(225, 14%, 11%)", border: "1px solid hsl(225, 12%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 95%)", fontSize: "12px" }} />
                    <Area type="monotone" dataKey="leads" stroke="hsl(217, 91%, 60%)" fillOpacity={1} fill="url(#leadGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversions (7 days)</CardTitle>
            </CardHeader>
            <CardContent>
              {chartLoading ? (
                <Skeleton className="h-[240px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 12%, 18%)" />
                    <XAxis dataKey="name" stroke="hsl(215, 15%, 55%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(225, 14%, 11%)", border: "1px solid hsl(225, 12%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 95%)", fontSize: "12px" }} />
                    <Bar dataKey="conversions" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Leads */}
      <motion.div variants={item}>
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {leadsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : !recentLeads?.length ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No leads yet. Create your first lead to get started.</p>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                        {lead.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">{lead.email || "No email"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[lead.tag] || ""}`}>
                        {lead.tag}
                      </span>
                      <span className="text-xs text-muted-foreground">{lead.source}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
