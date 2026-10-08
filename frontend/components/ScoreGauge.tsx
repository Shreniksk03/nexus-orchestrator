"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, AlertTriangle, ShieldAlert, Sparkles } from "lucide-react";
import { getScoreColor } from "@/lib/utils";
import confetti from "canvas-confetti";

interface ScoreGaugeProps {
  score?: number | null;
  size?: number;
  showBreakdown?: boolean;
  infosecCount?: number;
  financialCount?: number;
  legalCount?: number;
  regulatoryCount?: number;
}

export function ScoreGauge({
  score,
  size = 220,
  showBreakdown = true,
  infosecCount = 0,
  financialCount = 0,
  legalCount = 0,
  regulatoryCount = 0,
}: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (score === null || score === undefined) return;
    
    // Animate score counter smoothly
    const duration = 1200;
    const start = 0;
    const end = score;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(start + (end - start) * eased);
      setAnimatedScore(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else if (score >= 85) {
        // Fire subtle celebratory confetti for pristine score
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.6 },
          colors: ["#10b981", "#6366f1", "#06b6d4"],
        });
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  const scoreVal = score !== null && score !== undefined ? animatedScore : null;
  const scoreConfig = getScoreColor(score);

  // SVG Gauge calculations
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = scoreVal !== null ? Math.max(0, Math.min(scoreVal, 100)) : 0;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Circular Gauge */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90 transform drop-shadow-xl"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={scoreConfig.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: "stroke-dashoffset 0.8s ease-out, stroke 0.5s ease",
            }}
          />
        </svg>

        {/* Center Display */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          {scoreVal !== null ? (
            <>
              <span className="text-4xl font-extrabold tracking-tight text-white">
                {scoreVal}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Out of 100
              </span>
            </>
          ) : (
            <span className="text-sm font-medium text-slate-400">
              Evaluating...
            </span>
          )}
        </div>
      </div>

      {/* Status Pill */}
      <div className="mt-4 text-center">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold border ${scoreConfig.badge}`}
        >
          {score === null || score === undefined ? (
            <span>In Progress</span>
          ) : score >= 70 ? (
            <>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Verified Safe (&gt; 70)</span>
            </>
          ) : score >= 50 ? (
            <>
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <span>Elevated Risk (50-70)</span>
            </>
          ) : (
            <>
              <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
              <span>Critical Breach Risk (&lt; 50)</span>
            </>
          )}
        </span>
      </div>

      {/* Domain Risk Distribution Bar */}
      {showBreakdown && (
        <div className="mt-6 w-full max-w-sm rounded-xl border border-surface-border bg-surface-300/80 p-3.5">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Identified Risk Distribution
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-surface-200 px-2.5 py-1.5 border border-surface-border">
              <span className="text-slate-400">InfoSec:</span>
              <span className="font-semibold text-cyan-300">{infosecCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-200 px-2.5 py-1.5 border border-surface-border">
              <span className="text-slate-400">Financial:</span>
              <span className="font-semibold text-amber-300">{financialCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-200 px-2.5 py-1.5 border border-surface-border">
              <span className="text-slate-400">Legal:</span>
              <span className="font-semibold text-purple-300">{legalCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-200 px-2.5 py-1.5 border border-surface-border">
              <span className="text-slate-400">Regulatory:</span>
              <span className="font-semibold text-rose-300">{regulatoryCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
