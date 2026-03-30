import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { companyId, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Company data
  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ["company", companyId],
    queryFn: async () => {
      if (!companyId) return null;
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  const [companyForm, setCompanyForm] = useState({ name: "", industry: "", website: "" });

  useEffect(() => {
    if (company) {
      setCompanyForm({
        name: company.name || "",
        industry: company.industry || "",
        website: company.website || "",
      });
    }
  }, [company]);

  const updateCompanyMutation = useMutation({
    mutationFn: async () => {
      if (!companyId) throw new Error("No company");
      const { error } = await supabase.from("companies").update({
        name: companyForm.name,
        industry: companyForm.industry || null,
        website: companyForm.website || null,
      }).eq("id", companyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
      toast({ title: "Company updated" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  // Profile update
  const [profileForm, setProfileForm] = useState({ full_name: "" });

  useEffect(() => {
    if (profile) {
      setProfileForm({ full_name: profile.full_name || "" });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error("No profile");
      const { error } = await supabase.from("profiles").update({
        full_name: profileForm.full_name,
      }).eq("id", profile.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: "Profile updated" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  // Team members
  const { data: teamMembers = [] } = useQuery({
    queryKey: ["team-members", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("company_id", companyId);
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your workspace and integrations.</p>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="ai">AI Config</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Company Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {companyLoading ? (
                <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input className="bg-secondary/50" value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Industry</Label>
                      <Input className="bg-secondary/50" value={companyForm.industry} onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })} placeholder="e.g. SaaS / Technology" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input className="bg-secondary/50" value={companyForm.website} onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })} placeholder="https://..." />
                  </div>
                  <Button onClick={() => updateCompanyMutation.mutate()} disabled={updateCompanyMutation.isPending}>
                    {updateCompanyMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Team Members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{member.full_name || "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground">Member</p>
                  </div>
                </div>
              ))}
              {teamMembers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No team members found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input className="bg-secondary/50" value={profileForm.full_name} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} />
              </div>
              <Button onClick={() => updateProfileMutation.mutate()} disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Update Profile"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">AI Agent Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Tone</Label>
                <Select defaultValue="professional">
                  <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="persuasive">Persuasive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Custom Instructions</Label>
                <Textarea
                  placeholder="Add specific instructions for the AI agent..."
                  className="bg-secondary/50 min-h-[100px]"
                  defaultValue="Always mention our 14-day free trial. Use the customer's first name. Focus on ROI and time savings."
                />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Auto-respond to new leads</p>
                  <p className="text-xs text-muted-foreground">AI will respond within 30 seconds</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Smart intent detection</p>
                  <p className="text-xs text-muted-foreground">Classify leads by buying intent</p>
                </div>
                <Switch defaultChecked />
              </div>
              <p className="text-xs text-muted-foreground">AI configuration is applied globally to all agents.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Communication Channels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Email (SMTP)", status: "Coming soon", connected: false },
                { name: "WhatsApp (Twilio)", status: "Coming soon", connected: false },
                { name: "SMS (Twilio)", status: "Coming soon", connected: false },
              ].map((ch) => (
                <div key={ch.name} className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{ch.name}</p>
                    <p className="text-xs text-muted-foreground">{ch.status}</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-border" disabled>
                    Connect
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
