"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { EditIngressDialog } from "@/components/edit-ingress-dialog";
import { useState } from "react";

export type Ingress = {
  id: string;
  ingressDate: string;
  ingressAmount: number;
  ingressComment: string | null;
  ingressFiles: string[];
};

// Action cell component for edit button
function EditActionCell({ row }: { row: any }) {
  const [open, setOpen] = useState(false);
  const data = row.original as Ingress;

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
      <EditIngressDialog open={open} onOpenChange={setOpen} data={data} />
    </>
  );
}

export function getIngressColumns(isAdmin: boolean): ColumnDef<Ingress>[] {
  const columns: ColumnDef<Ingress>[] = [
    {
      accessorKey: "ingressDate",
      header: () => <div className="px-2">日期</div>,
      cell: ({ row }) => {
        const date = new Date(row.getValue("ingressDate"));
        const formatted = date.toLocaleDateString("zh-TW", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        });
        return <div className="px-2">{formatted}</div>;
      },
    },
    {
      accessorKey: "ingressAmount",
      header: () => <div className="px-2">金額</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("ingressAmount"));
        const formatted = new Intl.NumberFormat("zh-TW", {
          style: "currency",
          currency: "TWD",
          minimumFractionDigits: 0,
        }).format(amount);
        return <div className="px-2">{formatted}</div>;
      },
    },
    {
      accessorKey: "ingressComment",
      header: () => <div className="px-2">備註</div>,
      cell: ({ row }) => {
        return (
          <div className="px-2">{row.getValue("ingressComment") ?? "-"}</div>
        );
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
export const columns: ColumnDef<Ingress>[] = getIngressColumns(false);
