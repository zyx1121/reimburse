import { DataView } from "@/components/data-view";
import { Reimbursement } from "@/components/egress-columns";
import { Ingress } from "@/components/ingress-columns";
import { getEgressList } from "@/lib/supabase/egress";
import { getIngressList } from "@/lib/supabase/ingress";
import { transformEgress, transformIngress } from "@/lib/supabase/transformers";

// Force dynamic rendering since we use cookies for authentication
export const dynamic = "force-dynamic";

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
    <div className="flex flex-col max-w-5xl mx-auto">
      <DataView egressData={egressData} ingressData={ingressData} />
    </div>
  );
}
