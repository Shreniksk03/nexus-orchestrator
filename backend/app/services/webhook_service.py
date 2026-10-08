import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import httpx

from app.models.schemas import FlaggedClauseItem, WebhookDispatchResult

logger = logging.getLogger("nexus.webhook")

class WebhookService:
    async def dispatch_risk_alert(
        self,
        webhook_url: str,
        vendor_id: str,
        vendor_name: str,
        trust_score: int,
        alert_threshold: int,
        reputation_summary: str,
        overall_reasoning: str,
        flagged_clauses: List[FlaggedClauseItem],
    ) -> WebhookDispatchResult:
        """
        Dispatches an automated high-priority compliance alert payload to the configured n8n webhook.
        """
        if not webhook_url or not webhook_url.strip():
            logger.info("No n8n webhook URL configured. Skipping webhook dispatch.")
            return WebhookDispatchResult(dispatched=False, error="No webhook URL configured")

        # Extract top critical/high clauses for preview
        critical_clauses = [
            {
                "domain": c.domain.value if hasattr(c.domain, "value") else str(c.domain),
                "severity": c.severity.value if hasattr(c.severity, "value") else str(c.severity),
                "clause_text": c.clause_text[:200] + ("..." if len(c.clause_text) > 200 else ""),
                "agent_reasoning": c.agent_reasoning,
            }
            for c in flagged_clauses
            if (c.severity.value if hasattr(c.severity, "value") else str(c.severity)) in ["HIGH", "CRITICAL"]
        ]

        payload: Dict[str, Any] = {
            "event": "VENDOR_RISK_ALERT",
            "source": "Nexus Orchestrator",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "alert_level": "CRITICAL" if trust_score < 50 else "WARNING",
            "vendor": {
                "id": vendor_id,
                "name": vendor_name,
                "trust_score": trust_score,
                "alert_threshold": alert_threshold,
                "score_deficit": alert_threshold - trust_score,
            },
            "compliance_summary": {
                "reputation_overview": reputation_summary,
                "analyst_assessment": overall_reasoning,
                "total_flagged_clauses": len(flagged_clauses),
                "high_priority_findings": critical_clauses,
            },
            "suggested_actions": [
                "Halt MSA execution immediately",
                "Require cyber liability insurance amendment to $10M",
                "Demand SOC 2 Type II remediation verification report",
                "Escalate to General Counsel for indemnification redlines",
            ],
            "channel_notifications": {
                "slack": f":warning: *Nexus Compliance Alert*: Vendor *{vendor_name}* flagged with Trust Score *{trust_score}/100* (Threshold: {alert_threshold}). {len(flagged_clauses)} critical liabilities identified.",
                "email_subject": f"[ACTION REQUIRED] High-Risk Vendor Flagged: {vendor_name} (Score: {trust_score}/100)",
            }
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(webhook_url, json=payload)
                logger.info(f"n8n webhook dispatched to {webhook_url}, status: {response.status_code}")
                return WebhookDispatchResult(
                    dispatched=True,
                    status_code=response.status_code,
                    response_body=response.text[:500],
                )
        except Exception as e:
            logger.error(f"Failed to dispatch n8n webhook: {e}")
            return WebhookDispatchResult(
                dispatched=False,
                error=str(e),
            )


webhook_service = WebhookService()
