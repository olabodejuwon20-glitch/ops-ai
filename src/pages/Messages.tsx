import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Phone, Mail, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  id: string;
  sender: "user" | "ai" | "lead";
  content: string;
  timestamp: string;
  channel: "email" | "whatsapp" | "sms";
}

const conversations = [
  { id: "1", name: "Sarah Chen", company: "Acme Corp", lastMsg: "That sounds great, let's schedule...", time: "2m", unread: 2, channel: "email" as const },
  { id: "2", name: "Marcus Williams", company: "StartupIO", lastMsg: "What's included in the enterprise plan?", time: "15m", unread: 0, channel: "whatsapp" as const },
  { id: "3", name: "Elena Rodriguez", company: "GlobalCorp", lastMsg: "Can you send me the proposal?", time: "1h", unread: 1, channel: "email" as const },
  { id: "4", name: "David Kim", company: "MegaCorp", lastMsg: "Budget approved. Next steps?", time: "2h", unread: 0, channel: "sms" as const },
];

const mockMessages: Message[] = [
  { id: "1", sender: "lead", content: "Hi, I'm interested in your enterprise plan. Can you tell me more about pricing for a team of 200+?", timestamp: "10:23 AM", channel: "email" },
  { id: "2", sender: "ai", content: "Hi Sarah! Thanks for reaching out. For teams of 200+, we offer our Enterprise plan starting at $29/user/month with volume discounts. This includes priority support, custom integrations, and a dedicated success manager. Would you like me to schedule a demo with our team?", timestamp: "10:24 AM", channel: "email" },
  { id: "3", sender: "lead", content: "That sounds great, let's schedule a demo. Do you have availability this week?", timestamp: "10:30 AM", channel: "email" },
  { id: "4", sender: "ai", content: "I'd be happy to set that up! I have availability on Thursday at 2 PM or Friday at 10 AM EST. Which works better for you? I'll send a calendar invite with a Zoom link.", timestamp: "10:31 AM", channel: "email" },
];

const channelIcons = {
  email: Mail,
  whatsapp: MessageSquare,
  sms: Phone,
};

export default function Messages() {
  const [selected, setSelected] = useState("1");
  const [input, setInput] = useState("");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">Manage all conversations across channels.</p>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-220px)]">
        {/* Conversation List */}
        <div className="col-span-4">
          <Card className="border-border bg-card h-full flex flex-col">
            <CardHeader className="pb-3">
              <Input placeholder="Search conversations..." className="bg-secondary/50 border-0 text-sm" />
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-1 px-3">
              {conversations.map((conv) => {
                const Icon = channelIcons[conv.channel];
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelected(conv.id)}
                    className={`w-full flex items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                      selected === conv.id ? "bg-secondary" : "hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {conv.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{conv.name}</p>
                        <span className="text-[10px] text-muted-foreground">{conv.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMsg}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Icon className="h-3 w-3 text-muted-foreground" />
                      {conv.unread > 0 && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Chat Panel */}
        <div className="col-span-8">
          <Card className="border-border bg-card h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    SC
                  </div>
                  <div>
                    <CardTitle className="text-sm">Sarah Chen</CardTitle>
                    <p className="text-xs text-muted-foreground">Acme Corp · via Email</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {mockMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === "lead" ? "" : "flex-row-reverse"}`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      msg.sender === "ai"
                        ? "bg-primary/20"
                        : msg.sender === "lead"
                        ? "bg-secondary"
                        : "bg-success/20"
                    }`}
                  >
                    {msg.sender === "ai" ? (
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <div
                    className={`max-w-[70%] rounded-xl px-4 py-2.5 ${
                      msg.sender === "ai"
                        ? "bg-primary/10 text-foreground"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="bg-secondary/50 border-0"
                />
                <Button size="icon" className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
