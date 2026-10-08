"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FilePlus2,
  Sliders,
  ShieldCheck,
  Cpu,
  Radio,
  ExternalLink,
  ChevronRight,
  Activity,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: "Command Center",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Onboard Vendor",
    href: "/onboard",
    icon: FilePlus2,
    badge: "Intake",
  },
  {
    name: "Alerts & Settings",
    href: "/settings",
    icon: Sliders,
    badge: "n8n",
  },
];

export function SidebarNavigation() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-surface-border bg-background/95 backdrop-blur-md">
      {/* Brand Header */}
      <div className="flex h-20 items-center justify-between border-b border-surface-border px-6">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-brand to-purple-600 p-0.5 shadow-lg shadow-brand/25 transition-transform duration-300 group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-background">
              <ShieldCheck className="h-5 w-5 text-brand-light" />
            </div>
            <div className="absolute -inset-0.5 -z-10 rounded-xl bg-brand opacity-40 blur transition-all group-hover:opacity-75" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-white">NEXUS</span>
              <span className="rounded bg-brand/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand-light">
                ORCHESTRATOR
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Zero-Touch Compliance</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 space-y-1.5 px-4 py-6">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Core Workflows
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-brand/15 text-white shadow-sm shadow-brand/10"
                  : "text-slate-400 hover:bg-surface-hover hover:text-slate-200"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-brand" />
              )}
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive
                      ? "text-brand-light"
                      : "text-slate-400 group-hover:text-slate-300"
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                    isActive
                      ? "border-brand/40 bg-brand/20 text-brand-light"
                      : "border-slate-800 bg-surface-100 text-slate-400"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Agent Cluster Status Box */}
      <div className="p-4">
        <div className="rounded-2xl border border-surface-border bg-surface-200/80 p-4 backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-semibold text-white">
                Agent Swarm
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[10px] font-medium text-emerald-400">
                ACTIVE
              </span>
            </div>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between rounded-lg bg-surface-300/80 px-2.5 py-1.5 border border-surface-border/50">
              <span className="text-slate-400">The Router</span>
              <span className="font-mono text-purple-300">Nemotron Nano</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-300/80 px-2.5 py-1.5 border border-surface-border/50">
              <span className="text-slate-400">The Researcher</span>
              <span className="font-mono text-cyan-300">Nemotron Super</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-300/80 px-2.5 py-1.5 border border-surface-border/50">
              <span className="text-slate-400">The Legal Analyst</span>
              <span className="font-mono text-amber-300">Nemotron 3 Ultra</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-surface-border/60 pt-2.5 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Radio className="h-3 w-3 text-brand" /> Tavily Search
            </span>
            <span className="text-emerald-400">Connected</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
