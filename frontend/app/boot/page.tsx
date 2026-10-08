"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Lock, Activity, ShieldCheck } from "lucide-react";

interface BootStep {
  text: string;
  badge?: string;
  delayMs: number;
}

const BOOT_LOGS: BootStep[] = [
  { text: "Initializing Nexus Orchestrator...", delayMs: 400 },
  { text: "System Status: OK", badge: "[ READY ]", delayMs: 1000 },
  { text: "Connecting to secure mainframe...", delayMs: 1600 },
  { text: "103 automated tests, all passing.", badge: "[ 100% VERIFIED ]", delayMs: 2200 },
];

export default function BootSequencePage() {
  const router = useRouter();
  const [visibleLogs, setVisibleLogs] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Reveal lines sequentially
    BOOT_LOGS.forEach((step, index) => {
      setTimeout(() => {
        setVisibleLogs((prev) => Math.max(prev, index + 1));
        setProgress(Math.round(((index + 1) / BOOT_LOGS.length) * 100));
      }, step.delayMs);
    });

    // After the final line, hold for 1000ms (1 second), then redirect to /dashboard
    const lastStep = BOOT_LOGS[BOOT_LOGS.length - 1];
    const totalHoldDelay = lastStep.delayMs + 1000;

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 400); // smooth exit transition
    }, totalHoldDelay);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <AnimatePresence>
      {!isExiting ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, y: -30 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex h-full w-full flex-col items-center justify-center bg-black p-6 font-mono text-white select-none overflow-hidden"
        >
          {/* Subtle CRT Scanline effect */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.6)_51%)] bg-[length:100%_4px] opacity-25" />

          <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-slate-800 bg-[#070b14]/95 p-8 shadow-[0_0_90px_rgba(99,102,241,0.2)] backdrop-blur-2xl">
            {/* Window Header */}
            <div className="mb-6 flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500 animate-pulse" />
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                </div>
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400">
                  <Terminal className="h-4 w-4" />
                  <span>NEXUS-BOOT-KERNEL // v1.0.0</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[11px] font-semibold text-emerald-400">
                  SECURE BOOT
                </span>
              </div>
            </div>

            {/* Sequential Terminal Log Lines */}
            <div className="min-h-[200px] space-y-4 font-mono text-sm sm:text-base">
              {BOOT_LOGS.slice(0, visibleLogs).map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-indigo-400 font-bold">&gt;</span>
                    <span className="text-slate-100">{log.text}</span>
                  </div>

                  {log.badge && (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="shrink-0 rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-cyan-300 border border-indigo-500/40"
                    >
                      {log.badge}
                    </motion.span>
                  )}
                </motion.div>
              ))}

              {/* Blinking Cursor */}
              <div className="flex items-center gap-2 pt-2 text-indigo-400">
                <span className="font-bold">&gt;</span>
                <span className="inline-block h-4 w-2 animate-pulse bg-indigo-400" />
              </div>
            </div>

            {/* Progress Bar & Telemetry Footer */}
            <div className="mt-8 space-y-3 border-t border-slate-800/80 pt-5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Activity className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Loading System Console</span>
                </span>
                <span className="font-bold text-indigo-300">{progress}%</span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.3 }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>NVIDIA Nemotron 3 Swarm: OK</span>
                <span>Tavily OSINT: OK</span>
                <span>n8n Webhook: OK</span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
