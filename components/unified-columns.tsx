"use client";

import { EditEgressDialog } from "@/components/edit-egress-dialog";
import { EditIngressDialog } from "@/components/edit-ingress-dialog";
import type { Reimbursement } from "@/components/egress-columns";
import type { Ingress } from "@/components/ingress-columns";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Edit } from "lucide-react";
import { useState } from "react";

// Unified transaction type
export type Transaction =
  | ({ type: "egress" } & Reimbursement)
  | ({ type: "ingress" } & Ingress);

// Action cell component for edit button
function EditActionCell({ row }: { row: any }) {
  const [open, setOpen] = useState(false);
  const data = row.original as Transaction;

  if (data.type === "egress") {
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
        <EditEgressDialog
          open={open}
          onOpenChange={setOpen}
          data={data as Reimbursement}
        />
      </>
    );
  } else {
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
        <EditIngressDialog
          open={open}
          onOpenChange={setOpen}
          data={data as Ingress}
        />
      </>
    );
  }
}

export function getUnifiedColumns(isAdmin: boolean): ColumnDef<Transaction>[] {
  const columns: ColumnDef<Transaction>[] = [
    {
      id: "date",
      header: () => <div className="px-2">日期</div>,
      cell: ({ row }) => {
        const data = row.original as Transaction;
        const date =
          data.type === "egress"
            ? new Date(data.invoiceDate)
            : new Date(data.ingressDate);
        const formatted = date.toLocaleDateString("zh-TW", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        return <div className="px-2">{formatted}</div>;
      },
    },
    {
      id: "applicantName",
      header: () => <div className="px-2">申請人</div>,
      cell: ({ row }) => {
        const data = row.original as Transaction;
        if (data.type === "egress") {
          return <div className="px-2">{data.applicantName}</div>;
        }
        return <div className="px-2">-</div>;
      },
    },
    {
      id: "amount",
      header: () => <div className="px-2">金額</div>,
      cell: ({ row }) => {
        const data = row.original as Transaction;
        const amount =
          data.type === "egress" ? data.itemAmount : data.ingressAmount;
        const formatted = new Intl.NumberFormat("zh-TW", {
          style: "currency",
          currency: "TWD",
          minimumFractionDigits: 0,
        }).format(amount);

        return (
          <div
            className={`px-2 ${
              data.type === "egress" ? "text-red-500" : "text-green-500"
            }`}
          >
            {data.type === "egress" ? "-" : "+"}
            {formatted}
          </div>
        );
      },
    },
    {
      id: "name",
      header: () => <div className="px-2">名稱</div>,
      cell: ({ row }) => {
        const data = row.original as Transaction;
        if (data.type === "egress") {
          return <div className="px-2">{data.itemName}</div>;
        }
        return <div className="px-2">{data.ingressComment ?? "-"}</div>;
      },
    },
    {
      id: "transferFee",
      header: () => <div className="px-2">轉帳手續費</div>,
      cell: ({ row }) => {
        const data = row.original as Transaction;
        if (data.type === "egress" && data.transferFee !== null) {
          const formatted = new Intl.NumberFormat("zh-TW", {
            style: "currency",
            currency: "TWD",
            minimumFractionDigits: 0,
          }).format(data.transferFee);
          return <div className="px-2 text-red-500">-{formatted}</div>;
        }
        return <div className="px-2">-</div>;
      },
    },
    {
      id: "comment",
      header: () => <div className="px-2">備註</div>,
      cell: ({ row }) => {
        const data = row.original as Transaction;
        if (data.type === "egress") {
          return <div className="px-2">{data.itemComment ?? "-"}</div>;
        }
        return <div className="px-2">-</div>;
      },
    },
    {
      id: "transferDate",
      header: () => <div className="px-2 text-right">轉帳日期</div>,
      cell: ({ row }) => {
        const data = row.original as Transaction;
        if (data.type === "egress" && data.transferDate) {
          const date = new Date(data.transferDate);
          const formatted = date.toLocaleDateString("zh-TW", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          return <div className="px-2 text-right">{formatted}</div>;
        }
        return <div className="px-2 text-right">-</div>;
      },
    },
    // {
    //   id: "status",
    //   header: () => <div className="px-2">狀態</div>,
    //   cell: ({ row }) => {
    //     const data = row.original as Transaction;
    //     if (data.type === "egress") {
    //       const status = data.status;
    //       if (status === "pending") {
    //         return <div className="px-2">待審核</div>;
    //       } else if (status === "approved") {
    //         return <div className="px-2">已審核</div>;
    //       } else if (status === "rejected") {
    //         return <div className="px-2">已拒絕</div>;
    //       }
    //     }
    //     return <div className="px-2">-</div>;
    //   },
    // },
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
