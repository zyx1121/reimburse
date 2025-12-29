"use client";

import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Ingress } from "@/components/ingress-columns";

const chartConfig = {
  amount: {
    label: "收入",
    color: "#10b981",
  },
} satisfies ChartConfig;

// Helper function to get the week key (year-week) for a given date
// Week starts on Monday
function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  // Get the Monday of the week
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  const monday = new Date(d.setDate(diff));

  const year = monday.getFullYear();
  const startOfYear = new Date(year, 0, 1);

  // Calculate days from start of year
  const daysDiff = Math.floor(
    (monday.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );

  // Calculate week number (weeks start on Monday)
  const firstDayOfYear = startOfYear.getDay();
  const weekNumber = Math.floor((daysDiff + firstDayOfYear) / 7) + 1;

  return `${year}-W${weekNumber.toString().padStart(2, "0")}`;
}

// Helper function to format week label
function formatWeekLabel(weekKey: string): string {
  const [year, week] = weekKey.split("-W");
  return `${year}年第${parseInt(week)}週`;
}

function processData(data: Ingress[]) {
  // Group by week
  const weekMap = new Map<string, number>();

  data.forEach((item) => {
    const date = new Date(item.ingressDate);
    const weekKey = getWeekKey(date);
    const currentAmount = weekMap.get(weekKey) || 0;
    weekMap.set(weekKey, currentAmount + item.ingressAmount);
  });

  // Convert to array and sort by week
  const chartData = Array.from(weekMap.entries())
    .map(([week, amount]) => ({
      week: week,
      weekLabel: formatWeekLabel(week),
      amount: amount,
    }))
    .sort((a, b) => a.week.localeCompare(b.week));

  return chartData;
}

interface IngressChartProps {
  data: Ingress[];
}

export function IngressChart({ data }: IngressChartProps) {
  const chartData = processData(data);

  return (
    <ChartContainer
      config={chartConfig}
      className="h-full w-full border dark:border-input rounded-lg p-4"
    >
      <LineChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="weekLabel"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          interval={0}
          padding={{ left: 20, right: 20 }}
          tickFormatter={(value) =>
            value.replace("年第", "/").replace("週", "")
          }
        />
        <YAxis hide />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name, item, index, payload) => {
                if (typeof value === "number") {
                  return [
                    new Intl.NumberFormat("zh-TW", {
                      style: "currency",
                      currency: "TWD",
                      minimumFractionDigits: 0,
                    }).format(value),
                  ];
                }
                return [String(value)];
              }}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="var(--color-amount)"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  );
}

