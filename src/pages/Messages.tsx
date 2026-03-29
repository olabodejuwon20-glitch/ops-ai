import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Phone, Mail, MessageSquare, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { streamAgentResponse } from "@/lib/ai-agent";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

export default function Messages() {
  const { companyId } = useAuth();
  const { toast } = useToast();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  // Fetch leads with conversations
  const { data: leads = [] } = useQuery({
    queryKey: ["leads-for-messages", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("company_id", companyId)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  // Fetch messages for selected lead
  const { data: dbMessages = [] } = useQuery({
    queryKey: ["messages", selectedLeadId],
    queryFn: async () => {
      if (!selectedLeadId || !companyId) return [];
      const { data: convs } = await supabase
        .from("conversations")
        .select("id")
        .eq("lead_id", selectedLeadId)
        .eq("company_id", companyId);
      if (!convs?.length) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .in("conversation_id", convs.map(c => c.id))
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedLeadId && !!companyId,
  });

  const selectedLead = leads.find(l => l.id === selectedLeadId);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const userMsg: ChatMsg = { role: "user", content: input };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setChatMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamAgentResponse({
        messages: newMessages,
        agentType: "sales",
        tone: "professional",
        leadContext: selectedLead ? {
          name: selectedLead.name,
          company: selectedLead.lead_company || "",
          source: selectedLead.source,
          history: selectedLead.ai_summary || undefined,
        } : undefined,
        onDelta: upsertAssistant,
        onDone: () => setIsStreaming(false),
      });

      // Save messages to DB if we have a conversation
      if (selectedLeadId && companyId) {
        let convId: string;
        const { data: existingConv } = await supabase
          .from("conversations")
          .select("id")
          .eq("lead_id", selectedLeadId)
          .eq("company_id", companyId)
          .limit(1)
          .single();

        if (existingConv) {
          convId = existingConv.id;
        } else {
          const { data: newConv } = await supabase
            .from("conversations")
            .insert({ lead_id: selectedLeadId, company_id: companyId, channel: "email" })
            .select()
            .single();
          convId = newConv!.id;
        }

        await supabase.from("messages").insert([
          { conversation_id: convId, company_id: companyId, sender_type: "user", content: input },
          { conversation_id: convId, company_id: companyId, sender_type: "ai", content: assistantSoFar },
        ]);
      }
    } catch (e: any) {
      toast({ title: "AI Error", description: e.message, variant: "destructive" });
      setIsStreaming(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">AI-powered conversations with your leads.</p>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-220px)]">
        {/* Lead List */}
        <div className="col-span-4">
          <Card className="border-border bg-card h-full flex flex-col">
            <CardHeader className="pb-3">
              <Input placeholder="Search leads..." className="bg-secondary/50 border-0 text-sm" />
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-1 px-3">
              {leads.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No leads yet</p>
              ) : leads.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => {
                    setSelectedLeadId(lead.id);
                    setChatMessages([]);
                  }}
                  className={`w-full flex items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                    selectedLeadId === lead.id ? "bg-secondary" : "hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{lead.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{lead.lead_company || lead.email || "—"}</p>
                  </div>
                  {lead.tag && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      lead.tag === "hot" ? "bg-destructive/15 text-destructive" :
                      lead.tag === "warm" ? "bg-warning/15 text-warning" : "bg-info/15 text-info"
                    }`}>{lead.tag}</span>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat */}
        <div className="col-span-8">
          <Card className="border-border bg-card h-full flex flex-col">
            {selectedLead ? (
              <>
                <CardHeader className="pb-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {selectedLead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <CardTitle className="text-sm">{selectedLead.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{selectedLead.lead_company || "—"} · {selectedLead.source}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-xs text-primary">
                      <Sparkles className="h-3 w-3" />
                      AI Sales Agent
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Show stored messages */}
                  {dbMessages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.sender_type === "lead" ? "" : "flex-row-reverse"}`}>
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        msg.sender_type === "ai" ? "bg-primary/20" : "bg-secondary"
                      }`}>
                        {msg.sender_type === "ai" ? <Bot className="h-3.5 w-3.5 text-primary" /> : <User className="h-3.5 w-3.5 text-muted-foreground" />}
                      </div>
                      <div className={`max-w-[70%] rounded-xl px-4 py-2.5 ${
                        msg.sender_type === "ai" ? "bg-primary/10" : "bg-secondary"
                      }`}>
                        <div className="text-sm prose prose-sm prose-invert max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {/* Show live chat messages */}
                  {chatMessages.map((msg, i) => (
                    <div key={`chat-${i}`} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        msg.role === "assistant" ? "bg-primary/20" : "bg-secondary"
                      }`}>
                        {msg.role === "assistant" ? <Bot className="h-3.5 w-3.5 text-primary" /> : <User className="h-3.5 w-3.5 text-muted-foreground" />}
                      </div>
                      <div className={`max-w-[70%] rounded-xl px-4 py-2.5 ${
                        msg.role === "assistant" ? "bg-primary/10" : "bg-secondary"
                      }`}>
                        <div className="text-sm prose prose-sm prose-invert max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isStreaming && chatMessages[chatMessages.length - 1]?.role !== "assistant" && (
                    <div className="flex gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20">
                        <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                      </div>
                      <div className="rounded-xl bg-primary/10 px-4 py-2.5 text-sm text-muted-foreground">
                        Thinking...
                      </div>
                    </div>
                  )}
                </CardContent>
                <div className="border-t border-border p-4">
                  <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                    <Input
                      placeholder="Type a message to the AI agent..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="bg-secondary/50 border-0"
                      disabled={isStreaming}
                    />
                    <Button size="icon" type="submit" disabled={isStreaming || !input.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select a lead to start a conversation</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
