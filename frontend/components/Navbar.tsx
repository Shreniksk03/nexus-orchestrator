"use client";

import Link from "next/link";
import { Plus, Shield, Sparkles, Activity, FileText } from "lucide-react";

interface NavbarProps {
  title?: string;
  subtitle?: string;
}

export function Navbar({ title, subtitle }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-surface-border bg-background/80 px-8 backdrop-blur-xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
          {title || "Compliance Command Center"}
          <span className="inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand-light">
            <Sparkles className="h-3 w-3" /> Autonomous Orchestration
          </span>
        </h1>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Real-time System Connectivity Indicators */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-surface-border bg-surface-200/90 px-3.5 py-1.5 text-xs text-slate-300 shadow-inner">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] text-slate-300">FastAPI</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span className="font-mono text-[11px] text-slate-300">Nemotron 3</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            <span className="font-mono text-[11px] text-slate-300">Tavily</span>
          </div>
        </div>

        <Link
          href="/onboard"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-all hover:brightness-110 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Onboard New Vendor</span>
        </Link>
      </div>
    </header>
  );
}
