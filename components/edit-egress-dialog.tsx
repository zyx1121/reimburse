"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateEgressAction } from "@/app/actions";
import type { Reimbursement } from "@/components/egress-columns";

interface EditEgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Reimbursement;
}

export function EditEgressDialog({
  open,
  onOpenChange,
  data,
}: EditEgressDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    applicant_name: data.applicantName,
    item_name: data.itemName,
    item_amount: data.itemAmount.toString(),
    item_comment: data.itemComment || "",
    invoice_date: data.invoiceDate,
    invoice_files: data.invoiceFiles.join(", "),
    transfer_date: data.transferDate || "",
    transfer_fee: data.transferFee?.toString() || "",
    status: data.status,
  });

  // Update form data when data changes
  useEffect(() => {
    setFormData({
      applicant_name: data.applicantName,
      item_name: data.itemName,
      item_amount: data.itemAmount.toString(),
      item_comment: data.itemComment || "",
      invoice_date: data.invoiceDate,
      invoice_files: data.invoiceFiles.join(", "),
      transfer_date: data.transferDate || "",
      transfer_fee: data.transferFee?.toString() || "",
      status: data.status,
    });
  }, [data]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateEgressAction(data.id, {
        applicant_name: formData.applicant_name,
        item_name: formData.item_name,
        item_amount: parseFloat(formData.item_amount),
        item_comment: formData.item_comment || null,
        invoice_date: formData.invoice_date,
        invoice_files: formData.invoice_files
          ? formData.invoice_files.split(",").map((f) => f.trim())
          : [],
        transfer_date: formData.transfer_date || null,
        transfer_fee: formData.transfer_fee
          ? parseFloat(formData.transfer_fee)
          : null,
        status: formData.status,
      });

      if (result.success) {
        onOpenChange(false);
        router.refresh();
      } else {
        alert(`更新失敗: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating egress:", error);
      alert("更新失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>編輯支出記錄</DialogTitle>
            <DialogDescription>請修改以下資訊</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-applicant_name">
                  申請人 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-applicant_name"
                  value={formData.applicant_name}
                  onChange={(e) =>
                    setFormData({ ...formData, applicant_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-item_name">
                  項目名稱 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-item_name"
                  value={formData.item_name}
                  onChange={(e) =>
                    setFormData({ ...formData, item_name: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-item_amount">
                  金額 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-item_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.item_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, item_amount: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-invoice_date">
                  發票日期 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-invoice_date"
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) =>
                    setFormData({ ...formData, invoice_date: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-item_comment">備註</Label>
              <Textarea
                id="edit-item_comment"
                value={formData.item_comment}
                onChange={(e) =>
                  setFormData({ ...formData, item_comment: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-transfer_date">轉帳日期</Label>
                <Input
                  id="edit-transfer_date"
                  type="date"
                  value={formData.transfer_date}
                  onChange={(e) =>
                    setFormData({ ...formData, transfer_date: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-transfer_fee">轉帳手續費</Label>
                <Input
                  id="edit-transfer_fee"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.transfer_fee}
                  onChange={(e) =>
                    setFormData({ ...formData, transfer_fee: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">狀態</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as "pending" | "approved" | "rejected",
                  })
                }
              >
                <SelectTrigger id="edit-status" className="w-full">
                  <SelectValue placeholder="選擇狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">待審核</SelectItem>
                  <SelectItem value="approved">已審核</SelectItem>
                  <SelectItem value="rejected">已拒絕</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

