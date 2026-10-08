"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  AlertCircle,
  BellRing,
  FileSearch,
} from "lucide-react";
import { VendorListItem } from "@/lib/schemas";
import { formatDate, getScoreColor } from "@/lib/utils";

interface VendorDataTableProps {
  vendors: VendorListItem[];
  isLoading?: boolean;
}

type FilterStatus = "ALL" | "COMPLETED" | "PROCESSING" | "HIGH_RISK" | "ALERTED";

export function VendorDataTable({ vendors, isLoading }: VendorDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [sortField, setSortField] = useState<"created_at" | "trust_score" | "name">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filtered = vendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.industry && v.industry.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === "ALL") return true;
    if (statusFilter === "COMPLETED") return v.status === "COMPLETED";
    if (statusFilter === "PROCESSING") return v.status === "PROCESSING" || v.status === "PENDING";
    if (statusFilter === "ALERTED") return v.is_alert_triggered;
    if (statusFilter === "HIGH_RISK") {
      return (v.trust_score !== null && v.trust_score !== undefined && v.trust_score < 70) || v.is_alert_triggered;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortField === "created_at") {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    }
    if (sortField === "trust_score") {
      const scoreA = a.trust_score ?? -1;
      const scoreB = b.trust_score ?? -1;
      return sortOrder === "asc" ? scoreA - scoreB : scoreB - scoreA;
    }
    if (sortField === "name") {
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    return 0;
  });

  const handleSort = (field: "created_at" | "trust_score" | "name") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by vendor name, legal entity, industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-surface-border bg-surface-200/90 pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand shadow-inner"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: "ALL", label: "All Vendors" },
              { id: "HIGH_RISK", label: "High Risk (<70)" },
              { id: "ALERTED", label: "n8n Alerts Fired" },
              { id: "PROCESSING", label: "Processing" },
              { id: "COMPLETED", label: "Completed" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                statusFilter === tab.id
                  ? "bg-brand text-white shadow-sm shadow-brand/30"
                  : "border border-surface-border bg-surface-200/80 text-slate-400 hover:bg-surface-hover hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Data Table */}
      <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface-200/90 shadow-xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-surface-border bg-surface-300/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th
                  onClick={() => handleSort("name")}
                  className="cursor-pointer px-6 py-4 transition-colors hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Vendor Legal Name</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-4">Industry Sector</th>
                <th className="px-6 py-4">Pipeline Status</th>
                <th
                  onClick={() => handleSort("trust_score")}
                  className="cursor-pointer px-6 py-4 transition-colors hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Trust Score</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-4">Flagged Clauses</th>
                <th className="px-6 py-4">Autonomous Alert</th>
                <th
                  onClick={() => handleSort("created_at")}
                  className="cursor-pointer px-6 py-4 transition-colors hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Ingested At</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <FileSearch className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                    <p className="font-medium text-slate-300">No vendors found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchTerm
                        ? "Try clearing your search query or filter"
                        : "Click 'Onboard New Vendor' to analyze your first agreement"}
                    </p>
                  </td>
                </tr>
              ) : (
                sorted.map((vendor) => {
                  const scoreConfig = getScoreColor(vendor.trust_score);

                  return (
                    <tr
                      key={vendor.id}
                      className="group transition-colors hover:bg-surface-hover/80"
                    >
                      {/* Name */}
                      <td className="px-6 py-4">
                        <Link
                          href={`/vendor/${vendor.id}`}
                          className="font-semibold text-white transition-colors hover:text-brand-light flex items-center gap-2"
                        >
                          <span>{vendor.name}</span>
                          <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100 text-brand-light" />
                        </Link>
                      </td>

                      {/* Industry */}
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-300">
                          {vendor.industry || "Enterprise Cloud / General"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {vendor.status === "PROCESSING" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Multi-Agent Active
                          </span>
                        )}
                        {vendor.status === "COMPLETED" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                            <ShieldCheck className="h-3 w-3" />
                            Analyzed
                          </span>
                        )}
                        {vendor.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-400">
                            Queued
                          </span>
                        )}
                        {vendor.status === "FAILED" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-400">
                            <AlertCircle className="h-3 w-3" />
                            Failed
                          </span>
                        )}
                      </td>

                      {/* Trust Score */}
                      <td className="px-6 py-4">
                        {vendor.trust_score !== null && vendor.trust_score !== undefined ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-bold border ${scoreConfig.badge}`}
                            >
                              {vendor.trust_score} / 100
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">Evaluating...</span>
                        )}
                      </td>

                      {/* Flagged Clauses */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-md border border-surface-border bg-surface-300 px-2 py-0.5 text-xs text-slate-300">
                          <ShieldAlert className="h-3 w-3 text-amber-400" />
                          {vendor.flagged_clauses_count} clauses
                        </span>
                      </td>

                      {/* Alert Triggered */}
                      <td className="px-6 py-4">
                        {vendor.is_alert_triggered ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-400 animate-pulse">
                            <BellRing className="h-3 w-3" />
                            n8n Webhook Fired
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>

                      {/* Ingested At */}
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {formatDate(vendor.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/vendor/${vendor.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-surface-border bg-surface-100 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-brand/40 hover:bg-brand/10 hover:text-brand-light"
                        >
                          <span>Review Dossier</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
