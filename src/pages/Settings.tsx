import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your workspace and integrations.</p>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="ai">AI Config</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Company Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input defaultValue="Acme Corp" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input defaultValue="SaaS / Technology" className="bg-secondary/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input defaultValue="https://acme.co" className="bg-secondary/50" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Team Members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "John Doe", email: "john@acme.co", role: "Admin" },
                { name: "Sarah Miller", email: "sarah@acme.co", role: "Staff" },
              ].map((member) => (
                <div key={member.email} className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{member.role}</span>
                </div>
              ))}
              <Button variant="outline" className="w-full border-border">Invite Member</Button>
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
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
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
              <Button>Save Configuration</Button>
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
                { name: "Email (SMTP)", status: "Connected", connected: true },
                { name: "WhatsApp (Twilio)", status: "Not connected", connected: false },
                { name: "SMS (Twilio)", status: "Not connected", connected: false },
              ].map((ch) => (
                <div key={ch.name} className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{ch.name}</p>
                    <p className={`text-xs ${ch.connected ? "text-success" : "text-muted-foreground"}`}>{ch.status}</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-border">
                    {ch.connected ? "Configure" : "Connect"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Current Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Pro Plan</p>
                    <p className="text-sm text-muted-foreground">$99/month · Up to 10 users</p>
                  </div>
                  <Button variant="outline" className="border-border">Upgrade</Button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">AI tasks used</span>
                  <span>8,492 / 10,000</span>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: "85%" }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Leads tracked</span>
                  <span>2,847 / 5,000</span>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-success" style={{ width: "57%" }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            {[
              { name: "Starter", price: "$29", features: ["500 leads", "2 users", "1,000 AI tasks"] },
              { name: "Pro", price: "$99", features: ["5,000 leads", "10 users", "10,000 AI tasks"], current: true },
              { name: "Enterprise", price: "Custom", features: ["Unlimited leads", "Unlimited users", "Unlimited AI"] },
            ].map((plan) => (
              <Card key={plan.name} className={`border-border bg-card ${plan.current ? "ring-1 ring-primary" : ""}`}>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="font-semibold">{plan.name}</p>
                    <p className="text-2xl font-bold">{plan.price}<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
                  </div>
                  <ul className="space-y-1">
                    {plan.features.map((f) => (
                      <li key={f} className="text-xs text-muted-foreground">✓ {f}</li>
                    ))}
                  </ul>
                  <Button variant={plan.current ? "default" : "outline"} className="w-full border-border" size="sm">
                    {plan.current ? "Current Plan" : "Select"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
