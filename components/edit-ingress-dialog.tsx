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
import { updateIngressAction } from "@/app/actions";
import type { Ingress } from "@/components/ingress-columns";

interface EditIngressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Ingress;
}

export function EditIngressDialog({
  open,
  onOpenChange,
  data,
}: EditIngressDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ingress_date: data.ingressDate,
    ingress_amount: data.ingressAmount.toString(),
    ingress_comment: data.ingressComment || "",
    ingress_files: data.ingressFiles.join(", "),
  });

  // Update form data when data changes
  useEffect(() => {
    setFormData({
      ingress_date: data.ingressDate,
      ingress_amount: data.ingressAmount.toString(),
      ingress_comment: data.ingressComment || "",
      ingress_files: data.ingressFiles.join(", "),
    });
  }, [data]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateIngressAction(data.id, {
        ingress_date: formData.ingress_date,
        ingress_amount: parseFloat(formData.ingress_amount),
        ingress_comment: formData.ingress_comment || null,
        ingress_files: formData.ingress_files
          ? formData.ingress_files.split(",").map((f) => f.trim())
          : [],
      });

      if (result.success) {
        onOpenChange(false);
        router.refresh();
      } else {
        alert(`更新失敗: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating ingress:", error);
      alert("更新失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>編輯收入記錄</DialogTitle>
            <DialogDescription>請修改以下資訊</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-ingress_date">
                  日期 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-ingress_date"
                  type="date"
                  value={formData.ingress_date}
                  onChange={(e) =>
                    setFormData({ ...formData, ingress_date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-ingress_amount">
                  金額 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-ingress_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.ingress_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, ingress_amount: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-ingress_comment">備註</Label>
              <Textarea
                id="edit-ingress_comment"
                value={formData.ingress_comment}
                onChange={(e) =>
                  setFormData({ ...formData, ingress_comment: e.target.value })
                }
                rows={3}
              />
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

