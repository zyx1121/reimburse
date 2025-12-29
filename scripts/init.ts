import { createClient } from "@supabase/supabase-js";
import type { InsertEgress, InsertIngress } from "../lib/supabase/types";

// Initialize Supabase client with service role key for admin operations
// This bypasses RLS policies, which is necessary for initialization scripts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY"
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Ingress (收入) data
const ingressData: InsertIngress[] = [
  {
    ingress_date: "2025-09-24",
    ingress_amount: 18945,
    ingress_comment: "前金庫",
    ingress_files: [""],
  },
  {
    ingress_date: "2025-11-02",
    ingress_amount: 7900,
    ingress_comment: "前金庫",
    ingress_files: [""],
  },
  {
    ingress_date: "2025-11-24",
    ingress_amount: 10523,
    ingress_comment: "前金庫",
    ingress_files: [""],
  },
  {
    ingress_date: "2025-12-01",
    ingress_amount: 4269,
    ingress_comment: "曾建超教授研究計畫討論會議誤餐費",
    ingress_files: [""],
  },
  {
    ingress_date: "2025-12-05",
    ingress_amount: 3298,
    ingress_comment: "邀請外賓出席碩士生論文口試會議餐費",
    ingress_files: [""],
  },
  {
    ingress_date: "2025-12-15",
    ingress_amount: 11375,
    ingress_comment: "實驗室會議討論之便當",
    ingress_files: [""],
  },
  {
    ingress_date: "2025-12-21",
    ingress_amount: 6,
    ingress_comment: "利息",
    ingress_files: [""],
  },
];

