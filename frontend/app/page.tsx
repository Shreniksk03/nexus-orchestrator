"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Cpu,
  Sparkles,
  ArrowRight,
  Zap,
  Activity,
  Radio,
  Play,
  Terminal,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { InteractiveBackground } from "@/components/InteractiveBackground";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      {/* 3D Interactive Agent Node Network Background */}
      <InteractiveBackground />

      {/* Top Navigation Bar */}
      <header className="relative z-20 flex h-24 w-full items-center justify-between px-8 max-w-7xl mx-auto pointer-events-auto">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/30 transition-transform duration-300 group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-black">
              <ShieldCheck className="h-6 w-6 text-indigo-400" />
            </div>
            <div className="absolute -inset-1 -z-10 rounded-2xl bg-indigo-500 opacity-40 blur-md transition-all group-hover:opacity-80" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-white">NEXUS</span>
              <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                ORCHESTRATOR
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Zero-Touch Compliance Analyst</p>
          </div>
        </Link>

        {/* Live Swarm Telemetry Badges */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/80 px-4 py-2 text-xs backdrop-blur-md shadow-inner">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-slate-300">NVIDIA Nemotron Swarm</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span className="font-mono text-slate-300">Tavily OSINT</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-400" />
            <span className="font-mono text-slate-300">n8n Automation</span>
          </div>
        </div>

        {/* Quick Launch CTA */}
        <Link
          href="/boot"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900/90 border border-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all backdrop-blur-md shadow-lg"
        >
          <Terminal className="h-3.5 w-3.5 text-indigo-400" />
          <span>Quick Boot</span>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="relative z-20 flex-1 max-w-6xl mx-auto px-8 flex flex-col items-center justify-center text-center space-y-8 my-auto py-8 pointer-events-auto">
        {/* Animated Architecture Pill */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-md shadow-lg shadow-indigo-500/10"
        >
          <Sparkles className="h-4 w-4 text-cyan-300 animate-pulse" />
          <span>Multi-Agent NVIDIA Nemotron Compliance Architecture</span>
          <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />
        </motion.div>

        {/* Title: NEXUS ORCHESTRATOR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-white">
            NEXUS{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(99,102,241,0.5)]">
              ORCHESTRATOR
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Zero-Touch Third-Party Risk & Contract Compliance Analyst.
          </p>
        </motion.div>

        {/* Subtitle description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          Autonomous agents cross-reference Master Service Agreements with live adverse media,
          lawsuits, and SEC fines to calculate an objective Trust Score with instant n8n alerts.
        </motion.p>

        {/* Primary Call-to-Action: Launch System Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Link href="/boot" className="group relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-purple-600 opacity-80 blur-lg transition duration-500 group-hover:opacity-100 group-hover:blur-xl animate-pulse" />
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="relative flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 px-9 py-4 text-base font-bold text-white shadow-2xl transition-all"
            >
              <Play className="h-5 w-5 fill-current text-white" />
              <span>Launch System</span>
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
            </motion.div>
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/80 px-7 py-4 text-sm font-semibold text-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-700 transition-all backdrop-blur-md"
          >
            <Activity className="h-4 w-4 text-indigo-400" />
            <span>Command Center</span>
          </Link>
        </motion.div>

        {/* Metric Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-8"
        >
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 backdrop-blur-md text-left shadow-lg">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Processing Speed
            </span>
            <div className="mt-1 text-xl font-bold text-white">2.4 Seconds</div>
            <p className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> vs 15h manual review
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 backdrop-blur-md text-left shadow-lg">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              AI Agent Swarm
            </span>
            <div className="mt-1 text-xl font-bold text-indigo-300">Nemotron 3</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Nano, Super, 3 Ultra</p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 backdrop-blur-md text-left shadow-lg">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Target Domains
            </span>
            <div className="mt-1 text-xl font-bold text-cyan-300">4 Categories</div>
            <p className="text-[10px] text-slate-400 mt-0.5">InfoSec, Legal, Fin, Reg</p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 backdrop-blur-md text-left shadow-lg">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Alert Trigger
            </span>
            <div className="mt-1 text-xl font-bold text-rose-400">n8n Webhook</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Automated Slack/WhatsApp</p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 py-6 text-center text-xs text-slate-500 pointer-events-auto">
        Nexus Orchestrator • Zero-Touch Compliance Multi-Agent Engine
      </footer>
    </div>
  );
}
