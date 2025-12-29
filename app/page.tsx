import { Reimbursement } from "@/components/egress-columns";
import { Ingress } from "@/components/ingress-columns";
import { DataView } from "@/components/data-view";
import { getIngressList } from "@/lib/supabase/ingress";
import { getEgressList } from "@/lib/supabase/egress";
import { transformIngress } from "@/lib/supabase/transformers";
import { transformEgress } from "@/lib/supabase/transformers";

async function getIngressData(): Promise<Ingress[]> {
  try {
    const dbIngress = await getIngressList();
    console.log(`Fetched ${dbIngress.length} ingress records`);
    return dbIngress.map(transformIngress);
  } catch (error) {
    console.error("Failed to fetch ingress data:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    return [];
  }
}

async function getData(): Promise<Reimbursement[]> {
  try {
    const dbEgress = await getEgressList();
    console.log(`Fetched ${dbEgress.length} egress records`);
    return dbEgress.map(transformEgress);
  } catch (error) {
    console.error("Failed to fetch egress data:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    return [];
  }
}

export default async function Main() {
  const egressData = await getData();
  const ingressData = await getIngressData();
  return (
    <div className="h-dvh w-dvw flex flex-col">
      <DataView egressData={egressData} ingressData={ingressData} />
    </div>
  );
}
