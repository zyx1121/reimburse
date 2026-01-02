"use client";

import { useState, useEffect } from "react";
import { Bar } from "@/components/bar";
import { getEgressColumns, Reimbursement } from "@/components/egress-columns";
import { EgressTable } from "@/components/egress-table";
import { EgressChart } from "@/components/egress-chart";
import { Ingress, getIngressColumns } from "@/components/ingress-columns";
import { IngressTable } from "@/components/ingress-table";
import { IngressChart } from "@/components/ingress-chart";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/use-auth";
import { isGlobalAdmin, isSystemAdmin, type Roles } from "@/lib/utils/roles";

interface DataViewProps {
  egressData: Reimbursement[];
  ingressData: Ingress[];
}

export function DataView({ egressData, ingressData }: DataViewProps) {
  const [activeTab, setActiveTab] = useState<"egress" | "ingress">("egress");
  const [isReimburseAdmin, setIsReimburseAdmin] = useState(false);
  const { user } = useAuth();
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

  // Calculate balance: ingressAmount sum - (itemAmount + transferFee) sum
  const totalIngress = ingressData.reduce(
    (sum, item) => sum + item.ingressAmount,
    0
  );
  const totalEgress = egressData.reduce(
    (sum, item) => sum + item.itemAmount + (item.transferFee || 0),
    0
  );
  const balance = totalIngress - totalEgress;

  return (
    <div className="flex flex-col h-full w-full gap-4 py-4">
      <div className="w-full h-8 px-4 shrink-0">
        <Bar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          balance={balance}
        />
      </div>
      <div className="w-full h-64 px-4 shrink-0">
        {activeTab === "egress" ? (
          <EgressChart data={egressData} />
        ) : (
          <IngressChart data={ingressData} />
        )}
      </div>
      <main className="w-full px-4 flex-1 min-h-0 overflow-hidden">
        {activeTab === "egress" ? (
          <EgressTable
            columns={getEgressColumns(isReimburseAdmin)}
            data={egressData}
          />
        ) : (
          <IngressTable
            columns={getIngressColumns(isReimburseAdmin)}
            data={ingressData}
          />
        )}
      </main>
    </div>
  );
}
