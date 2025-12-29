// components/bar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/hooks/use-auth";
import { User } from "lucide-react";
import { AddEgressDialog } from "@/components/add-egress-dialog";
import { AddIngressDialog } from "@/components/add-ingress-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
// import { createClient } from "@/lib/supabase/client";

interface BarProps {
  activeTab: "egress" | "ingress";
  onTabChange: (tab: "egress" | "ingress") => void;
  balance: number;
}

export function Bar({ activeTab, onTabChange, balance }: BarProps) {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const formattedBalance = new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 0,
  }).format(balance);
  const supabase = createClient();

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${
          process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
        }/api/auth/callback`,
      },
    });
  };

  return (
    <div className="flex flex-row items-center justify-between w-full h-full">
      <div className="flex flex-row items-center gap-4">
        <Button
          variant={activeTab === "egress" ? "outline" : "ghost"}
          onClick={() => onTabChange("egress")}
        >
          Egress
        </Button>
        <Button
          variant={activeTab === "ingress" ? "outline" : "ghost"}
          onClick={() => onTabChange("ingress")}
        >
          Ingress
        </Button>
        <div className="flex flex-row items-center gap-2">
          <span className="text-sm text-muted-foreground">餘額：</span>
          <Badge
            variant={balance >= 0 ? "default" : "destructive"}
            className="font-mono"
          >
            {formattedBalance}
          </Badge>
        </div>
        {user && (
          <div className="ml-4">
            {activeTab === "egress" ? (
              <AddEgressDialog />
            ) : (
              <AddIngressDialog />
            )}
          </div>
        )}
      </div>

      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full outline-none focus:ring-2 focus:ring-ring">
              <Avatar className="cursor-pointer">
                <AvatarImage src={user.user_metadata.avatar_url} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>
              {user.user_metadata?.name || user.email}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              登出
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <button
          onClick={handleLogin}
          disabled={loading}
          className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="登入"
        >
          <Avatar>
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </button>
      )}
    </div>
  );
}
