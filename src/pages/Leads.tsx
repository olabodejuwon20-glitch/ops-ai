import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Phone,
  Mail,
  MessageSquare,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "new" | "contacted" | "qualified" | "closed";
  tag: "hot" | "warm" | "cold";
  source: "website" | "whatsapp" | "email" | "api";
  assignee: string;
  lastActivity: string;
  message: string;
}

const mockLeads: Lead[] = [
  { id: "1", name: "Sarah Chen", email: "sarah@acme.co", phone: "+1 555-0101", company: "Acme Corp", status: "new", tag: "hot", source: "website", assignee: "AI Agent", lastActivity: "2 min ago", message: "Interested in enterprise plan" },
  { id: "2", name: "Marcus Williams", email: "marcus@startup.io", phone: "+1 555-0102", company: "StartupIO", status: "contacted", tag: "warm", source: "whatsapp", assignee: "John D.", lastActivity: "15 min ago", message: "Pricing inquiry for team of 50" },
  { id: "3", name: "Elena Rodriguez", email: "elena@corp.com", phone: "+1 555-0103", company: "GlobalCorp", status: "qualified", tag: "hot", source: "email", assignee: "AI Agent", lastActivity: "1h ago", message: "Ready to schedule a demo" },
  { id: "4", name: "James Park", email: "james@tech.dev", phone: "+1 555-0104", company: "TechDev", status: "new", tag: "cold", source: "website", assignee: "Unassigned", lastActivity: "2h ago", message: "Just browsing" },
  { id: "5", name: "Aisha Patel", email: "aisha@growth.co", phone: "+1 555-0105", company: "GrowthCo", status: "contacted", tag: "warm", source: "api", assignee: "Sarah M.", lastActivity: "3h ago", message: "Looking for integration support" },
  { id: "6", name: "David Kim", email: "david@megacorp.com", phone: "+1 555-0106", company: "MegaCorp", status: "qualified", tag: "hot", source: "email", assignee: "AI Agent", lastActivity: "4h ago", message: "Budget approved, need proposal" },
  { id: "7", name: "Lisa Thompson", email: "lisa@newbiz.co", phone: "+1 555-0107", company: "NewBiz", status: "closed", tag: "hot", source: "website", assignee: "John D.", lastActivity: "1d ago", message: "Signed annual contract" },
];

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

  const filtered = mockLeads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.company.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesTag = tagFilter === "all" || lead.tag === tagFilter;
    return matchesSearch && matchesStatus && matchesTag;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground">{mockLeads.length} total leads</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input placeholder="Full name" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input placeholder="email@company.com" className="bg-secondary/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input placeholder="+1 555-0000" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input placeholder="Company name" className="bg-secondary/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea placeholder="Initial message or notes..." className="bg-secondary/50" />
              </div>
              <Button className="w-full">Create Lead</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary/50 border-0"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] bg-secondary/50 border-0">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-[120px] bg-secondary/50 border-0">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Lead</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tag</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Assigned</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Activity</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
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
                            {lead.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{lead.name}</p>
                            <p className="text-xs text-muted-foreground">{lead.company}</p>
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
                      <td className="px-4 py-3 text-sm text-muted-foreground">{lead.assignee}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{lead.lastActivity}</td>
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
