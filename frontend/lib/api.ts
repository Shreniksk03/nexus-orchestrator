import {
  AppSettings,
  SettingsInput,
  VendorDetail,
  VendorListItem,
  VendorUploadInput,
  WebhookDispatchResult,
  AgentLog,
} from "./schemas";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function fetchVendors(): Promise<VendorListItem[]> {
  const res = await fetch(`${API_BASE}/api/v1/vendors`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch vendors: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchVendorDetail(vendorId: string): Promise<VendorDetail> {
  const res = await fetch(`${API_BASE}/api/v1/vendors/${vendorId}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch vendor detail: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchVendorLogs(vendorId: string): Promise<AgentLog[]> {
  const res = await fetch(`${API_BASE}/api/v1/vendors/${vendorId}/logs`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch vendor logs: ${res.statusText}`);
  }
  return res.json();
}

export async function submitVendorAnalysis(
  payload: VendorUploadInput
): Promise<{ vendor_id: string; name: string; status: string; message: string }> {
  const res = await fetch(`${API_BASE}/api/v1/vendors/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errData.detail || "Failed to submit vendor for analysis");
  }
  return res.json();
}

export async function extractDocumentText(file: File): Promise<{
  filename: string;
  text: string;
  char_count: number;
  page_count: number;
}> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/v1/extract`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errData.detail || "Failed to extract text from document");
  }
  return res.json();
}

export async function fetchSettings(): Promise<AppSettings> {
  const res = await fetch(`${API_BASE}/api/v1/settings`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch settings: ${res.statusText}`);
  }
  return res.json();
}

export async function updateSettings(payload: SettingsInput): Promise<AppSettings> {
  const res = await fetch(`${API_BASE}/api/v1/settings/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errData.detail || "Failed to update settings");
  }
  return res.json();
}

export async function testWebhook(
  webhookUrl?: string,
  vendorName: string = "Diagnostic Vendor Corp",
  testScore: number = 42
): Promise<WebhookDispatchResult> {
  const res = await fetch(`${API_BASE}/api/v1/settings/test-webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      webhook_url: webhookUrl,
      vendor_name: vendorName,
      test_score: testScore,
    }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errData.detail || "Webhook test dispatch failed");
  }
  return res.json();
}
