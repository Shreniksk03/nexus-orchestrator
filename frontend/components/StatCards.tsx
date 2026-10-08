"use client";

import {
  Users,
  AlertTriangle,
  Award,
  Zap,
  Clock,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { VendorListItem } from "@/lib/schemas";

interface StatCardsProps {
  vendors: VendorListItem[];
  alertThreshold?: number;
}

export function StatCards({ vendors, alertThreshold = 70 }: StatCardsProps) {
  const total = vendors.length;
  const completed = vendors.filter((v) => v.status === "COMPLETED");
  const highRisk = vendors.filter(
    (v) => (v.trust_score !== null && v.trust_score !== undefined && v.trust_score < alertThreshold) || v.is_alert_triggered
  );
  
  const verifiedSafe = vendors.filter(
    (v) => v.trust_score !== null && v.trust_score !== undefined && v.trust_score >= alertThreshold
  );

  const scores = completed
    .map((v) => v.trust_score)
    .filter((s): s is number => s !== null && s !== undefined);
  
  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  // Estimated hours saved: 12.5 hours per vendor manual onboarding review
  const hoursSaved = (total * 12.5).toFixed(1);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Vendors */}
      <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-surface-200/90 p-5 shadow-sm transition-all hover:border-surface-hover">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Ingested Vendors
          </span>
          <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400 border border-indigo-500/20">
            <Users className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-white">
            {total}
          </span>
          <span className="text-xs font-medium text-slate-400">
            ({completed.length} processed)
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-indigo-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Zero-Touch Compliance Ingestion</span>
        </div>
        <div className="absolute right-0 top-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />
      </div>

      {/* High Risk Vendors */}
      <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-surface-200/90 p-5 shadow-sm transition-all hover:border-surface-hover">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            High-Risk & Alerted
          </span>
          <div className="rounded-xl bg-rose-500/10 p-2.5 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-rose-400">
            {highRisk.length}
          </span>
          <span className="text-xs text-slate-400">
            (Score &lt; {alertThreshold})
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-300">
          <TrendingDown className="h-3.5 w-3.5" />
          <span>{highRisk.length} n8n Webhook Alerts Fired</span>
        </div>
        <div className="absolute right-0 top-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-rose-500/5 blur-2xl pointer-events-none" />
      </div>

      {/* Average Trust Score */}
      <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-surface-200/90 p-5 shadow-sm transition-all hover:border-surface-hover">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Average Trust Score
          </span>
          <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400 border border-emerald-500/20">
            <Award className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-white">
            {avgScore}
          </span>
          <span className="text-xs text-slate-400">/ 100</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>{verifiedSafe.length} Vendors Passed Direct Approval</span>
        </div>
        <div className="absolute right-0 top-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
      </div>

      {/* Time & Bottleneck Saved */}
      <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-surface-200/90 p-5 shadow-sm transition-all hover:border-surface-hover">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Legal Hours Saved
          </span>
          <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400 border border-amber-500/20">
            <Clock className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-amber-300">
            {hoursSaved}h
          </span>
          <span className="text-xs text-slate-400">saved</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-300">
          <Zap className="h-3.5 w-3.5" />
          <span>~12.5 hrs saved per vendor</span>
        </div>
        <div className="absolute right-0 top-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />
      </div>
    </div>
  );
}
