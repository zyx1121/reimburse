// Transformers to convert between database types and application types

import type { DatabaseEgress, DatabaseIngress } from "./types";
import type { Reimbursement } from "@/components/egress-columns";
import type { Ingress } from "@/components/ingress-columns";

/**
 * Transform database egress to application Reimbursement type
 */
export function transformEgress(dbEgress: DatabaseEgress): Reimbursement {
  return {
    id: dbEgress.id,
    applicantName: dbEgress.applicant_name,
    itemName: dbEgress.item_name,
    itemAmount: Number(dbEgress.item_amount),
    itemComment: dbEgress.item_comment,
    invoiceDate: dbEgress.invoice_date,
    invoiceFiles: dbEgress.invoice_files || [],
    transferDate: dbEgress.transfer_date,
    transferFee: dbEgress.transfer_fee ? Number(dbEgress.transfer_fee) : null,
    transferFiles: dbEgress.transfer_files && dbEgress.transfer_files.length > 0 ? dbEgress.transfer_files : null,
    status: dbEgress.status,
  };
}

/**
 * Transform application Reimbursement to database egress format
 */
export function transformEgressToDb(
  reimbursement: Partial<Reimbursement>
): Partial<DatabaseEgress> {
  const dbEgress: Partial<DatabaseEgress> = {};

  if (reimbursement.applicantName !== undefined) {
    dbEgress.applicant_name = reimbursement.applicantName;
  }
  if (reimbursement.itemName !== undefined) {
    dbEgress.item_name = reimbursement.itemName;
  }
  if (reimbursement.itemAmount !== undefined) {
    dbEgress.item_amount = reimbursement.itemAmount;
  }
  if (reimbursement.itemComment !== undefined) {
    dbEgress.item_comment = reimbursement.itemComment;
  }
  if (reimbursement.invoiceDate !== undefined) {
    dbEgress.invoice_date = reimbursement.invoiceDate;
  }
  if (reimbursement.invoiceFiles !== undefined) {
    dbEgress.invoice_files = reimbursement.invoiceFiles;
  }
  if (reimbursement.transferDate !== undefined) {
    dbEgress.transfer_date = reimbursement.transferDate;
  }
  if (reimbursement.transferFee !== undefined) {
    dbEgress.transfer_fee = reimbursement.transferFee;
  }
  if (reimbursement.transferFiles !== undefined) {
    dbEgress.transfer_files = reimbursement.transferFiles;
  }
  if (reimbursement.status !== undefined) {
    dbEgress.status = reimbursement.status;
  }

  return dbEgress;
}

/**
 * Transform database ingress to application Ingress type
 */
export function transformIngress(dbIngress: DatabaseIngress): Ingress {
  return {
    id: dbIngress.id,
    ingressDate: dbIngress.ingress_date,
    ingressAmount: Number(dbIngress.ingress_amount),
    ingressComment: dbIngress.ingress_comment,
    ingressFiles: dbIngress.ingress_files,
  };
}

/**
 * Transform application Ingress to database ingress format
 */
export function transformIngressToDb(
  ingress: Partial<Ingress>
): Partial<DatabaseIngress> {
  const dbIngress: Partial<DatabaseIngress> = {};

  if (ingress.ingressDate !== undefined) {
    dbIngress.ingress_date = ingress.ingressDate;
  }
  if (ingress.ingressAmount !== undefined) {
    dbIngress.ingress_amount = ingress.ingressAmount;
  }
  if (ingress.ingressComment !== undefined) {
    dbIngress.ingress_comment = ingress.ingressComment;
  }
  if (ingress.ingressFiles !== undefined) {
    dbIngress.ingress_files = ingress.ingressFiles;
  }

  return dbIngress;
}

