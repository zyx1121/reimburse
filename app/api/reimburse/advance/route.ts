import { promises as fs } from "node:fs";
import path from "node:path";

import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";

interface AdvancePayload {
  applicant_name: string;
  item_name: string;
  item_amount: number;
  item_comment: string | null;
  invoice_date: string;
  invoice_path: string;
  signature_path: string;
}

function formatDateCompact(date: string) {
  // date is expected to be yyyy-mm-dd
  const clean = date.replace(/-/g, "");
  if (clean.length === 8) return clean;
  const now = new Date();
  const y = now.getFullYear().toString();
  const m = `${now.getMonth() + 1}`.padStart(2, "0");
  const d = `${now.getDate()}`.padStart(2, "0");
  return `${y}${m}${d}`;
}

function toAscii(input: string): string {
  // Remove non-ASCII characters to avoid WinAnsi encoding errors in StandardFonts
  return input.replace(/[^\x20-\x7E]/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as AdvancePayload;
    const {
      applicant_name,
      item_name,
      item_amount,
      item_comment,
      invoice_date,
      invoice_path,
      signature_path,
    } = payload;

    if (
      !applicant_name ||
      !item_name ||
      !Number.isFinite(item_amount) ||
      !invoice_date ||
      !invoice_path ||
      !signature_path
    ) {
      return NextResponse.json(
        { message: "缺少必要欄位，請確認資料後重試" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ message: "請先登入再進行操作" }, { status: 401 });
    }

    // Load template from public
    const templatePath = path.join(process.cwd(), "public", "advance.pdf");
    const templateBytes = await fs.readFile(templatePath);

    // Download invoice PDF
    const { data: invoiceFile, error: invoiceErr } = await supabase.storage
      .from("reimburse-invoices")
      .download(invoice_path);
    if (invoiceErr || !invoiceFile) {
      return NextResponse.json(
        { message: "取得發票檔案失敗" },
        { status: 400 }
      );
    }
    const invoiceBytes = await invoiceFile.arrayBuffer();

    // Download signature PNG
    const { data: signatureFile, error: sigErr } = await supabase.storage
      .from("reimburse-signatures")
      .download(signature_path);
    if (sigErr || !signatureFile) {
      return NextResponse.json(
        { message: "取得簽名檔案失敗" },
        { status: 400 }
      );
    }
    const signatureBytes = await signatureFile.arrayBuffer();

    // Compose PDF
    const templatePdf = await PDFDocument.load(templateBytes);
    const textFont = await templatePdf.embedFont(StandardFonts.Helvetica);
    const firstPage = templatePdf.getPage(0);
    const { width, height } = firstPage.getSize();

    // Basic placements; adjust as needed to match the template
    firstPage.drawText(toAscii(applicant_name), {
      x: 90,
      y: height - 110,
      size: 12,
      font: textFont,
    });
    firstPage.drawText(toAscii(item_name), {
      x: 90,
      y: height - 170,
      size: 12,
      font: textFont,
    });
    firstPage.drawText(item_amount.toString(), {
      x: width - 150,
      y: height - 170,
      size: 12,
      font: textFont,
    });
    if (item_comment) {
      firstPage.drawText(toAscii(item_comment), {
        x: 90,
        y: height - 200,
        size: 10,
        font: textFont,
        maxWidth: width - 180,
        lineHeight: 12,
      });
    }
    firstPage.drawText(invoice_date, {
      x: width - 180,
      y: height - 110,
      size: 12,
      font: textFont,
    });

    // Add signature image
    const sigImage = await templatePdf.embedPng(signatureBytes);
    const sigWidth = 180;
    const sigHeight = 60;
    firstPage.drawImage(sigImage, {
      x: width - sigWidth - 80,
      y: 80,
      width: sigWidth,
      height: sigHeight,
    });

    // Append invoice pages at the end
    const invoicePdf = await PDFDocument.load(invoiceBytes);
    const copiedPages = await templatePdf.copyPages(
      invoicePdf,
      invoicePdf.getPageIndices()
    );
    copiedPages.forEach((p) => templatePdf.addPage(p));

    const finalBytes = await templatePdf.save();

    // Upload to advances bucket
    const safeName = applicant_name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, "");
    const datePart = formatDateCompact(invoice_date);
    const outputPath = `${user.id}/advance_${safeName || "user"}_${datePart}.pdf`;

    const { error: uploadErr } = await supabase.storage
      .from("reimburse-advances")
      .upload(outputPath, finalBytes, {
        cacheControl: "3600",
        upsert: true,
        contentType: "application/pdf",
      });

    if (uploadErr) {
      return NextResponse.json(
        { message: "上傳合成後 PDF 失敗" },
        { status: 500 }
      );
    }

    return NextResponse.json({ path: outputPath }, { status: 200 });
  } catch (error) {
    console.error("Failed to generate advance pdf:", error);
    return NextResponse.json(
      { message: "產生報帳 PDF 失敗，請稍後再試" },
      { status: 500 }
    );
  }
}

