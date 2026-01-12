"use client";

import { AddEgressDialog } from "@/components/add-egress-dialog";
import { AddIngressDialog } from "@/components/add-ingress-dialog";
import type { Reimbursement } from "@/components/egress-columns";
import type { Ingress } from "@/components/ingress-columns";
import { Badge } from "@/components/ui/badge";
import { UnifiedChart } from "@/components/unified-chart";
import {
  getUnifiedColumns,
  type Transaction,
} from "@/components/unified-columns";
import { UnifiedTable } from "@/components/unified-table";
import { useAuth } from "@/lib/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { isGlobalAdmin, isSystemAdmin, type Roles } from "@/lib/utils/roles";
import { useEffect, useState } from "react";

interface DataViewProps {
  egressData: Reimbursement[];
  ingressData: Ingress[];
}

export function DataView({ egressData, ingressData }: DataViewProps) {
  const [isReimburseAdmin, setIsReimburseAdmin] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  // Combine data into unified transactions
  const transactions: Transaction[] = [
    ...egressData.map((item) => ({ type: "egress" as const, ...item })),
    ...ingressData.map((item) => ({ type: "ingress" as const, ...item })),
  ].sort((a, b) => {
    const dateA =
      a.type === "egress" ? new Date(a.invoiceDate) : new Date(a.ingressDate);
    const dateB =
      b.type === "egress" ? new Date(b.invoiceDate) : new Date(b.ingressDate);
    return dateB.getTime() - dateA.getTime(); // Sort by date descending
  });

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
      } catch (error) {
        console.error("Error checking admin status:", error);
        if (!cancelled) setIsReimburseAdmin(false);
      }
    }

    void checkAdmin();

    return () => {
      cancelled = true;
    };
  }, [supabase, user]);

  const totalIngress = ingressData.reduce(
    (sum, item) => sum + item.ingressAmount,
    0
  );
  const totalEgress = egressData.reduce(
    (sum, item) => sum + item.itemAmount + (item.transferFee || 0),
    0
  );
  const balance = totalIngress - totalEgress;

  const formattedBalance = new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 0,
  }).format(balance);

  return (
    <div className="flex flex-col h-full w-full gap-4 py-4">
      <div className="w-full px-4 flex items-center justify-between">
        <Badge
          variant={balance >= 0 ? "outline" : "destructive"}
          className="text-md bg-background/70 backdrop-blur-sm hover:scale-105 transition-all duration-200"
        >
          {formattedBalance}
        </Badge>
        <div className="flex gap-4">
          {user && isReimburseAdmin && (
            <>
              <AddEgressDialog />
              <AddIngressDialog />
            </>
          )}
        </div>
      </div>
      <div className="w-full h-64 px-4 shrink-0">
        <UnifiedChart data={transactions} />
      </div>
      <main className="w-full px-4 flex-1 min-h-0 overflow-hidden">
        <UnifiedTable
          columns={getUnifiedColumns(isReimburseAdmin)}
          data={transactions}
        />
      </main>
    </div>
  );
}