// Egress (支出) data
const egressData: InsertEgress[] = [
  {
    applicant_name: "詹詠翔",
    item_name: "傳統硬碟",
    item_amount: 7100,
    item_comment: null,
    invoice_date: "2025-08-18",
    invoice_files: [""],
    transfer_date: "2025-12-22",
    transfer_fee: 15,
    transfer_files: null,
    status: "approved",
  },
  {
    applicant_name: "廖洺玄",
    item_name: "開會便當",
    item_amount: 2390,
    item_comment: null,
    invoice_date: "2025-09-01",
    invoice_files: [""],
    transfer_date: "2025-09-25",
    transfer_fee: 0,
    transfer_files: null,
    status: "approved",
  },
  {
    applicant_name: "廖洺玄",
    item_name: "開會便當",
    item_amount: 2610,
    item_comment: null,
    invoice_date: "2025-09-08",
    invoice_files: [""],
    transfer_date: "2025-09-25",
    transfer_fee: 0,
    transfer_files: null,
    status: "approved",
  },
  {
    applicant_name: "廖洺玄",
    item_name: "開會便當",
    item_amount: 2740,
    item_comment: null,
    invoice_date: "2025-09-15",
    invoice_files: [""],
    transfer_date: "2025-09-25",
    transfer_fee: 0,
    transfer_files: null,
    status: "approved",
  },
  {
    applicant_name: "張永義",
    item_name: "衛生紙",
    item_amount: 279,
    item_comment: null,
    invoice_date: "2025-09-26",
    invoice_files: [""],
    transfer_date: "2025-09-26",
    transfer_fee: 0,
    transfer_files: null,
    status: "approved",
  },
  {
    applicant_name: "郭彥廷",
    item_name: "辦公用品",
    item_amount: 221,
    item_comment: null,
    invoice_date: "2025-10-03",
    invoice_files: [""],
    transfer_date: "2025-10-03",
    transfer_fee: 0,
    transfer_files: null,
    status: "approved",
  },
  {
    applicant_name: "朱健銜",
    item_name: "點心費",
    item_amount: 3934,
    item_comment: null,
    invoice_date: "2025-10-11",
    invoice_files: [""],
    transfer_date: "2025-10-13",
    transfer_fee: 0,
    transfer_files: null,
    status: "approved",
  },
  {
    applicant_name: "廖洺玄",
    item_name: "開會便當",
    item_amount: 2535,
    item_comment: null,
    invoice_date: "2025-10-13",
    invoice_files: [""],
    transfer_date: "2025-10-15",
    transfer_fee: 0,
    transfer_files: null,
    status: "approved",
  },
  {
    applicant_name: "朱健銜",
    item_name: "點心費",
    item_amount: 5376,
    item_comment: null,
    invoice_date: "2025-10-22",
    invoice_files: [""],
    transfer_date: "2025-11-24",
    transfer_fee: 15,
    transfer_files: null,
    status: "approved",
  },
  {
    applicant_name: "廖洺玄",
    item_name: "開會便當",
    item_amount: 2165,
    item_comment: null,
    invoice_date: "2025-10-27",
    invoice_files: [""],
    transfer_date: "2025-10-27",
    transfer_fee: 0,
    transfer_files: null,
    status: "approved",
  },
  {
    applicant_name: "廖洺玄",
    item_name: "開會便當",
    item_amount: 2755,
    item_comment: null,
    invoice_date: "2025-11-03",
    invoice_files: [""],
    transfer_date: "2025-11-04",
    transfer_fee: 0,
    transfer_files: null,
    status: "approved",
  },
  {
    applicant_name: "沈昱宏",
    item_name: "聚餐訂金",
    item_amount: 4000,
    item_comment: null,
    invoice_date: "2025-11-08",
    invoice_files: [""],
    transfer_date: "2025-11-08",
    transfer_fee: 0,
    transfer_files: null,
    status: "approved",
  },
  {
    applicant_name: "廖洺玄",
    item_name: "開會便當",
    item_amount: 2480,
    item_comment: null,
    invoice_date: "2025-11-10",
    invoice_files: [""],
    transfer_date: "2025-11-10",
    transfer_fee: 0,
    transfer_files: null,
    status: "approved",
  },
  {
    applicant_name: "廖洺玄",
    item_name: "開會便當",
    item_amount: 3040,
    item_comment: null,
    invoice_date: "2025-11-24",
    invoice_files: [""],
    transfer_date: "2025-11-24",
    transfer_fee: 15,
    transfer_files: null,
    status: "approved",
  },
  {
    applicant_name: "郭彥廷",
    item_name: "五金",
    item_amount: 609,
    item_comment: null,
    invoice_date: "2025-11-25",
    invoice_files: [""],
    transfer_date: "2025-12-01",
    transfer_fee: 0,
    transfer_files: null,
    status: "approved",
  },
  {
    applicant_name: "廖洺玄",
    item_name: "開會便當",
    item_amount: 2180,
    item_comment: null,
    invoice_date: "2025-12-01",
    invoice_files: [""],
    transfer_date: "2025-12-03",
    transfer_fee: 0,
    transfer_files: null,
    status: "approved",
  },
  {
    applicant_name: "郭彥廷",
    item_name: "風扇",
    item_amount: 1319,
    item_comment: null,
    invoice_date: "2025-12-05",
    invoice_files: [""],
    transfer_date: "2025-12-10",
    transfer_fee: 0,
    transfer_files: null,
    status: "approved",
  },
  {
    applicant_name: "廖洺玄",
    item_name: "開會便當",
    item_amount: 3040,
    item_comment: null,
    invoice_date: "2025-12-08",
    invoice_files: [""],
    transfer_date: "2025-12-23",
    transfer_fee: 15,
    transfer_files: null,
    status: "approved",
  },
  {
    applicant_name: "郭彥廷",
    item_name: "大掃除餐費",
    item_amount: 3047,
    item_comment: null,
    invoice_date: "2025-12-22",
    invoice_files: [""],
    transfer_date: "2025-12-23",
    transfer_fee: 15,
    transfer_files: null,
    status: "approved",
  },
];

async function initDatabase() {
  console.log("開始初始化數據庫...\n");

  try {
    // Insert ingress data
    console.log(`正在插入 ${ingressData.length} 筆收入數據...`);
    const { data: ingressResult, error: ingressError } = await supabase
      .from("ingress")
      .insert(ingressData)
      .select();

    if (ingressError) {
      throw new Error(`插入收入數據失敗: ${ingressError.message}`);
    }

    console.log(`✓ 成功插入 ${ingressResult?.length || 0} 筆收入數據\n`);

    // Insert egress data
    console.log(`正在插入 ${egressData.length} 筆支出數據...`);
    const { data: egressResult, error: egressError } = await supabase
      .from("egress")
      .insert(egressData)
      .select();

    if (egressError) {
      throw new Error(`插入支出數據失敗: ${egressError.message}`);
    }

    console.log(`✓ 成功插入 ${egressResult?.length || 0} 筆支出數據\n`);

    console.log("✓ 數據庫初始化完成！");
  } catch (error) {
    console.error("❌ 初始化失敗:", error);
    process.exit(1);
  }
}

// Run the initialization
initDatabase();
