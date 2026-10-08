import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(d);
  } catch {
    return dateString;
  }
}

export function getScoreColor(score?: number | null) {
  if (score === undefined || score === null) {
    return {
      text: "text-slate-400",
      bg: "bg-slate-800/60",
      border: "border-slate-700",
      stroke: "#64748b",
      badge: "bg-slate-800 text-slate-300 border-slate-700",
      label: "Pending Assessment",
    };
  }
  if (score >= 70) {
    return {
      text: "text-emerald-400",
      bg: "bg-emerald-950/40",
      border: "border-emerald-500/30",
      stroke: "#10b981",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      label: "Verified Safe / Approved",
    };
  }
  if (score >= 50) {
    return {
      text: "text-amber-400",
      bg: "bg-amber-950/40",
      border: "border-amber-500/30",
      stroke: "#f59e0b",
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      label: "Elevated Risk / Conditional",
    };
  }
  return {
    text: "text-rose-400",
    bg: "bg-rose-950/40",
    border: "border-rose-500/30",
    stroke: "#ef4444",
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    label: "Critical Risk / Blocked",
  };
}

export function getDomainBadge(domain: string) {
  switch (domain) {
    case "INFORMATION_SECURITY":
      return {
        label: "Information Security",
        badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
        icon: "ShieldAlert",
      };
    case "FINANCIAL_RISK":
      return {
        label: "Financial Risk",
        badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        icon: "CircleDollarSign",
      };
    case "LEGAL_LIABILITY":
      return {
        label: "Legal Liability",
        badge: "bg-purple-500/15 text-purple-300 border-purple-500/30",
        icon: "Scale",
      };
    case "REGULATORY_COMPLIANCE":
      return {
        label: "Regulatory Compliance",
        badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
        icon: "FileCheck2",
      };
    default:
      return {
        label: domain,
        badge: "bg-slate-500/15 text-slate-300 border-slate-500/30",
        icon: "AlertTriangle",
      };
  }
}

export function getSeverityBadge(severity: string) {
  switch (severity?.toUpperCase()) {
    case "CRITICAL":
      return {
        label: "CRITICAL",
        badge: "bg-red-500/20 text-red-400 border-red-500/40 font-semibold",
      };
    case "HIGH":
      return {
        label: "HIGH",
        badge: "bg-orange-500/20 text-orange-400 border-orange-500/40",
      };
    case "MEDIUM":
      return {
        label: "MEDIUM",
        badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      };
    case "LOW":
      return {
        label: "LOW",
        badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      };
    default:
      return {
        label: severity,
        badge: "bg-slate-500/20 text-slate-300 border-slate-500/30",
      };
  }
}
