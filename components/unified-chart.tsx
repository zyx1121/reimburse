"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Transaction } from "@/components/unified-columns";
import { useEffect, useMemo, useRef, useState } from "react";
import { CartesianGrid, Line, LineChart } from "recharts";

const chartConfig = {
  ingress: {
    label: "收入",
    color: "#22c55e",
  },
  egress: {
    label: "支出",
    color: "#ef4444",
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
  return `${year} 年第 ${parseInt(week)} 週`;
}

function processData(data: Transaction[]) {
  // Group by week for both ingress and egress
  const ingressWeekMap = new Map<string, number>();
  const egressWeekMap = new Map<string, number>();

  data.forEach((item) => {
    const date =
      item.type === "egress"
        ? new Date(item.invoiceDate)
        : new Date(item.ingressDate);
    const weekKey = getWeekKey(date);

    if (item.type === "ingress") {
      const currentAmount = ingressWeekMap.get(weekKey) || 0;
      ingressWeekMap.set(weekKey, currentAmount + item.ingressAmount);
    } else {
      const currentAmount = egressWeekMap.get(weekKey) || 0;
      const totalAmount = item.itemAmount + (item.transferFee || 0);
      egressWeekMap.set(weekKey, currentAmount + totalAmount);
    }
  });

  // Get all unique weeks
  const allWeeks = new Set([
    ...Array.from(ingressWeekMap.keys()),
    ...Array.from(egressWeekMap.keys()),
  ]);

  // Convert to array and sort by week
  const chartData = Array.from(allWeeks)
    .map((week) => ({
      week: week,
      weekLabel: formatWeekLabel(week),
      ingress: ingressWeekMap.get(week) || 0,
      egress: egressWeekMap.get(week) || 0,
    }))
    .sort((a, b) => a.week.localeCompare(b.week));

  return chartData;
}

interface UnifiedChartProps {
  data: Transaction[];
}

export function UnifiedChart({ data }: UnifiedChartProps) {
  const chartData = useMemo(() => processData(data), [data]);
  const [displayData, setDisplayData] = useState<typeof chartData>([]);
  const [isAnimating, setIsAnimating] = useState(true);
  const chartDataRef = useRef<string>("");
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);

  // Generate a string representation of chart data for comparison
  const chartDataString = useMemo(
    () => JSON.stringify(chartData),
    [chartData]
  );

  // Trigger animation by starting with empty data, then setting actual data
  useEffect(() => {
    // Clear any pending animations
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    // If data has actually changed
    if (chartDataString !== chartDataRef.current) {
      chartDataRef.current = chartDataString;
      
      if (chartData.length > 0) {
        // Always start with empty data to trigger animation
        setDisplayData([]);
        setIsAnimating(true);
        
        // Use requestAnimationFrame to ensure the empty state renders first
        // Then use setTimeout to set the actual data
        rafRef.current = requestAnimationFrame(() => {
          animationTimerRef.current = setTimeout(() => {
            setDisplayData(chartData);
            animationTimerRef.current = null;
            rafRef.current = null;
          }, 200); // Increased delay for more reliable animation
        });
      } else {
        // If no data, just set empty array
        setDisplayData([]);
      }
    } else if (chartData.length > 0 && displayData.length === 0) {
      // If data hasn't changed but displayData is still empty, set it
      setDisplayData(chartData);
    }
    
    // Cleanup function
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
        animationTimerRef.current = null;
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [chartDataString, chartData.length]);

  // Generate a unique key that changes when data changes
  const chartKey = useMemo(
    () =>
      `chart-${chartDataString.slice(0, 50)}-${displayData.length}`,
    [chartDataString, displayData.length]
  );

  return (
    <ChartContainer
      config={chartConfig}
      className="h-full w-full border dark:border-input rounded-lg p-4 bg-background/70 backdrop-blur-sm"
    >
      <LineChart
        key={chartKey}
        accessibilityLayer
        data={displayData}
        margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid vertical={false} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="dot"
              labelFormatter={(label, payload) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload;
                  if (data && data.weekLabel) {
                    return data.weekLabel;
                  }
                }
                return label;
              }}
              formatter={(value, name) => {
                if (typeof value === "number") {
                  return [
                    name === "ingress" ? "收入 " : "支出 ",
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
          dataKey="ingress"
          stroke="var(--color-ingress)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
          isAnimationActive={isAnimating}
          animationDuration={1000}
          animationBegin={0}
          animationEasing="ease-out"
        />
        <Line
          type="monotone"
          dataKey="egress"
          stroke="var(--color-egress)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
          isAnimationActive={isAnimating}
          animationDuration={1000}
          animationBegin={150}
          animationEasing="ease-out"
        />
      </LineChart>
    </ChartContainer>
  );
}
