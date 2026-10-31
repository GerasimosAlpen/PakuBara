"use client";

import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

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

  useEffect(() => {
    if (!chartRef.current) return;
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const data = [
      { value: statusBreakdown.normal, name: "Aman", itemStyle: { color: "#16A34A" } },
      { value: statusBreakdown.watch, name: "CO Meningkat", itemStyle: { color: "#D97706" } },
      { value: statusBreakdown.warning, name: "Peringatan", itemStyle: { color: "#EA580C" } },
      { value: statusBreakdown.active, name: "Bara Bawah Tanah", itemStyle: { color: "#DC2626" } },
      { value: statusBreakdown.offline, name: "Offline", itemStyle: { color: "#94A3B8" } },
    ].filter((item) => item.value > 0);

    const total = Object.values(statusBreakdown).reduce((a, b) => a + b, 0);

    const option: echarts.EChartsOption = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "#FFFFFF",
        borderColor: "#E2E8F0",
        textStyle: { color: "#0F172A", fontSize: 11 },
      },
      legend: {
        bottom: 0,
        left: "center",
        textStyle: { color: "#475569", fontSize: 11 },
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
            fontSize: 15,
            fontWeight: "bold",
            color: "#0F172A",
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
  }, [statusBreakdown]);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <h4 className="text-sm font-extrabold text-slate-900 mb-2">Sebaran Status Titik Sensor</h4>
      <div ref={chartRef} className="w-full h-56" />
    </div>
  );
}
