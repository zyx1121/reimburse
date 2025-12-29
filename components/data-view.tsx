"use client";

import { useState } from "react";
import { Bar } from "@/components/bar";
import { EgressColumns, Reimbursement } from "@/components/egress-columns";
import { EgressTable } from "@/components/egress-table";
import { EgressChart } from "@/components/egress-chart";
import { Ingress, columns as IngressColumns } from "@/components/ingress-columns";
import { IngressTable } from "@/components/ingress-table";
import { IngressChart } from "@/components/ingress-chart";

interface DataViewProps {
  egressData: Reimbursement[];
  ingressData: Ingress[];
}

export function DataView({ egressData, ingressData }: DataViewProps) {
  const [activeTab, setActiveTab] = useState<"egress" | "ingress">("egress");

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
        <Bar activeTab={activeTab} onTabChange={setActiveTab} balance={balance} />
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
          <EgressTable columns={EgressColumns} data={egressData} />
        ) : (
          <IngressTable columns={IngressColumns} data={ingressData} />
        )}
      </main>
    </div>
  );
}

