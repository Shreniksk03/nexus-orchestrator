import { z } from "zod";

// Zod Validation Schemas as mandated by requirement #16
export const VendorUploadSchema = z.object({
  name: z.string().min(2, "Vendor name must be at least 2 characters"),
  contract_text: z.string().min(50, "Contract text is too short to analyze (minimum 50 characters)"),
});

export const SettingsSchema = z.object({
  webhook_url: z.string().url("Must be a valid URL").or(z.literal("")),
  alert_threshold: z.number().min(1, "Threshold must be at least 1").max(100, "Threshold cannot exceed 100"),
});

// TypeScript Types
export type VendorUploadInput = z.infer<typeof VendorUploadSchema>;
export type SettingsInput = z.infer<typeof SettingsSchema>;

export type VendorStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export type RiskDomain =
  | "INFORMATION_SECURITY"
  | "FINANCIAL_RISK"
  | "LEGAL_LIABILITY"
  | "REGULATORY_COMPLIANCE";

export type RiskSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AgentName = "ROUTER" | "RESEARCHER" | "ANALYST" | "ORCHESTRATOR";

export interface FlaggedClause {
  id: string;
  vendor_id: string;
  domain: RiskDomain;
  severity: RiskSeverity;
  clause_text: string;
  agent_reasoning: string;
}

export interface AgentLog {
  id: string;
  vendor_id: string;
  created_at: string;
  agent_name: AgentName;
  log_message: string;
  metadata?: Record<string, any>;
}

export interface VendorListItem {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  status: VendorStatus;
  trust_score?: number | null;
  industry?: string | null;
  is_alert_triggered: boolean;
  flagged_clauses_count: number;
}

export interface VendorDetail {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  status: VendorStatus;
  contract_text?: string | null;
  trust_score?: number | null;
  reputation_summary?: string | null;
  overall_reasoning?: string | null;
  industry?: string | null;
  legal_entity_name?: string | null;
  is_alert_triggered: boolean;
  error_message?: string | null;
  flagged_clauses: FlaggedClause[];
  agent_logs: AgentLog[];
}

export interface AppSettings {
  id?: string;
  webhook_url: string;
  alert_threshold: number;
  updated_at?: string;
}

export interface WebhookDispatchResult {
  dispatched: boolean;
  status_code?: number | null;
  response_body?: string | null;
  error?: string | null;
}
