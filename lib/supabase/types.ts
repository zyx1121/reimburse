// Database types for Supabase tables

export type EgressStatus = "pending" | "approved" | "rejected";

export interface DatabaseEgress {
  id: string;
  applicant_name: string;
  item_name: string;
  item_amount: number;
  item_comment: string | null;
  invoice_date: string;
  invoice_files: string[];
  transfer_date: string | null;
  transfer_fee: number | null;
  transfer_files: string[] | null;
  status: EgressStatus;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseIngress {
  id: string;
  ingress_date: string;
  ingress_amount: number;
  ingress_comment: string | null;
  ingress_files: string[];
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

// Insert types (without auto-generated fields)
export interface InsertEgress {
  applicant_name: string;
  item_name: string;
  item_amount: number;
  item_comment?: string | null;
  invoice_date: string;
  invoice_files?: string[];
  transfer_date?: string | null;
  transfer_fee?: number | null;
  transfer_files?: string[] | null;
  status?: EgressStatus;
  user_id?: string | null;
}

export interface InsertIngress {
  ingress_date: string;
  ingress_amount: number;
  ingress_comment?: string | null;
  ingress_files?: string[];
  user_id?: string | null;
}

// Update types (all fields optional except id)
export interface UpdateEgress {
  applicant_name?: string;
  item_name?: string;
  item_amount?: number;
  item_comment?: string | null;
  invoice_date?: string;
  invoice_files?: string[];
  transfer_date?: string | null;
  transfer_fee?: number | null;
  transfer_files?: string[] | null;
  status?: EgressStatus;
}

export interface UpdateIngress {
  ingress_date?: string;
  ingress_amount?: number;
  ingress_comment?: string | null;
  ingress_files?: string[];
}

