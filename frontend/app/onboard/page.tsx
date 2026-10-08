"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  Building2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { extractDocumentText, submitVendorAnalysis } from "@/lib/api";
import { SAMPLE_CONTRACTS, SampleContract } from "@/lib/sample-contracts";
import { VendorUploadSchema } from "@/lib/schemas";

export default function OnboardPage() {
  const router = useRouter();
  const [vendorName, setVendorName] = useState("");
  const [contractText, setContractText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file);
    setIsExtracting(true);
    setErrorMessage(null);

    try {
      const res = await extractDocumentText(file);
      setContractText(res.text);
      if (!vendorName) {
        // Autodetect clean filename as default name
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ")
          .replace(/msa|sla|agreement|contract/gi, "")
          .trim();
        if (cleanName.length >= 2) {
          setVendorName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to parse document text.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSelectSample = (sample: SampleContract) => {
    setSelectedSampleId(sample.id);
    setVendorName(sample.vendorName);
    setContractText(sample.contractText);
    setSelectedFile(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Zod validation
    const validation = VendorUploadSchema.safeParse({
      name: vendorName.trim(),
      contract_text: contractText.trim(),
    });

    if (!validation.success) {
      const issues = validation.error.issues.map((i) => i.message).join(". ");
      setErrorMessage(issues);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitVendorAnalysis({
        name: vendorName.trim(),
        contract_text: contractText.trim(),
      });
      // Redirect to vendor report page immediately
      router.push(`/vendor/${res.vendor_id}`);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while dispatching the pipeline.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        title="Vendor Contract Ingestion"
        subtitle="Upload Master Service Agreements (MSAs) or Paste Legal Text for Multi-Agent Analysis"
      />

      <div className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Benchmark Test Loaders */}
        <div className="rounded-3xl border border-surface-border bg-surface-200/90 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-brand-light" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                1-Click Benchmark MSA Templates
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Select a pre-configured scenario to test the multi-agent pipeline
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SAMPLE_CONTRACTS.map((sample) => {
              const isSelected = selectedSampleId === sample.id;
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className={`text-left rounded-2xl border p-4 transition-all duration-200 ${
                    isSelected
                      ? "border-brand bg-brand/10 shadow-lg shadow-brand/10"
                      : "border-surface-border bg-surface-100 hover:border-surface-hover hover:bg-surface-hover"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider rounded px-2 py-0.5 border ${
                        sample.expectedRisk === "CRITICAL"
                          ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                          : sample.expectedRisk === "MODERATE"
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      {sample.expectedRisk} RISK
                    </span>
                    {isSelected && (
                      <CheckCircle className="h-4 w-4 text-brand-light" />
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-white mb-1">
                    {sample.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {sample.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Ingestion Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-3xl border border-surface-border bg-surface-200/90 p-8 shadow-xl space-y-6">
            {/* Vendor Legal Name */}
            <div className="space-y-2">
              <label
                htmlFor="vendor-name"
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                <Building2 className="h-4 w-4 text-brand-light" />
                <span>Vendor Legal Entity Name</span>
                <span className="text-rose-400">*</span>
              </label>
              <input
                id="vendor-name"
                type="text"
                required
                placeholder="e.g. Apex Cloud Infrastructure Ltd. or Acme Corp"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full rounded-xl border border-surface-border bg-surface-300/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand shadow-inner font-medium"
              />
            </div>

            {/* Document Upload Zone */}
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                <span className="flex items-center gap-2">
                  <UploadCloud className="h-4 w-4 text-indigo-400" />
                  <span>Upload Contract Document (PDF or TXT)</span>
                </span>
                {isExtracting && (
                  <span className="text-xs text-brand-light animate-pulse font-normal">
                    Extracting document text...
                  </span>
                )}
              </label>

              <div className="relative rounded-2xl border-2 border-dashed border-surface-border hover:border-brand/50 bg-surface-300/50 p-6 text-center transition-colors">
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="rounded-xl bg-indigo-500/10 p-3 text-brand-light border border-indigo-500/20">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    {selectedFile ? selectedFile.name : "Drag and drop or click to browse"}
                  </div>
                  <p className="text-xs text-slate-400">
                    Supports Master Service Agreements (MSAs), SLAs, and DPAs in PDF or Plain Text.
                  </p>
                </div>
              </div>
            </div>

            {/* Contract Text Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-cyan-400" />
                  <span>Contract Plain Text</span>
                  <span className="text-rose-400">*</span>
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                  {contractText.length} characters (min 50)
                </span>
              </div>
              <textarea
                rows={10}
                required
                placeholder="Paste the contract or legal agreement clauses here..."
                value={contractText}
                onChange={(e) => setContractText(e.target.value)}
                className="w-full rounded-xl border border-surface-border bg-surface-300/80 p-4 font-mono text-xs text-slate-200 placeholder-slate-500 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand shadow-inner leading-relaxed"
              />
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-surface-border">
              <button
                type="submit"
                disabled={isSubmitting || isExtracting}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-brand/25 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Cpu className="h-4 w-4 animate-spin" />
                    <span>Orchestrating Multi-Agent Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Run Multi-Agent Compliance Pipeline</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
