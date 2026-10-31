"use client";

import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface RiskFactorBarsProps {
  factors?: {
    cuaca: number;
    historis: number;
    gambut: number;
    akses: number;
  };
}

export function RiskFactorBars({
  factors = { cuaca: 0.85, historis: 0.7, gambut: 0.9, akses: 0.6 },
}: RiskFactorBarsProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
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
        backgroundColor: "#FFFFFF",
        borderColor: "#E2E8F0",
        textStyle: { color: "#0F172A", fontSize: 11 },
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
        axisLabel: { color: "#64748B", fontSize: 10, formatter: "{value}%" },
        splitLine: { lineStyle: { color: "#E2E8F0", type: "dashed" } },
      },
      yAxis: {
        type: "category",
        data: categories,
        axisLine: { lineStyle: { color: "#CBD5E1" } },
        axisLabel: { color: "#334155", fontSize: 11, fontWeight: 600 },
      },
      series: [
        {
          name: "Kontribusi Faktor",
          type: "bar",
          barWidth: 16,
          data: values.map((val) => ({
            value: val,
            itemStyle: {
              color: val > 80 ? "#DC2626" : val > 65 ? "#D97706" : "#16A34A",
              borderRadius: [0, 6, 6, 0],
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
  }, [factors]);

  return (
    <div className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-4">
      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
        Dekomposisi Faktor Prioritas Siaga (Permutation Importance)
      </h4>
      <div ref={chartRef} className="w-full h-48" />
    </div>
  );
}
