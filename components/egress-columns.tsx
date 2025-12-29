"use client";

import { ColumnDef } from "@tanstack/react-table";

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

export const EgressColumns: ColumnDef<Reimbursement>[] = [
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
