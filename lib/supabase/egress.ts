import { createClient } from "./server";
import type { DatabaseEgress, InsertEgress, UpdateEgress } from "./types";

export async function getEgressList() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("egress")
    .select("*")
    .order("invoice_date", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch egress: ${error.message}`);
  }

  return data as DatabaseEgress[];
}

export async function getEgressById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("egress")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch egress: ${error.message}`);
  }

  return data as DatabaseEgress;
}

export async function createEgress(egress: InsertEgress) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("egress")
    .insert({
      ...egress,
      user_id: user?.id || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create egress: ${error.message}`);
  }

  return data as DatabaseEgress;
}

export async function updateEgress(id: string, updates: UpdateEgress) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("egress")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update egress: ${error.message}`);
  }

  return data as DatabaseEgress;
}

export async function deleteEgress(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("egress").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete egress: ${error.message}`);
  }
}

