"use server";

import { revalidatePath } from "next/cache";
import { createEgress } from "@/lib/supabase/egress";
import { createIngress } from "@/lib/supabase/ingress";
import type { InsertEgress, InsertIngress } from "@/lib/supabase/types";

export async function addEgressAction(data: InsertEgress) {
  try {
    await createEgress(data);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to create egress:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知錯誤",
    };
  }
}

export async function addIngressAction(data: InsertIngress) {
  try {
    await createIngress(data);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to create ingress:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知錯誤",
    };
  }
}

