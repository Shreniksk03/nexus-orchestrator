import logging
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    AppSettingsModel,
    FlaggedClauseItem,
    RiskDomain,
    RiskSeverity,
    SettingsUpdateRequest,
    WebhookDispatchResult,
    WebhookTestRequest,
)
from app.services.db_service import db_service
from app.services.webhook_service import webhook_service

logger = logging.getLogger("nexus.api.settings")
router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("", response_model=AppSettingsModel)
async def get_settings():
    """
    Returns current global application settings including the n8n webhook URL and threshold.
    """
    res = await db_service.get_settings()
    return AppSettingsModel(
        id=res.get("id"),
        webhook_url=res.get("webhook_url", ""),
        alert_threshold=int(res.get("alert_threshold", 70)),
        updated_at=res.get("updated_at"),
    )


@router.post("/webhook", response_model=AppSettingsModel)
async def update_settings(payload: SettingsUpdateRequest):
    """
    Updates the n8n webhook URL and alert threshold.
    """
    updated = await db_service.update_settings(
        webhook_url=payload.webhook_url.strip(),
        alert_threshold=payload.alert_threshold,
    )
    return AppSettingsModel(
        webhook_url=updated["webhook_url"],
        alert_threshold=updated["alert_threshold"],
        updated_at=updated.get("updated_at"),
    )


@router.post("/test-webhook", response_model=WebhookDispatchResult)
async def test_webhook(payload: WebhookTestRequest):
    """
    Sends a sample test alert payload to the specified or stored n8n webhook URL.
    """
    target_url = payload.webhook_url
    if not target_url:
        stored = await db_service.get_settings()
        target_url = stored.get("webhook_url")

    if not target_url:
        raise HTTPException(status_code=400, detail="No webhook URL provided or configured in settings.")

    sample_clauses = [
        FlaggedClauseItem(
            domain=RiskDomain.INFORMATION_SECURITY,
            severity=RiskSeverity.CRITICAL,
            clause_text="\"Vendor aggregate liability for cybersecurity incidents capped at $5,000.\"",
            agent_reasoning="Disproportionately low liability cap relative to enterprise data sensitivity.",
        ),
        FlaggedClauseItem(
            domain=RiskDomain.REGULATORY_COMPLIANCE,
            severity=RiskSeverity.HIGH,
            clause_text="\"Vendor disclaims warranty of regulatory compliance under SEC Rule 10-K.\"",
            agent_reasoning="Disclaims mandatory regulatory incident reporting cooperation.",
        ),
    ]

    res = await webhook_service.dispatch_risk_alert(
        webhook_url=target_url,
        vendor_id="00000000-0000-0000-0000-000000000001",
        vendor_name=payload.vendor_name,
        trust_score=payload.test_score,
        alert_threshold=70,
        reputation_summary="Test automated risk notification triggered via Nexus Orchestrator.",
        overall_reasoning="Simulated diagnostic payload to verify end-to-end Slack / WhatsApp webhook routing.",
        flagged_clauses=sample_clauses,
    )

    return res
