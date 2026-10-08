"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Radio,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  Download,
  BellRing,
  Building2,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ScoreGauge } from "@/components/ScoreGauge";
import { AgentLiveTerminal } from "@/components/AgentLiveTerminal";
import { ClauseHighlighterCard } from "@/components/ClauseHighlighterCard";
import { fetchVendorDetail, fetchVendorLogs } from "@/lib/api";
import { VendorDetail, AgentLog } from "@/lib/schemas";
import { formatDate, getScoreColor } from "@/lib/utils";

export default function VendorReportPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params?.id as string;

  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ANALYSIS" | "CONTRACT" | "AUDIT">("ANALYSIS");

  const loadVendorData = async () => {
    if (!vendorId) return;
    try {
      const [vendorData, logsData] = await Promise.all([
        fetchVendorDetail(vendorId),
        fetchVendorLogs(vendorId),
      ]);
      setVendor(vendorData);
      setLogs(logsData);
    } catch (err) {
      console.error("Failed to fetch vendor report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendorData();

    // Poll logs every 1.5 seconds if status is PROCESSING or PENDING
    const interval = setInterval(() => {
      if (vendor?.status === "PROCESSING" || vendor?.status === "PENDING" || !vendor) {
        loadVendorData();
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [vendorId, vendor?.status]);

  if (loading && !vendor) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar title="Loading Compliance Dossier..." />
        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
          <Cpu className="h-10 w-10 animate-spin text-brand-light" />
          <p className="text-sm font-medium text-slate-400">
            Connecting to Supabase & Orchestration Pipeline...
          </p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar title="Vendor Not Found" />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-rose-400" />
          <h2 className="text-xl font-bold text-white">Vendor Dossier Not Found</h2>
          <p className="text-sm text-slate-400">
            The requested vendor profile does not exist or may have been deleted.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-surface-200 px-4 py-2 text-sm text-white hover:bg-surface-hover"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Command Center</span>
          </Link>
        </div>
      </div>
    );
  }

  const scoreConfig = getScoreColor(vendor.trust_score);

  // Group clause counts
  const infosecClauses = vendor.flagged_clauses.filter((c) => c.domain === "INFORMATION_SECURITY");
  const financialClauses = vendor.flagged_clauses.filter((c) => c.domain === "FINANCIAL_RISK");
  const legalClauses = vendor.flagged_clauses.filter((c) => c.domain === "LEGAL_LIABILITY");
  const regulatoryClauses = vendor.flagged_clauses.filter((c) => c.domain === "REGULATORY_COMPLIANCE");

  const isProcessing = vendor.status === "PROCESSING" || vendor.status === "PENDING";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        title={`${vendor.name} — Compliance Dossier`}
        subtitle={`Audit ID: ${vendor.id} • Created: ${formatDate(vendor.created_at)}`}
      />

      <div className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Navigation Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Command Center</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={loadVendorData}
              className="inline-flex items-center gap-1.5 rounded-xl border border-surface-border bg-surface-200 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-surface-hover hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>

        {/* Processing Banner if currently running */}
        {isProcessing && (
          <div className="rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-5 shadow-lg shadow-indigo-500/5">
            <div className="flex items-center gap-3">
              <Cpu className="h-6 w-6 text-brand-light animate-spin" />
              <div>
                <h4 className="text-sm font-bold text-white">
                  Multi-Agent Pipeline is Analyzing Vendor in Real-Time...
                </h4>
                <p className="text-xs text-indigo-300">
                  The Router, Tavily Web Researcher, and Nemotron 3 Legal Analyst are streaming reasoning logs below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Top Executive Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trust Score Gauge Card */}
          <div className="rounded-3xl border border-surface-border bg-surface-200/90 p-6 shadow-xl flex flex-col items-center justify-center">
            <div className="mb-2 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Calculated Trust Score
              </span>
            </div>

            <ScoreGauge
              score={vendor.trust_score}
              size={210}
              showBreakdown={true}
              infosecCount={infosecClauses.length}
              financialCount={financialClauses.length}
              legalCount={legalClauses.length}
              regulatoryCount={regulatoryClauses.length}
            />
          </div>

          {/* Key Intelligence & Entity Card */}
          <div className="lg:col-span-2 rounded-3xl border border-surface-border bg-surface-200/90 p-6 shadow-xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-brand-light" />
                  <h3 className="text-base font-bold text-white">
                    {vendor.legal_entity_name || vendor.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-md border border-surface-border bg-surface-300 px-2.5 py-1 text-xs text-slate-300 font-mono">
                    {vendor.industry || "Enterprise Cloud"}
                  </span>
                  {vendor.is_alert_triggered && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-400 animate-pulse">
                      <BellRing className="h-3 w-3" />
                      n8n Alert Dispatched
                    </span>
                  )}
                </div>
              </div>

              {/* Executive Reasoning Assessment */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <Sparkles className="h-3.5 w-3.5 text-brand-light" />
                  <span>Executive Legal Assessment</span>
                </div>
                <div className="rounded-xl border border-surface-border bg-surface-300/80 p-4 text-xs text-slate-200 leading-relaxed font-sans">
                  {vendor.overall_reasoning || "Multi-agent risk assessment is underway..."}
                </div>
              </div>
            </div>

            {/* Live Web Reputation Card */}
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
                  <Radio className="h-3.5 w-3.5" />
                  <span>Nemotron Super + Tavily Live OSINT Report</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-400">Live Web Search</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {vendor.reputation_summary || "Scanning legal indexes, SEC records, and adverse media..."}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-surface-border pb-3">
          <button
            onClick={() => setActiveTab("ANALYSIS")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "ANALYSIS"
                ? "bg-brand text-white shadow-md shadow-brand/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Flagged Legal Clauses ({vendor.flagged_clauses.length})
          </button>
          <button
            onClick={() => setActiveTab("AUDIT")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "AUDIT"
                ? "bg-brand text-white shadow-md shadow-brand/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Live Reasoning Terminal ({logs.length} events)
          </button>
          <button
            onClick={() => setActiveTab("CONTRACT")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "CONTRACT"
                ? "bg-brand text-white shadow-md shadow-brand/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Ingested Master Contract
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "ANALYSIS" && (
          <div className="space-y-6">
            <ClauseHighlighterCard clauses={vendor.flagged_clauses} />
            
            {/* Live Terminal embedded under clauses for holistic review */}
            <div className="space-y-3 pt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Cpu className="h-4 w-4 text-brand-light" />
                <span>Real-Time Multi-Agent Reasoning Chain</span>
              </h3>
              <AgentLiveTerminal
                logs={logs}
                vendorName={vendor.name}
                isLive={isProcessing}
              />
            </div>
          </div>
        )}

        {activeTab === "AUDIT" && (
          <div className="space-y-4">
            <AgentLiveTerminal
              logs={logs}
              vendorName={vendor.name}
              isLive={isProcessing}
            />
          </div>
        )}

        {activeTab === "CONTRACT" && (
          <div className="rounded-3xl border border-surface-border bg-surface-200/90 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <FileText className="h-4 w-4 text-slate-400" />
                <span>Full Plain Text Contract</span>
              </div>
              <span className="font-mono text-xs text-slate-400">
                {vendor.contract_text?.length || 0} characters
              </span>
            </div>
            <pre className="max-h-[600px] overflow-y-auto rounded-xl border border-surface-border bg-surface-300/90 p-5 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              {vendor.contract_text || "No contract text available."}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
