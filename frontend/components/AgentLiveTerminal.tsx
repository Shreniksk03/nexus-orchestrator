"use client";

import { useEffect, useRef, useState } from "react";
import {
  Terminal,
  Copy,
  Check,
  Download,
  Pause,
  Play,
  Maximize2,
  ChevronDown,
  ChevronRight,
  Cpu,
  Layers,
  Sparkles,
} from "lucide-react";
import { AgentLog } from "@/lib/schemas";
import { formatDate } from "@/lib/utils";

interface AgentLiveTerminalProps {
  logs: AgentLog[];
  vendorName?: string;
  isLive?: boolean;
}

export function AgentLiveTerminal({
  logs,
  vendorName = "Vendor",
  isLive = false,
}: AgentLiveTerminalProps) {
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedMeta, setExpandedMeta] = useState<Record<string, boolean>>({});
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const handleCopyLogs = () => {
    const text = logs
      .map(
        (l) =>
          `[${l.created_at}] [${l.agent_name}] ${l.log_message}${
            l.metadata ? `\nMETADATA: ${JSON.stringify(l.metadata, null, 2)}` : ""
          }`
      )
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTranscript = () => {
    const text = logs
      .map(
        (l) =>
          `[${l.created_at}] [${l.agent_name}] ${l.log_message}${
            l.metadata ? `\nMETADATA: ${JSON.stringify(l.metadata, null, 2)}` : ""
          }`
      )
      .join("\n\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nexus-orchestrator-audit-${vendorName.toLowerCase().replace(/\s+/g, "-")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleMeta = (id: string) => {
    setExpandedMeta((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getAgentBadge = (agent: string) => {
    switch (agent) {
      case "ROUTER":
        return {
          label: "Nemotron Nano (Router)",
          className: "bg-purple-500/20 text-purple-300 border-purple-500/40",
        };
      case "RESEARCHER":
        return {
          label: "Nemotron Super + Tavily (Researcher)",
          className: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
        };
      case "ANALYST":
        return {
          label: "Nemotron 3 Ultra (Legal Analyst)",
          className: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        };
      case "ORCHESTRATOR":
      default:
        return {
          label: "Nexus Orchestrator",
          className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        };
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-surface-border bg-[#0a0f1d] shadow-2xl">
      {/* Terminal Header / Window Controls */}
      <div className="flex items-center justify-between border-b border-surface-border/80 bg-[#0d1424] px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Mac OS Window Controls */}
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-rose-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-2 pl-2">
            <Terminal className="h-4 w-4 text-brand-light" />
            <span className="font-mono text-xs font-semibold text-slate-200">
              nexus-agent-reasoning-stream.log
            </span>
            {isLive && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                LIVE STREAM
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
              autoScroll
                ? "bg-brand/20 text-brand-light border border-brand/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title={autoScroll ? "Pause auto-scroll" : "Resume auto-scroll"}
          >
            {autoScroll ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            <span>{autoScroll ? "Auto-Scroll On" : "Auto-Scroll Off"}</span>
          </button>

          <button
            onClick={handleCopyLogs}
            className="flex items-center gap-1 rounded-md border border-surface-border bg-surface-200 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-surface-hover hover:text-white transition-colors"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            onClick={handleDownloadTranscript}
            className="flex items-center gap-1 rounded-md border border-surface-border bg-surface-200 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-surface-hover hover:text-white transition-colors"
          >
            <Download className="h-3 w-3" />
            <span>Audit Log</span>
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="max-h-[480px] min-h-[260px] overflow-y-auto p-4 font-mono text-xs text-slate-300 space-y-3 scrollbar-thin scrollbar-thumb-surface-border">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Cpu className="h-8 w-8 mb-2 animate-pulse text-indigo-400" />
            <p className="text-slate-400">Waiting for agent orchestration stream...</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Nemotron Nano, Super, and 3 Ultra will stream reasoning steps here.
            </p>
          </div>
        ) : (
          logs.map((log) => {
            const badge = getAgentBadge(log.agent_name);
            const isExpanded = expandedMeta[log.id];

            return (
              <div
                key={log.id}
                className="group rounded-xl border border-surface-border/40 bg-[#0d1424]/60 p-3 transition-colors hover:border-surface-border hover:bg-[#0d1424]"
              >
                {/* Log Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-surface-border/30">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatDate(log.created_at)}
                    </span>
                  </div>

                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <button
                      onClick={() => toggleMeta(log.id)}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-brand-light"
                    >
                      <span>JSON Metadata</span>
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>

                {/* Log Message */}
                <div className="pt-2 text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {log.log_message}
                </div>

                {/* Metadata JSON Drawer */}
                {isExpanded && log.metadata && (
                  <div className="mt-2.5 rounded-lg border border-surface-border/60 bg-[#060a14] p-3 text-[11px] text-indigo-300">
                    <pre className="overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
