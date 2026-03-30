import { motion } from "framer-motion";
import { Bell, Check, Bot, Users, MessageSquare, Zap, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const typeIcons: Record<string, typeof Bell> = {
  lead: Users,
  ai: Bot,
  message: MessageSquare,
  automation: Zap,
  warning: AlertTriangle,
};

const typeColors: Record<string, string> = {
  lead: "bg-primary/15 text-primary",
  ai: "bg-success/15 text-success",
  message: "bg-accent/15 text-accent",
  automation: "bg-warning/15 text-warning",
  warning: "bg-destructive/15 text-destructive",
};

export default function Notifications() {
  const { user, companyId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      if (!unreadIds.length) return;
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .in("id", unreadIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({ title: "All notifications marked as read" });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 border-border text-sm"
          onClick={() => markAllReadMutation.mutate()}
          disabled={unreadCount === 0 || markAllReadMutation.isPending}
        >
          <Check className="h-4 w-4" />
          Mark all read
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0 divide-y divide-border">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => {
              const Icon = typeIcons[n.type] || Bell;
              return (
                <button
                  key={n.id}
                  onClick={() => !n.read && markReadMutation.mutate(n.id)}
                  className={`w-full flex items-start gap-4 px-5 py-4 text-left transition-colors ${
                    !n.read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-secondary/20"
                  }`}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${typeColors[n.type] || "bg-secondary text-muted-foreground"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{n.title}</p>
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </div>
                    {n.description && <p className="text-sm text-muted-foreground mt-0.5">{n.description}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </span>
                </button>
              );
            })
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
