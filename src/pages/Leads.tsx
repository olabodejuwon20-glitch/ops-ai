import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  MoreHorizontal,
  Phone,
  Mail,
  MessageSquare,
  User,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { analyzeLeadMessage } from "@/lib/ai-agent";
import type { Tables } from "@/integrations/supabase/types";

type Lead = Tables<"leads">;

const tagStyles: Record<string, string> = {
  hot: "bg-destructive/15 text-destructive border-destructive/20",
  warm: "bg-warning/15 text-warning border-warning/20",
  cold: "bg-info/15 text-info border-info/20",
};

const statusStyles: Record<string, string> = {
  new: "bg-primary/15 text-primary",
  contacted: "bg-warning/15 text-warning",
  qualified: "bg-success/15 text-success",
  closed: "bg-muted text-muted-foreground",
};

const sourceIcons: Record<string, typeof Mail> = {
  website: User,
  whatsapp: MessageSquare,
  email: Mail,
  api: Phone,
};

export default function Leads() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newLead, setNewLead] = useState({ name: "", email: "", phone: "", company: "", message: "" });
  const [analyzing, setAnalyzing] = useState(false);
  const { companyId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!companyId,
  });

  const createLeadMutation = useMutation({
    mutationFn: async () => {
      if (!companyId) throw new Error("No company");

      // First create the lead
      const { data: lead, error } = await supabase
        .from("leads")
        .insert({
          company_id: companyId,
          name: newLead.name,
          email: newLead.email || null,
          phone: newLead.phone || null,
          lead_company: newLead.company || null,
          message: newLead.message || null,
          source: "website" as const,
        })
        .select()
        .single();
      if (error) throw error;

      // Then analyze with AI if there's a message
      if (newLead.message && lead) {
        setAnalyzing(true);
        try {
          const { analysis } = await analyzeLeadMessage(newLead.message, {
            name: newLead.name,
            company: newLead.company,
            source: "website",
          });

          if (analysis) {
            await supabase
              .from("leads")
              .update({
                tag: analysis.suggestedTag,
                status: analysis.suggestedStatus,
                intent: analysis.intent,
                ai_summary: analysis.summary,
              })
              .eq("id", lead.id);
          }
        } catch (e) {
          console.error("AI analysis failed:", e);
        } finally {
          setAnalyzing(false);
        }
      }

      return lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setNewLead({ name: "", email: "", phone: "", company: "", message: "" });
      setDialogOpen(false);
      toast({ title: "Lead created", description: "AI has analyzed and tagged the lead." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const filtered = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (lead.lead_company || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesTag = tagFilter === "all" || lead.tag === tagFilter;
    return matchesSearch && matchesStatus && matchesTag;
  });

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground">{leads.length} total leads</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
              <p className="text-sm text-muted-foreground">Fill in the details below. AI will analyze and tag the lead automatically.</p>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input placeholder="Full name" className="bg-secondary/50" value={newLead.name} onChange={(e) => setNewLead({ ...newLead, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input placeholder="email@company.com" className="bg-secondary/50" value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input placeholder="+1 555-0000" className="bg-secondary/50" value={newLead.phone} onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input placeholder="Company name" className="bg-secondary/50" value={newLead.company} onChange={(e) => setNewLead({ ...newLead, company: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea placeholder="Initial message or notes..." className="bg-secondary/50" value={newLead.message} onChange={(e) => setNewLead({ ...newLead, message: e.target.value })} />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" />
                AI will automatically analyze and tag this lead
              </div>
              <Button className="w-full" onClick={() => createLeadMutation.mutate()} disabled={!newLead.name || createLeadMutation.isPending}>
                {createLeadMutation.isPending ? (
                  <>{analyzing ? "AI Analyzing..." : "Creating..."} <Loader2 className="ml-2 h-4 w-4 animate-spin" /></>
                ) : (
                  "Create Lead"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50 border-0" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] bg-secondary/50 border-0"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-[120px] bg-secondary/50 border-0"><SelectValue placeholder="Tag" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            <SelectItem value="hot">Hot</SelectItem>
            <SelectItem value="warm">Warm</SelectItem>
            <SelectItem value="cold">Cold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lead Table */}
      <Card className="border-border bg-card overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {leads.length === 0 ? "No leads yet. Add your first lead!" : "No leads match your filters."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Lead</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tag</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Intent</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Activity</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => {
                    const SourceIcon = sourceIcons[lead.source] || User;
                    return (
                      <tr key={lead.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                              {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{lead.name}</p>
                              <p className="text-xs text-muted-foreground">{lead.lead_company || lead.email || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[lead.status]}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${tagStyles[lead.tag]}`}>
                            {lead.tag}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <SourceIcon className="h-3 w-3" />
                            {lead.source}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {lead.intent ? (
                            <span className="text-xs text-muted-foreground capitalize">{lead.intent}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground/50">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{timeAgo(lead.updated_at)}</td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
