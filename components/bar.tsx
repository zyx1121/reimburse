// components/bar.tsx
"use client";

import { useEffect, useState } from "react";
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
import { isGlobalAdmin, isSystemAdmin, type Roles } from "@/lib/utils/roles";

interface BarProps {
  activeTab: "egress" | "ingress";
  onTabChange: (tab: "egress" | "ingress") => void;
  balance: number;
}

export function Bar({ activeTab, onTabChange, balance }: BarProps) {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [isReimburseAdmin, setIsReimburseAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const formattedBalance = new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 0,
  }).format(balance);
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setIsReimburseAdmin(false);
      return;
    }

    let cancelled = false;
    async function checkAdmin() {
      if (!user) {
        setIsReimburseAdmin(false);
        return;
      }
      setCheckingAdmin(true);
      try {
        const { data: profile, error } = await supabase
          .from("user_profiles")
          .select("roles, is_admin")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Failed to load user profile for roles:", error);
          if (!cancelled) setIsReimburseAdmin(false);
          return;
        }

        const roles = (profile?.roles ?? null) as Roles | null;
        const isAdmin =
          isSystemAdmin(roles, "reimburse") ||
          isGlobalAdmin(
            roles,
            (profile as { is_admin?: boolean | null })?.is_admin
          );

        if (!cancelled) {
          setIsReimburseAdmin(isAdmin);
        }
      } finally {
        if (!cancelled) setCheckingAdmin(false);
      }
    }

    void checkAdmin();

    return () => {
      cancelled = true;
    };
  }, [supabase, user]);

  const handleLogin = async () => {
    await signInWithGoogle();
  };

  return (
    <div className="flex flex-row items-center justify-between w-full h-full">
      <div className="flex flex-row items-center">
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
      </div>

      <div className="flex flex-row items-center gap-4">
        <Badge
          variant={balance >= 0 ? "default" : "destructive"}
          className="font-mono"
        >
          {formattedBalance}
        </Badge>
        {user && isReimburseAdmin && !checkingAdmin && (
          <div className="">
            {activeTab === "egress" ? (
              <AddEgressDialog />
            ) : (
              <AddIngressDialog />
            )}
          </div>
        )}
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
    </div>
  );
}
