# 初始化腳本

## 使用說明

這個腳本會將硬編碼在代碼中的初始數據插入到 Supabase 數據庫中。

## 執行方式

### 使用 Bun（推薦）

```bash
bun run scripts/init.ts
```

或者使用 npm script：

```bash
npm run init:db
```

### 使用 Node.js + tsx

如果你使用 Node.js，需要先安裝 tsx：

```bash
npm install -D tsx
```

然後執行：

```bash
npx tsx scripts/init.ts
```

## 環境變量

確保你的 `.env.local` 文件包含以下變量：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
```

## 注意事項

- 腳本會插入所有硬編碼的數據
- 如果數據已存在，可能會因為唯一約束而失敗
- 建議在空數據庫上執行此腳本
- 如果需要重新初始化，請先清空數據庫表

## 數據內容

- **收入數據**: 7 筆記錄
- **支出數據**: 19 筆記錄

