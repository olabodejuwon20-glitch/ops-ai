import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Clock, Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import {
  useDashboardStats, useLeadsByMonth, useLeadsBySource, useAiVsHumanMessages,
} from "@/hooks/useDashboardData";

export default function Analytics() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: monthlyData, isLoading: monthlyLoading } = useLeadsByMonth();
  const { data: sourceData, isLoading: sourceLoading } = useLeadsBySource();
  const { data: msgData, isLoading: msgLoading } = useAiVsHumanMessages();

  const kpis = [
    { label: "Total Leads", value: stats ? stats.totalLeads.toLocaleString() : "—", icon: Users, change: stats ? `${Number(stats.leadsChange) >= 0 ? "+" : ""}${stats.leadsChange}%` : "" },
    { label: "Conversion Rate", value: stats ? `${stats.conversionRate}%` : "—", icon: TrendingUp, change: "" },
    { label: "AI Responses", value: stats ? stats.aiMessages.toLocaleString() : "—", icon: Bot, change: "" },
    { label: "Active Automations", value: stats ? stats.automationCount.toLocaleString() : "—", icon: BarChart3, change: "" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Track your sales performance and AI efficiency.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-border bg-card">
            <CardContent className="p-5">
              {statsLoading ? (
                <div className="space-y-2"><Skeleton className="h-4 w-8" /><Skeleton className="h-7 w-16" /></div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-secondary p-2">
                    <kpi.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    {kpi.change && <p className="text-xs text-success">{kpi.change}</p>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Monthly Trends */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Trends (6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyLoading ? <Skeleton className="h-[260px] w-full" /> : (
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
            )}
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lead Sources</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {sourceLoading ? <Skeleton className="h-[180px] w-[180px] rounded-full" /> : !sourceData?.length ? (
              <p className="text-sm text-muted-foreground py-10">No lead data yet.</p>
            ) : (
              <div className="flex items-center gap-8">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={sourceData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                      {sourceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
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
            )}
          </CardContent>
        </Card>

        {/* AI vs Human Messages */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AI vs Human Messages (7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {msgLoading ? <Skeleton className="h-[260px] w-full" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={msgData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 12%, 18%)" />
                  <XAxis dataKey="day" stroke="hsl(215, 15%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(225, 14%, 11%)", border: "1px solid hsl(225, 12%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 95%)", fontSize: "12px" }} />
                  <Bar dataKey="ai" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} name="AI" />
                  <Bar dataKey="human" fill="hsl(215, 15%, 55%)" radius={[4, 4, 0, 0]} name="Human" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
