"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface TimelineReplayBarProps {
  onTimeChange?: (hoursAhead: number) => void;
  speedSpreadMph?: number;
  threatenedAreaHa?: number;
}

export function TimelineReplayBar({
  onTimeChange,
  speedSpreadMph = 19,
  threatenedAreaHa = 2.1,
}: TimelineReplayBarProps) {
  const [timeStep, setTimeStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const STEPS = [
    { label: "Now", value: 0 },
    { label: "+1h", value: 1 },
    { label: "+3h", value: 3 },
    { label: "+6h", value: 6 },
    { label: "+9h", value: 9 },
    { label: "+12h", value: 12 },
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setTimeStep((prev) => {
          const currentIndex = STEPS.findIndex((s) => s.value === prev);
          const nextIndex = (currentIndex + 1) % STEPS.length;
          return STEPS[nextIndex].value;
        });
      }, 1800);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    onTimeChange?.(timeStep);
  }, [timeStep, onTimeChange]);

  const currentSpeed = speedSpreadMph + timeStep * 1.5;
  const currentArea = (threatenedAreaHa + timeStep * 0.35).toFixed(1);

  return (
    <div className="w-full bg-[#0F172A]/95 backdrop-blur-md border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 select-none">
      {/* Left: Play / Pause Button & Nowcast Controls */}
      <div className="flex items-center gap-3.5 w-full md:w-auto">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-10 h-10 rounded-xl bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-950/40 transition-transform active:scale-95 shrink-0"
          title={isPlaying ? "Jeda Simulasi Nowcast" : "Putar Proyeksi Rambat Bara"}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        {/* Middle Stepped Scrubber */}
        <div className="flex flex-col gap-1.5 flex-1 md:min-w-[320px]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              <span className="text-orange-500 font-bold">t+{timeStep}</span>
              <span>Nowcast</span>
            </span>
            <span className="text-[11px] text-slate-400">
              {timeStep === 0 ? "Kondisi Nyata (Sensor)" : `Proyeksi Rambat +${timeStep} Jam`}
            </span>
          </div>

          <div className="flex items-center justify-between gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
            {STEPS.map((step) => (
              <button
                key={step.value}
                onClick={() => {
                  setIsPlaying(false);
                  setTimeStep(step.value);
                }}
                className={`flex-1 py-1 text-[11px] font-mono rounded-md transition-all ${
                  timeStep === step.value
                    ? "bg-orange-600 text-white font-bold shadow-md shadow-orange-950/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Metrics: Laju Rambatan & Estimasi Luas Terancam */}
      <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-800 pt-2.5 md:pt-0 md:pl-6">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Laju Rambatan (R)
          </div>
          <div className="text-base font-mono font-bold text-orange-400">
            {currentSpeed.toFixed(0)} m/jam
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Estimasi Luas Terancam
          </div>
          <div className="text-base font-mono font-bold text-rose-500">
            {currentArea} ha
          </div>
        </div>
      </div>
    </div>
  );
}

