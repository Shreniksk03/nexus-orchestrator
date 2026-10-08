"use client";

import { useEffect, useState } from "react";
import {
  Sliders,
  BellRing,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Radio,
  Database,
  Send,
  Sparkles,
  ShieldAlert,
  Save,
  Globe,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { fetchSettings, testWebhook, updateSettings } from "@/lib/api";
import { AppSettings, SettingsSchema, WebhookDispatchResult } from "@/lib/schemas";

export default function SettingsPage() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [alertThreshold, setAlertThreshold] = useState(70);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<WebhookDispatchResult | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings()
      .then((data) => {
        setWebhookUrl(data.webhook_url || "");
        setAlertThreshold(data.alert_threshold ?? 70);
      })
      .catch((err) => console.error("Failed to load settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setErrorMessage(null);

    const validation = SettingsSchema.safeParse({
      webhook_url: webhookUrl.trim(),
      alert_threshold: Number(alertThreshold),
    });

    if (!validation.success) {
      const issues = validation.error.issues.map((i) => i.message).join(". ");
      setErrorMessage(issues);
      return;
    }

    setSaving(true);
    try {
      await updateSettings({
        webhook_url: webhookUrl.trim(),
        alert_threshold: Number(alertThreshold),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    setTesting(true);
    setTestResult(null);
    setErrorMessage(null);

    try {
      const res = await testWebhook(webhookUrl.trim(), "Nexus Diagnostic Vendor Corp", 42);
      setTestResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || "Webhook test request failed");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        title="Settings & Integrations"
        subtitle="Configure n8n Automated Webhooks, Alert Thresholds, and AI Model Endpoints"
      />

      <div className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-8">
        {/* Settings Form Card */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-3xl border border-surface-border bg-surface-200/90 p-8 shadow-xl space-y-8">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BellRing className="h-5 w-5 text-brand-light" />
                <span>Autonomous n8n Compliance Webhook</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Whenever a vendor's calculated Trust Score falls below your threshold, Nexus Orchestrator
                will immediately dispatch an actionable payload to your n8n workflow for automated Slack, Teams, or WhatsApp escalation.
              </p>
            </div>

            {/* Webhook URL Input */}
            <div className="space-y-2">
              <label
                htmlFor="webhook-url"
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                <Globe className="h-4 w-4 text-indigo-400" />
                <span>n8n Webhook Target URL</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="webhook-url"
                  type="url"
                  placeholder="https://your-n8n-instance.com/webhook/nexus-compliance-alert"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="flex-1 rounded-xl border border-surface-border bg-surface-300/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand shadow-inner font-mono"
                />
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={testing || !webhookUrl}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-100 px-4 py-3 text-xs font-semibold text-slate-200 hover:bg-surface-hover hover:text-white transition-all disabled:opacity-50"
                >
                  <Send className={`h-3.5 w-3.5 ${testing ? "animate-spin" : ""}`} />
                  <span>{testing ? "Testing..." : "Send Test Payload"}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Leave empty to run in simulated mode, or enter your live n8n webhook endpoint.
              </p>
            </div>

            {/* Test Payload Diagnostic Result */}
            {testResult && (
              <div
                className={`rounded-2xl border p-4 text-xs space-y-2 ${
                  testResult.dispatched
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    {testResult.dispatched ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-rose-400" />
                    )}
                    {testResult.dispatched
                      ? `Dispatched successfully (HTTP ${testResult.status_code || 200})`
                      : `Dispatch Failed: ${testResult.error}`}
                  </span>
                </div>
                {testResult.response_body && (
                  <div className="rounded-lg bg-black/40 p-2.5 font-mono text-[11px] overflow-x-auto">
                    {testResult.response_body}
                  </div>
                )}
              </div>
            )}

            {/* Trust Score Threshold Slider */}
            <div className="space-y-4 pt-4 border-t border-surface-border">
              <div className="flex items-center justify-between">
                <div>
                  <label
                    htmlFor="alert-threshold"
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300"
                  >
                    <Sliders className="h-4 w-4 text-amber-400" />
                    <span>Trust Score Alert Cutoff Threshold</span>
                  </label>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Vendors scoring strictly below this cutoff will be flagged as High Risk and trigger automated alerts.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold text-brand-light">
                    {alertThreshold}
                  </span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
              </div>

              <input
                id="alert-threshold"
                type="range"
                min="1"
                max="100"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Number(e.target.value))}
                className="w-full h-2 bg-surface-300 rounded-lg appearance-none cursor-pointer accent-brand"
              />

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="text-rose-400">0 (Permissive)</span>
                <span className="text-amber-400 font-semibold">70 (Enterprise Recommended)</span>
                <span className="text-emerald-400">100 (Strict)</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Save Button */}
            <div className="flex items-center justify-between pt-4 border-t border-surface-border">
              {saveSuccess ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Settings updated successfully!</span>
                </span>
              ) : (
                <span />
              )}

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-brand/25 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? "Saving..." : "Save Configuration"}</span>
              </button>
            </div>
          </div>
        </form>

        {/* AI & Infrastructure Health Cards */}
        <div className="rounded-3xl border border-surface-border bg-surface-200/90 p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">
              AI & Orchestration Infrastructure Health
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-surface-border bg-surface-300/80 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-300">The Router</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <p className="font-mono text-xs text-white">Nemotron Nano</p>
              <p className="text-[10px] text-slate-400">Fast Entity Extraction</p>
            </div>

            <div className="rounded-2xl border border-surface-border bg-surface-300/80 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-300">The Researcher</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <p className="font-mono text-xs text-white">Nemotron Super</p>
              <p className="text-[10px] text-slate-400">Tavily Live Web OSINT</p>
            </div>

            <div className="rounded-2xl border border-surface-border bg-surface-300/80 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-300">Legal Analyst</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <p className="font-mono text-xs text-white">Nemotron 3 Ultra</p>
              <p className="text-[10px] text-slate-400">Heavy Contract Reasoning</p>
            </div>

            <div className="rounded-2xl border border-surface-border bg-surface-300/80 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-300">Database Engine</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <p className="font-mono text-xs text-white">PostgreSQL / Supabase</p>
              <p className="text-[10px] text-slate-400">pgvector & RLS Enabled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
