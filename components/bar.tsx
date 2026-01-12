"use client";

import { AddEgressDialog } from "@/components/add-egress-dialog";
import { AddIngressDialog } from "@/components/add-ingress-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { isGlobalAdmin, isSystemAdmin, type Roles } from "@/lib/utils/roles";
import type { User } from "@supabase/supabase-js";
import { User as LucideUser } from "lucide-react";
import { useEffect, useState } from "react";

interface BarProps {
  activeTab: "egress" | "ingress";
  onTabChange: (tab: "egress" | "ingress") => void;
  balance: number;
}

export function Bar({ activeTab, onTabChange, balance }: BarProps) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReimburseAdmin, setIsReimburseAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const formattedBalance = new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 0,
  }).format(balance);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
    await supabase.auth.signInWithOAuth({
      provider: "keycloak",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        scopes: "openid",
      },
    });
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
          variant={balance >= 0 ? "outline" : "destructive"}
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
                    <LucideUser className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>
                {user.user_metadata?.name || user.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => supabase.auth.signOut()}>
                登出
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button
            onClick={handleLogin}
            className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="登入"
          >
            <Avatar>
              <AvatarFallback>
                <LucideUser className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </button>
        )}
      </div>
    </div>
  );
}
