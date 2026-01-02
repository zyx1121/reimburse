"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { addEgressAction } from "@/app/actions";
import { Plus } from "lucide-react";

export function AddEgressDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    applicant_name: "",
    item_name: "",
    item_amount: "",
    item_comment: "",
    invoice_date: "",
    invoice_files: "",
    transfer_date: "",
    transfer_fee: "",
    status: "pending" as "pending" | "approved" | "rejected",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await addEgressAction({
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
        setOpen(false);
        // Reset form
        setFormData({
          applicant_name: "",
          item_name: "",
          item_amount: "",
          item_comment: "",
          invoice_date: "",
          invoice_files: "",
          transfer_date: "",
          transfer_fee: "",
          status: "pending",
        });
        router.refresh();
      } else {
        alert(`新增失敗: ${result.error}`);
      }
    } catch (error) {
      console.error("Error adding egress:", error);
      alert("新增失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <Plus className="h-4 w-4 mr-2" />
          新增支出
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>新增支出記錄</DialogTitle>
            <DialogDescription>請填寫以下資訊以新增支出記錄</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="applicant_name">
                  申請人 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="applicant_name"
                  value={formData.applicant_name}
                  onChange={(e) =>
                    setFormData({ ...formData, applicant_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item_name">
                  項目名稱 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="item_name"
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
                <Label htmlFor="item_amount">
                  金額 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="item_amount"
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
                <Label htmlFor="invoice_date">
                  發票日期 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="invoice_date"
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
              <Label htmlFor="item_comment">備註</Label>
              <Textarea
                id="item_comment"
                value={formData.item_comment}
                onChange={(e) =>
                  setFormData({ ...formData, item_comment: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="transfer_date">轉帳日期</Label>
                <Input
                  id="transfer_date"
                  type="date"
                  value={formData.transfer_date}
                  onChange={(e) =>
                    setFormData({ ...formData, transfer_date: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="transfer_fee">轉帳手續費</Label>
                <Input
                  id="transfer_fee"
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
            {/* <div className="grid gap-2">
              <Label htmlFor="invoice_files">發票檔案（以逗號分隔）</Label>
              <Input
                id="invoice_files"
                value={formData.invoice_files}
                onChange={(e) =>
                  setFormData({ ...formData, invoice_files: e.target.value })
                }
                placeholder="例如: file1.jpg, file2.pdf"
              />
            </div> */}
            <div className="grid gap-2">
              <Label htmlFor="status">狀態</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as "pending" | "approved" | "rejected",
                  })
                }
              >
                <SelectTrigger id="status" className="w-full">
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
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "新增中..." : "新增"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
