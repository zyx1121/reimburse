"use server";

import { revalidatePath } from "next/cache";
import { createEgress } from "@/lib/supabase/egress";
import { createIngress } from "@/lib/supabase/ingress";
import type { InsertEgress, InsertIngress } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/server";
import { isGlobalAdmin, isSystemAdmin, type Roles } from "@/lib/utils/roles";

async function ensureReimburseAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("請先登入後再執行此操作");
  }

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("roles, is_admin")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error("讀取用戶角色失敗");
  }

  const roles = (profile?.roles ?? null) as Roles | null;
  const isAdmin =
    isSystemAdmin(roles, "reimburse") ||
    isGlobalAdmin(roles, (profile as { is_admin?: boolean | null })?.is_admin);

  if (!isAdmin) {
    throw new Error("沒有權限執行此操作（需為 reimburse 系統 admin）");
  }
}

export async function addEgressAction(data: InsertEgress) {
  try {
    await ensureReimburseAdmin();
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
    await ensureReimburseAdmin();
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
