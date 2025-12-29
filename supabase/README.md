# Supabase 數據庫設計

## 表結構

### 1. Egress (支出) 表

用於存儲報銷/支出記錄。

**字段說明：**

- `id`: UUID，主鍵，自動生成
- `applicant_name`: 申請人姓名
- `item_name`: 項目名稱
- `item_amount`: 金額（NUMERIC(12, 2)，非負數）
- `item_comment`: 備註（可選）
- `invoice_date`: 發票日期
- `invoice_files`: 發票文件列表（TEXT 數組）
- `transfer_date`: 轉帳日期（可選）
- `transfer_fee`: 轉帳手續費（可選，非負數）
- `transfer_files`: 轉帳文件列表（可選，TEXT 數組）
- `status`: 狀態（pending/approved/rejected）
- `user_id`: 用戶 ID（外鍵，可選）
- `created_at`: 創建時間
- `updated_at`: 更新時間

### 2. Ingress (收入) 表

用於存儲收入記錄。

**字段說明：**

- `id`: UUID，主鍵，自動生成
- `ingress_date`: 收入日期
- `ingress_amount`: 收入金額（NUMERIC(12, 2)，非負數）
- `ingress_comment`: 備註（可選）
- `ingress_files`: 相關文件列表（TEXT 數組）
- `user_id`: 用戶 ID（外鍵，可選）
- `created_at`: 創建時間
- `updated_at`: 更新時間

## 安裝步驟

### 1. 在 Supabase Dashboard 中執行 Migration

1. 登入 Supabase Dashboard
2. 進入 SQL Editor
3. 複製 `supabase/migrations/001_create_tables.sql` 的內容
4. 執行 SQL 語句

### 2. 配置環境變量

確保 `.env.local` 文件包含以下變量：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
```

## 使用方式

### 查詢數據

```typescript
import { getEgressList, getIngressList } from "@/lib/supabase/egress";
import { transformEgress, transformIngress } from "@/lib/supabase/transformers";

// 獲取支出列表
const egressData = await getEgressList();
const reimbursements = egressData.map(transformEgress);

// 獲取收入列表
const ingressData = await getIngressList();
const ingress = ingressData.map(transformIngress);
```

### 創建記錄

```typescript
import { createEgress } from "@/lib/supabase/egress";
import { createIngress } from "@/lib/supabase/ingress";

// 創建支出記錄
const newEgress = await createEgress({
  applicant_name: "張三",
  item_name: "開會便當",
  item_amount: 2390,
  invoice_date: "2025-09-01",
  status: "pending",
});

// 創建收入記錄
const newIngress = await createIngress({
  ingress_date: "2025-09-24",
  ingress_amount: 18945,
  ingress_comment: "前金庫",
});
```

### 更新記錄

```typescript
import { updateEgress } from "@/lib/supabase/egress";

await updateEgress(id, {
  status: "approved",
  transfer_date: "2025-09-25",
  transfer_fee: 0,
});
```

### 刪除記錄

```typescript
import { deleteEgress } from "@/lib/supabase/egress";

await deleteEgress(id);
```

## Row Level Security (RLS)

表已啟用 RLS，默認策略允許：

- 用戶查看自己的記錄
- 用戶創建自己的記錄
- 用戶更新自己的記錄
- 用戶刪除自己的記錄

如果 `user_id` 為 `null`，則所有已認證用戶都可以訪問（適用於共享數據）。

你可以根據需要修改 `supabase/migrations/001_create_tables.sql` 中的策略。

## 索引

為了提高查詢性能，已創建以下索引：

- `egress`: invoice_date, status, user_id, created_at
- `ingress`: ingress_date, user_id, created_at

## 自動更新時間戳

`updated_at` 字段會通過觸發器自動更新，無需手動設置。
