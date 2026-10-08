"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Plus,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { StatCards } from "@/components/StatCards";
import { VendorDataTable } from "@/components/VendorDataTable";
import { fetchSettings, fetchVendors } from "@/lib/api";
import { AppSettings, VendorListItem } from "@/lib/schemas";

export default function DashboardPage() {
  const [vendors, setVendors] = useState<VendorListItem[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [vendorsData, settingsData] = await Promise.all([
        fetchVendors().catch(() => []),
        fetchSettings().catch(() => ({ webhook_url: "", alert_threshold: 70 })),
      ]);
      setVendors(vendorsData);
      setSettings(settingsData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Auto-refresh every 6 seconds to capture live processing vendors
    const interval = setInterval(() => {
      loadData();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        title="Compliance Command Center"
        subtitle="Zero-Touch Multi-Agent Risk & Contract Intelligence Matrix"
      />

      <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto w-full">
        {/* Hero Mission Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-surface-border bg-gradient-to-r from-surface-200 via-surface-100 to-indigo-950/40 p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand-light">
                <Sparkles className="h-3.5 w-3.5" />
                <span>NVIDIA Nemotron Multi-Agent Architecture</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Eliminate the 15-Hour Vendor Onboarding Bottleneck.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Nexus Orchestrator autonomous agents ingest vendor Master Service Agreements,
                execute live Tavily regulatory searches for lawsuits & SEC fines, and cross-examine
                clauses to generate an objective Trust Score with automated n8n alerts.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/onboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-brand/25 transition-all hover:brightness-110 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Analyze New Agreement</span>
              </Link>
              <button
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-200 px-4 py-3 text-sm font-medium text-slate-300 transition-all hover:bg-surface-hover hover:text-white"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin text-brand-light" : ""}`}
                />
                <span>Sync</span>
              </button>
            </div>
          </div>

          {/* Background Decorative Glow */}
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
        </div>

        {/* Top Stat Cards */}
        <StatCards
          vendors={vendors}
          alertThreshold={settings?.alert_threshold ?? 70}
        />

        {/* Vendor Data Table Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white">
                Vendor Compliance Registry
              </h3>
              <p className="text-xs text-slate-400">
                Live status and historical evaluation audits of all third-party counterparties.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-400">
              Showing {vendors.length} vendors
            </span>
          </div>

          <VendorDataTable vendors={vendors} isLoading={loading} />
        </div>
      </div>
    </div>
  );
}
