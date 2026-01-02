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
import { addIngressAction } from "@/app/actions";
import { Plus } from "lucide-react";

export function AddIngressDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ingress_date: "",
    ingress_amount: "",
    ingress_comment: "",
    ingress_files: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await addIngressAction({
        ingress_date: formData.ingress_date,
        ingress_amount: parseFloat(formData.ingress_amount),
        ingress_comment: formData.ingress_comment || null,
        ingress_files: formData.ingress_files
          ? formData.ingress_files.split(",").map((f) => f.trim())
          : [],
      });

      if (result.success) {
        setOpen(false);
        // Reset form
        setFormData({
          ingress_date: "",
          ingress_amount: "",
          ingress_comment: "",
          ingress_files: "",
        });
        router.refresh();
      } else {
        alert(`新增失敗: ${result.error}`);
      }
    } catch (error) {
      console.error("Error adding ingress:", error);
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
          新增收入
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>新增收入記錄</DialogTitle>
            <DialogDescription>請填寫以下資訊以新增收入記錄</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ingress_date">
                  日期 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ingress_date"
                  type="date"
                  value={formData.ingress_date}
                  onChange={(e) =>
                    setFormData({ ...formData, ingress_date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ingress_amount">
                  金額 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ingress_amount"
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
              <Label htmlFor="ingress_comment">備註</Label>
              <Textarea
                id="ingress_comment"
                value={formData.ingress_comment}
                onChange={(e) =>
                  setFormData({ ...formData, ingress_comment: e.target.value })
                }
                rows={3}
              />
            </div>
            {/* <div className="grid gap-2">
              <Label htmlFor="ingress_files">相關檔案（以逗號分隔）</Label>
              <Input
                id="ingress_files"
                value={formData.ingress_files}
                onChange={(e) =>
                  setFormData({ ...formData, ingress_files: e.target.value })
                }
                placeholder="例如: file1.jpg, file2.pdf"
              />
            </div> */}
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
