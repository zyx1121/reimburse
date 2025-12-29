"use client";

import { ColumnDef } from "@tanstack/react-table";

export type Ingress = {
  id: string;
  ingressDate: string;
  ingressAmount: number;
  ingressComment: string | null;
  ingressFiles: string[];
};

export const columns: ColumnDef<Ingress>[] = [
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
