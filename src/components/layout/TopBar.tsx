import { Bell, Search, User, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Props {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unread-notifications", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);
      if (error) return 0;
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <Search className="h-4 w-4 text-muted-foreground hidden sm:block" />
        <Input
          placeholder="Search leads, messages..."
          className="border-0 bg-secondary/50 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary hidden sm:block"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/notifications")}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/settings")}
        >
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
