"use client";

import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { useIsDark } from "@/components/layout/ThemeToggle";
import { chartColors } from "./chart-theme";

interface AreaStatusDonutProps {
  statusBreakdown?: {
    normal: number;
    watch: number;
    warning: number;
    active: number;
    offline: number;
  };
}

export function AreaStatusDonut({
  statusBreakdown = { normal: 5, watch: 1, warning: 0, active: 1, offline: 1 },
}: AreaStatusDonutProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const isDark = useIsDark();
  const themeRef = useRef(isDark);

  useEffect(() => {
    const c = chartColors(isDark);
    if (!chartRef.current) return;
    if (chartInstance.current && themeRef.current !== isDark) {
      chartInstance.current.dispose();
      chartInstance.current = null;
    }
    themeRef.current = isDark;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, isDark ? "dark" : undefined);
    }

    const data = [
      { value: statusBreakdown.normal, name: "Normal", itemStyle: { color: "#10B981" } },
      { value: statusBreakdown.watch, name: "Waspada", itemStyle: { color: "#F59E0B" } },
      { value: statusBreakdown.warning, name: "Peringatan", itemStyle: { color: "#EA580C" } },
      { value: statusBreakdown.active, name: "Bara Aktif", itemStyle: { color: "#DC2626" } },
      { value: statusBreakdown.offline, name: "Offline", itemStyle: { color: "#64748B" } },
    ].filter((item) => item.value > 0);

    const total = Object.values(statusBreakdown).reduce((a, b) => a + b, 0);

    const option: echarts.EChartsOption = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: c.tooltipBg,
        borderColor: c.tooltipBorder,
        textStyle: { color: c.text, fontSize: 11 },
      },
      legend: {
        bottom: 0,
        left: "center",
        textStyle: { color: c.muted, fontSize: 10 },
      },
      series: [
        {
          name: "Status Titik",
          type: "pie",
          radius: ["50%", "75%"],
          center: ["50%", "45%"],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: "center",
            formatter: `${total}\nTitik`,
            fontSize: 16,
            fontWeight: "bold",
            color: c.text,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: "bold",
            },
          },
          data,
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [statusBreakdown, isDark]);

  return (
    <div className="w-full bg-surface border border-line rounded-xl p-4">
      <h4 className="text-sm font-semibold text-stone-50 mb-2">Sebaran Status Titik Sensor</h4>
      <div ref={chartRef} className="w-full h-56" />
    </div>
  );
}

