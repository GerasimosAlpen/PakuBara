"use client";

import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { useIsDark } from "@/components/layout/ThemeToggle";
import { chartColors } from "./chart-theme";

interface ReadingPoint {
  measured_at: string;
  t20?: number | null;
  t50?: number | null;
  t100?: number | null;
  co_ppm?: number | null;
}

interface NodeTimeSeriesChartProps {
  data: ReadingPoint[];
  title?: string;
  showCo?: boolean;
}

export function NodeTimeSeriesChart({
  data,
  title = "Deret Waktu Suhu Gambut & Konsentrasi CO",
  showCo = true,
}: NodeTimeSeriesChartProps) {
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

    const timestamps = data.map((d) => {
      const date = new Date(d.measured_at);
      return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    });

    const seriesT20 = data.map((d) => d.t20 ?? null);
    const seriesT50 = data.map((d) => d.t50 ?? null);
    const seriesT100 = data.map((d) => d.t100 ?? null);
    const seriesCO = data.map((d) => d.co_ppm ?? null);

    const option: echarts.EChartsOption = {
      backgroundColor: "transparent",
      title: {
        text: title,
        textStyle: {
          color: c.text,
          fontSize: 13,
          fontWeight: "bold",
        },
        left: 0,
        top: 0,
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: c.tooltipBg,
        borderColor: c.tooltipBorder,
        textStyle: { color: c.text, fontSize: 11 },
      },
      legend: {
        data: ["Suhu 20cm", "Suhu 50cm (Bara)", "Suhu 100cm", ...(showCo ? ["CO Gas (ppm)"] : [])],
        top: 24,
        textStyle: { color: c.muted, fontSize: 10 },
      },
      grid: {
        top: 65,
        left: 45,
        right: showCo ? 50 : 20,
        bottom: 50,
      },
      xAxis: {
        type: "category",
        data: timestamps,
        axisLine: { lineStyle: { color: c.axis } },
        axisLabel: { color: c.faint, fontSize: 10 },
      },
      yAxis: [
        {
          type: "value",
          name: "Suhu (°C)",
          nameTextStyle: { color: "#EA580C", fontSize: 10 },
          axisLabel: { color: c.muted, fontSize: 10, formatter: "{value}°" },
          splitLine: { lineStyle: { color: c.grid } },
        },
        ...(showCo
          ? [
              {
                type: "value" as const,
                name: "CO (ppm)",
                nameTextStyle: { color: "#38BDF8", fontSize: 10 },
                axisLabel: { color: c.faint, fontSize: 10 },
                splitLine: { show: false },
              },
            ]
          : []),
      ],
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100,
        },
        {
          type: "slider",
          bottom: 5,
          height: 18,
          borderColor: c.axis,
          backgroundColor: c.sliderBg,
          fillerColor: "rgba(234, 88, 12, 0.2)",
          handleStyle: { color: "#EA580C" },
          textStyle: { color: c.faint, fontSize: 9 },
        },
      ],
      series: [
        {
          name: "Suhu 20cm",
          type: "line",
          smooth: true,
          data: seriesT20,
          itemStyle: { color: "#F59E0B" },
          lineStyle: { width: 1.5 },
        },
        {
          name: "Suhu 50cm (Bara)",
          type: "line",
          smooth: true,
          data: seriesT50,
          itemStyle: { color: "#DC2626" },
          lineStyle: { width: 2.5 },
          markLine: {
            data: [
              {
                yAxis: 60,
                name: "Ambang Bara 60°C",
                lineStyle: { color: "#EA580C", type: "dashed", width: 1.5 },
                label: {
                  formatter: "Ambang Bara 60°C",
                  color: "#EA580C",
                  position: "end",
                  fontSize: 10,
                },
              },
            ],
          },
        },
        {
          name: "Suhu 100cm",
          type: "line",
          smooth: true,
          data: seriesT100,
          itemStyle: { color: "#10B981" },
          lineStyle: { width: 1.5 },
        },
        ...(showCo
          ? [
              {
                name: "CO Gas (ppm)",
                type: "line" as const,
                yAxisIndex: 1,
                smooth: true,
                data: seriesCO,
                itemStyle: { color: "#38BDF8" },
                lineStyle: { width: 1.5, type: "dotted" as const },
              },
            ]
          : []),
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [data, title, showCo, isDark]);

  return (
    <div className="w-full bg-surface border border-line rounded-xl p-4">
      <div ref={chartRef} className="w-full h-72" />
    </div>
  );
}

