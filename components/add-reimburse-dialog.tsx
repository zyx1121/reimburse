import { useEffect, useRef, useState } from "react";

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
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { Upload } from "lucide-react";

interface ReimburseFormData {
  applicant_name: string;
  item_name: string;
  item_amount: string;
  item_comment: string;
  invoice_date: string;
}

export function AddReimburseDialog() {
  const supabase = createClient();
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ReimburseFormData>({
    applicant_name: "",
    item_name: "",
    item_amount: "",
    item_comment: "",
    invoice_date: "",
  });
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoicePath, setInvoicePath] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const [signaturePath, setSignaturePath] = useState<string | null>(null);
  const [loadingSignature, setLoadingSignature] = useState(false);

  const fillCanvasWhite = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#f8fafc"; // light background for better contrast
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  };

  // Load existing signature for current user if any
  useEffect(() => {
    const loadSignature = async () => {
      if (!user) return;
      setLoadingSignature(true);
      try {
        const path = `signatures/${user.id}.png`;
        const { data, error } = await supabase.storage
          .from("reimburse-signatures")
          .createSignedUrl(path, 60);

        if (!error && data?.signedUrl) {
          setSignaturePath(path);
          const res = await fetch(data.signedUrl);
          const blob = await res.blob();
          const img = new Image();
          img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            fillCanvasWhite();
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = URL.createObjectURL(blob);
        }
      } catch (err) {
        console.error("Failed to load signature:", err);
      } finally {
        setLoadingSignature(false);
      }
    };

    if (open) {
      // Ensure canvas has a light background when opened
      fillCanvasWhite();
      loadSignature();
    }
  }, [open, supabase, user]);

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    return { canvas, x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    if (!point) return;
    const ctx = point.canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    isDrawingRef.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const point = getCanvasPoint(e);
    if (!point) return;
    const ctx = point.canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    fillCanvasWhite();
    setSignaturePath(null);
  };

  const uploadInvoice = async () => {
    if (!user) {
      alert("請先登入再上傳發票");
      return null;
    }
    if (!invoiceFile) {
      alert("請先選擇要上傳的 PDF 電子發票");
      return null;
    }

    const ext = invoiceFile.name.split(".").pop() || "pdf";
    const fileName = `${Date.now()}.${ext}`;
    const path = `${user.id}/invoices/${fileName}`;

    const { error } = await supabase.storage
      .from("reimburse-invoices")
      .upload(path, invoiceFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: "application/pdf",
      });

    if (error) {
      console.error("Upload invoice failed:", error);
      alert("上傳發票失敗，請稍後再試");
      return null;
    }

    setInvoicePath(path);
    return path;
  };

  const uploadSignature = async () => {
    if (!user) {
      alert("請先登入再簽名");
      return null;
    }
    const canvas = canvasRef.current;
    if (!canvas) {
      alert("簽名畫布尚未就緒");
      return null;
    }

    const dataUrl = canvas.toDataURL("image/png");
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const path = `signatures/${user.id}.png`;

    const { error } = await supabase.storage
      .from("reimburse-signatures")
      .upload(path, blob, {
        cacheControl: "3600",
        upsert: true,
        contentType: "image/png",
      });

    if (error) {
      console.error("Upload signature failed:", error);
      alert("上傳簽名失敗，請稍後再試");
      return null;
    }

    setSignaturePath(path);
    return path;
  };

  const handleConfirm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      alert("請先登入再上傳報帳");
      return;
    }

    setLoading(true);
    try {
      const [invoiceStoragePath, signatureStoragePath] = await Promise.all([
        invoicePath ? Promise.resolve(invoicePath) : uploadInvoice(),
        signaturePath ? Promise.resolve(signaturePath) : uploadSignature(),
      ]);

      if (!invoiceStoragePath || !signatureStoragePath) {
        setLoading(false);
        return;
      }

      const res = await fetch("/api/reimburse/advance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicant_name: formData.applicant_name,
          item_name: formData.item_name,
          item_amount: parseFloat(formData.item_amount),
          item_comment: formData.item_comment || null,
          invoice_date: formData.invoice_date,
          invoice_path: invoiceStoragePath,
          signature_path: signatureStoragePath,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg =
          (data && typeof data.message === "string" && data.message) ||
          "產生報帳 PDF 失敗，請稍後再試";
        alert(msg);
        setLoading(false);
        return;
      }

      alert("已成功產生並上傳報帳 PDF");
      setOpen(false);
      setFormData({
        applicant_name: "",
        item_name: "",
        item_amount: "",
        item_comment: "",
        invoice_date: "",
      });
      setInvoiceFile(null);
      setInvoicePath(null);
    } catch (err) {
      console.error("Failed to submit reimburse:", err);
      alert("上傳報帳失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload />
          上傳報帳
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleConfirm} className="space-y-4">
          <DialogHeader>
            <DialogTitle>上傳報帳</DialogTitle>
            <DialogDescription>
              上傳 PDF 電子發票，並於下方框框簽名，系統會自動產生支出證明單 PDF
              並儲存。
            </DialogDescription>
          </DialogHeader>

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
                支出事由 <span className="text-red-500">*</span>
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
                min="0"
                step="1"
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
              placeholder="可填寫不能取得單據原因等說明"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="invoice_file">
              電子發票（PDF） <span className="text-red-500">*</span>
            </Label>
            <Input
              id="invoice_file"
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setInvoiceFile(file);
                setInvoicePath(null);
              }}
              required={!invoiceFile}
            />
            {invoicePath && (
              <p className="text-xs text-muted-foreground">
                已上傳檔案路徑：{invoicePath}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>簽名</Label>
            <div className="border rounded-md p-2 bg-muted/40">
              <canvas
                ref={canvasRef}
                width={500}
                height={200}
                className="w-full h-40 bg-white rounded-sm cursor-crosshair border"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {loadingSignature
                    ? "載入簽名中..."
                    : signaturePath
                    ? "已載入先前簽名，如需重簽可清除後重新簽名。"
                    : "請在上方框框內使用滑鼠簽名，簽名會自動保存供下次使用。"}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearSignature}
                >
                  清除簽名
                </Button>
              </div>
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
              {loading ? "處理中..." : "確認產生報帳 PDF"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
