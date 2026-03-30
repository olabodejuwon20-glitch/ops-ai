import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useDashboardStats() {
  const { companyId } = useAuth();

  return useQuery({
    queryKey: ["dashboard-stats", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000).toISOString();

      // Total leads (current 30d)
      const { count: totalLeads } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId!);

      // Leads last 30d
      const { count: leadsRecent } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId!)
        .gte("created_at", thirtyDaysAgo);

      // Leads previous 30d
      const { count: leadsPrev } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId!)
        .gte("created_at", sixtyDaysAgo)
        .lt("created_at", thirtyDaysAgo);

      // Closed leads (conversions)
      const { count: closedLeads } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId!)
        .eq("status", "closed");

      const conversionRate = totalLeads ? ((closedLeads || 0) / totalLeads * 100) : 0;

      // AI messages count
      const { count: aiMessages } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId!)
        .eq("sender_type", "ai");

      // Automation rules count
      const { count: automationCount } = await supabase
        .from("automation_rules")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId!)
        .eq("active", true);

      const leadsChange = leadsPrev ? (((leadsRecent || 0) - leadsPrev) / leadsPrev * 100) : 0;

      return {
        totalLeads: totalLeads || 0,
        conversionRate: conversionRate.toFixed(1),
        aiMessages: aiMessages || 0,
        automationCount: automationCount || 0,
        leadsChange: leadsChange.toFixed(1),
      };
    },
  });
}

export function useRecentLeads() {
  const { companyId } = useAuth();

  return useQuery({
    queryKey: ["recent-leads", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("company_id", companyId!)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });
}

export function useLeadsByDay() {
  const { companyId } = useAuth();

  return useQuery({
    queryKey: ["leads-by-day", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { data } = await supabase
        .from("leads")
        .select("created_at, status")
        .eq("company_id", companyId!)
        .gte("created_at", sevenDaysAgo);

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const buckets: Record<string, { leads: number; conversions: number }> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const label = days[d.getDay()];
        buckets[label] = { leads: 0, conversions: 0 };
      }

      (data || []).forEach((l) => {
        const d = new Date(l.created_at);
        const label = days[d.getDay()];
        if (buckets[label]) {
          buckets[label].leads++;
          if (l.status === "closed") buckets[label].conversions++;
        }
      });

      return Object.entries(buckets).map(([name, v]) => ({ name, ...v }));
    },
  });
}

export function useLeadsBySource() {
  const { companyId } = useAuth();

  return useQuery({
    queryKey: ["leads-by-source", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data } = await supabase
        .from("leads")
        .select("source")
        .eq("company_id", companyId!);

      const counts: Record<string, number> = {};
      (data || []).forEach((l) => {
        counts[l.source] = (counts[l.source] || 0) + 1;
      });

      const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
      const colors: Record<string, string> = {
        website: "hsl(217, 91%, 60%)",
        email: "hsl(160, 84%, 39%)",
        whatsapp: "hsl(38, 92%, 50%)",
        api: "hsl(250, 91%, 65%)",
      };

      return Object.entries(counts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round((value / total) * 100),
        color: colors[name] || "hsl(215, 15%, 55%)",
      }));
    },
  });
}

export function useLeadsByMonth() {
  const { companyId } = useAuth();

  return useQuery({
    queryKey: ["leads-by-month", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const sixMonthsAgo = new Date(Date.now() - 180 * 86400000).toISOString();
      const { data } = await supabase
        .from("leads")
        .select("created_at, status")
        .eq("company_id", companyId!)
        .gte("created_at", sixMonthsAgo);

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const buckets: Record<string, { leads: number; conversions: number }> = {};

      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const label = months[d.getMonth()];
        buckets[label] = { leads: 0, conversions: 0 };
      }

      (data || []).forEach((l) => {
        const d = new Date(l.created_at);
        const label = months[d.getMonth()];
        if (buckets[label]) {
          buckets[label].leads++;
          if (l.status === "closed") buckets[label].conversions++;
        }
      });

      return Object.entries(buckets).map(([month, v]) => ({ month, ...v }));
    },
  });
}

export function useAiVsHumanMessages() {
  const { companyId } = useAuth();

  return useQuery({
    queryKey: ["ai-vs-human", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { data } = await supabase
        .from("messages")
        .select("created_at, sender_type")
        .eq("company_id", companyId!)
        .gte("created_at", sevenDaysAgo);

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const buckets: Record<string, { ai: number; human: number }> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        buckets[days[d.getDay()]] = { ai: 0, human: 0 };
      }

      (data || []).forEach((m) => {
        const d = new Date(m.created_at);
        const label = days[d.getDay()];
        if (buckets[label]) {
          if (m.sender_type === "ai") buckets[label].ai++;
          else buckets[label].human++;
        }
      });

      return Object.entries(buckets).map(([day, v]) => ({ day, ...v }));
    },
  });
}
