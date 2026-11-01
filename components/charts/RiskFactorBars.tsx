"use client";

import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { useIsDark } from "@/components/layout/ThemeToggle";
import { chartColors } from "./chart-theme";

interface RiskFactorBarsProps {
  factors?: {
    cuaca: number; // e.g. 0.85
    historis: number; // e.g. 0.70
    gambut: number; // e.g. 0.90
    akses: number; // e.g. 0.60
  };
}

export function RiskFactorBars({
  factors = { cuaca: 0.85, historis: 0.7, gambut: 0.9, akses: 0.6 },
}: RiskFactorBarsProps) {
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

    const categories = [
      "Aksesibilitas (Kanal/Jalan)",
      "Karakteristik Gambut (>3m)",
      "Historis Karhutla & Hotspot",
      "Kondisi Cuaca (Angin & Suhu)",
    ];

    const values = [
      Math.round(factors.akses * 100),
      Math.round(factors.gambut * 100),
      Math.round(factors.historis * 100),
      Math.round(factors.cuaca * 100),
    ];

    const option: echarts.EChartsOption = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: c.tooltipBg,
        borderColor: c.tooltipBorder,
        textStyle: { color: c.text, fontSize: 11 },
        formatter: "{b}: {c}% kontribusi risiko",
      },
      grid: {
        top: 10,
        left: 170,
        right: 30,
        bottom: 20,
      },
      xAxis: {
        type: "value",
        max: 100,
        axisLabel: { color: c.faint, fontSize: 10, formatter: "{value}%" },
        splitLine: { lineStyle: { color: c.grid } },
      },
      yAxis: {
        type: "category",
        data: categories,
        axisLine: { lineStyle: { color: c.axis } },
        axisLabel: { color: c.muted, fontSize: 10 },
      },
      series: [
        {
          name: "Kontribusi Faktor",
          type: "bar",
          data: values.map((val) => ({
            value: val,
            itemStyle: {
              color: val > 80 ? "#DC2626" : val > 65 ? "#EA580C" : "#F59E0B",
              borderRadius: [0, 4, 4, 0],
            },
          })),
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [factors, isDark]);

  return (
    <div className="w-full bg-surface border border-line rounded-xl p-4">
      <h4 className="text-sm font-semibold text-stone-50 mb-2">Dekomposisi Faktor Prioritas Siaga</h4>
      <div ref={chartRef} className="w-full h-48" />
    </div>
  );
}

