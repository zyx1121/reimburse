"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { EditEgressDialog } from "@/components/edit-egress-dialog";
import { useState } from "react";

export type Reimbursement = {
  id: string;
  applicantName: string;
  itemName: string;
  itemAmount: number;
  itemComment: string | null;
  invoiceDate: string;
  invoiceFiles: string[];
  transferDate: string | null;
  transferFee: number | null;
  transferFiles: string[] | null;
  status: "pending" | "approved" | "rejected";
};

// Action cell component for edit button
function EditActionCell({ row }: { row: any }) {
  const [open, setOpen] = useState(false);
  const data = row.original as Reimbursement;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="h-8 w-8"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <EditEgressDialog open={open} onOpenChange={setOpen} data={data} />
    </>
  );
}

export function getEgressColumns(isAdmin: boolean): ColumnDef<Reimbursement>[] {
  const columns: ColumnDef<Reimbursement>[] = [
    {
      accessorKey: "applicantName",
      header: () => <div className="px-2">申請人</div>,
      cell: ({ row }) => {
        return <div className="px-2">{row.getValue("applicantName")}</div>;
      },
    },
    {
      accessorKey: "itemName",
      header: () => <div className="px-2">名稱</div>,
      cell: ({ row }) => {
        return <div className="px-2">{row.getValue("itemName")}</div>;
      },
    },
    {
      accessorKey: "itemAmount",
      header: () => <div className="px-2">金額</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("itemAmount"));
        const formatted = new Intl.NumberFormat("zh-TW", {
          style: "currency",
          currency: "TWD",
          minimumFractionDigits: 0,
        }).format(amount);

        return <div className="px-2">{formatted}</div>;
      },
    },
    {
      accessorKey: "itemComment",
      header: () => <div className="px-2">備註</div>,
      cell: ({ row }) => {
        return <div className="px-2">{row.getValue("itemComment") ?? "-"}</div>;
      },
    },
    {
      accessorKey: "invoiceDate",
      header: () => <div className="px-2">發票日期</div>,
      cell: ({ row }) => {
        const date = new Date(row.getValue("invoiceDate"));
        const formatted = date.toLocaleDateString("zh-TW", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        });
        return <div className="px-2">{formatted}</div>;
      },
    },
    {
      accessorKey: "transferDate",
      header: () => <div className="px-2">轉帳日期</div>,
      cell: ({ row }) => {
        const date = row.getValue("transferDate")
          ? new Date(row.getValue("transferDate"))
          : null;
        const formatted = date
          ? date.toLocaleDateString("zh-TW", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
            })
          : null;
        return <div className="px-2">{formatted ? formatted : "-"}</div>;
      },
    },
    {
      accessorKey: "transferFee",
      header: () => <div className="px-2">轉帳手續費</div>,
      cell: ({ row }) => {
        const fee = row.getValue("transferFee");
        if (fee === null) {
          return <div className="px-2">-</div>;
        }
        const formatted = new Intl.NumberFormat("zh-TW", {
          style: "currency",
          currency: "TWD",
          minimumFractionDigits: 0,
        }).format(fee as number);
        return <div className="px-2">{formatted}</div>;
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="px-2">狀態</div>,
      cell: ({ row }) => {
        const status = row.getValue("status");
        if (status === "pending") {
          return <div className="px-2">待審核</div>;
        } else if (status === "approved") {
          return <div className="px-2">已審核</div>;
        } else if (status === "rejected") {
          return <div className="px-2">已拒絕</div>;
        }
      },
    },
  ];

  // Add edit button column if user is admin
  if (isAdmin) {
    columns.push({
      id: "actions",
      header: () => <div className="px-2">操作</div>,
      cell: ({ row }) => {
        return (
          <div className="px-2">
            <EditActionCell row={row} />
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    });
  }

  return columns;
}

// Default export for backward compatibility (without edit button)
export const EgressColumns: ColumnDef<Reimbursement>[] =
  getEgressColumns(false);
