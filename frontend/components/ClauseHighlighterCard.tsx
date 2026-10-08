"use client";

import { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Scale,
  CircleDollarSign,
  FileCheck2,
  Filter,
  CheckCircle2,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { FlaggedClause, RiskDomain, RiskSeverity } from "@/lib/schemas";
import { getDomainBadge, getSeverityBadge } from "@/lib/utils";

interface ClauseHighlighterCardProps {
  clauses: FlaggedClause[];
}

export function ClauseHighlighterCard({ clauses }: ClauseHighlighterCardProps) {
  const [domainFilter, setDomainFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredClauses = clauses.filter((c) => {
    if (domainFilter !== "ALL" && c.domain !== domainFilter) return false;
    if (severityFilter !== "ALL" && c.severity !== severityFilter) return false;
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case "INFORMATION_SECURITY":
        return <ShieldAlert className="h-4 w-4 text-cyan-400" />;
      case "FINANCIAL_RISK":
        return <CircleDollarSign className="h-4 w-4 text-amber-400" />;
      case "LEGAL_LIABILITY":
        return <Scale className="h-4 w-4 text-purple-400" />;
      case "REGULATORY_COMPLIANCE":
        return <FileCheck2 className="h-4 w-4 text-rose-400" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-200/90 p-3.5">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Domain Filters:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "ALL", label: "All" },
              { id: "INFORMATION_SECURITY", label: "InfoSec" },
              { id: "FINANCIAL_RISK", label: "Financial" },
              { id: "LEGAL_LIABILITY", label: "Legal" },
              { id: "REGULATORY_COMPLIANCE", label: "Regulatory" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setDomainFilter(f.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  domainFilter === f.id
                    ? "bg-brand text-white shadow-sm"
                    : "border border-surface-border bg-surface-100 text-slate-400 hover:text-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Severity:
          </span>
          <div className="flex gap-1.5">
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`rounded-lg px-2 py-0.5 text-xs font-medium transition-all ${
                  severityFilter === sev
                    ? "bg-slate-700 text-white font-bold"
                    : "border border-surface-border bg-surface-100 text-slate-400 hover:text-slate-200"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clauses List */}
      {filteredClauses.length === 0 ? (
        <div className="rounded-2xl border border-surface-border bg-surface-200/90 p-8 text-center text-slate-400">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
          <p className="font-semibold text-slate-200">No flagged clauses match the selected criteria</p>
          <p className="text-xs text-slate-500 mt-1">
            Contract terms adhere to standard enterprise compliance policies.
          </p>
        </div>
      ) : (
        filteredClauses.map((clause, index) => {
          const domainBadge = getDomainBadge(clause.domain);
          const sevBadge = getSeverityBadge(clause.severity);
          const isExpanded = expandedId === clause.id;

          return (
            <div
              key={clause.id || index}
              className="overflow-hidden rounded-2xl border border-surface-border bg-surface-200/90 shadow-md transition-all hover:border-surface-hover"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border bg-surface-300/80 px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  {getDomainIcon(clause.domain)}
                  <span
                    className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${domainBadge.badge}`}
                  >
                    {domainBadge.label}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs ${sevBadge.badge}`}
                  >
                    {sevBadge.label}
                  </span>
                </div>

                <button
                  onClick={() => toggleExpand(clause.id)}
                  className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-brand-light transition-colors"
                >
                  <span>{isExpanded ? "Hide Details" : "Inspect Reasoning"}</span>
                  {isExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {/* Clause Body */}
              <div className="p-5 space-y-4">
                {/* Quoted Contract Text */}
                <div>
                  <div className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                    <span>Contract Clause Excerpt</span>
                  </div>
                  <div className="rounded-xl border border-surface-border bg-background/80 p-3.5 font-mono text-xs text-amber-200/90 leading-relaxed border-l-4 border-l-amber-500">
                    {clause.clause_text}
                  </div>
                </div>

                {/* Agent Reasoning & Risk Exposure */}
                <div>
                  <div className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <Sparkles className="h-3.5 w-3.5 text-brand-light" />
                    <span>Nemotron 3 Ultra Legal Risk Analysis</span>
                  </div>
                  <div className="rounded-xl border border-brand/20 bg-brand/5 p-3.5 text-xs text-slate-200 leading-relaxed">
                    {clause.agent_reasoning}
                  </div>
                </div>

                {/* Recommended Remediation (Expandable) */}
                {isExpanded && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs">
                    <div className="mb-1 font-semibold text-emerald-400">
                      Recommended Compliance Redline / Counter-Action:
                    </div>
                    <p className="text-slate-300">
                      {clause.domain === "INFORMATION_SECURITY"
                        ? "Strike the 3-month liability ceiling. Insist on a dedicated super-cap ($5,000,000+) or uncapped liability for data breaches, accompanied by proof of current Cyber E&O insurance."
                        : clause.domain === "FINANCIAL_RISK"
                        ? "Replace unilateral auto-renewal with explicit written affirmative opt-in, and cap annual subscription increases to CPI or a maximum of 3%."
                        : clause.domain === "LEGAL_LIABILITY"
                        ? "Require mutual, unencumbered indemnification covering intellectual property infringement and gross negligence with domestic jurisdiction."
                        : "Mandate immediate 24-48 hour regulatory breach notification and full cooperation with enterprise SEC / GDPR disclosure filings."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
