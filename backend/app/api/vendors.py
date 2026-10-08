import asyncio
from typing import List
from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from app.agents.orchestrator import orchestrator
from app.models.schemas import (
    AgentLogResponse,
    FlaggedClauseResponse,
    RiskDomain,
    RiskSeverity,
    VendorAnalyzeRequest,
    VendorAnalyzeResponse,
    VendorDetailResponse,
    VendorListItem,
    VendorStatus,
)
from app.services.db_service import db_service

router = APIRouter(prefix="/vendors", tags=["Vendors"])


@router.post("/analyze", response_model=VendorAnalyzeResponse, status_code=status.HTTP_202_ACCEPTED)
async def analyze_vendor(payload: VendorAnalyzeRequest, background_tasks: BackgroundTasks):
    """
    Accepts vendor contract and legal name, creates vendor record, and triggers multi-agent pipeline in background.
    """
    if len(payload.name.strip()) < 2:
        raise HTTPException(status_code=400, detail="Vendor name must be at least 2 characters.")
    if len(payload.contract_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Contract text is too short to analyze (minimum 50 characters).")

    # Create vendor record in DB
    vendor_id = await db_service.create_vendor(
        name=payload.name.strip(),
        contract_text=payload.contract_text.strip(),
    )

    # Spawn async background orchestration pipeline
    background_tasks.add_task(
        orchestrator.run_pipeline,
        vendor_id=vendor_id,
        vendor_name=payload.name.strip(),
        contract_text=payload.contract_text.strip(),
    )

    return VendorAnalyzeResponse(
        vendor_id=vendor_id,
        name=payload.name.strip(),
        status=VendorStatus.PENDING,
        message="Multi-agent compliance analysis initiated.",
    )


@router.get("", response_model=List[VendorListItem])
async def list_vendors():
    """
    Returns a list of all vendors with status and trust scores.
    """
    vendors = await db_service.list_vendors()
    items = []
    for v in vendors:
        items.append(
            VendorListItem(
                id=v["id"],
                created_at=v["created_at"],
                updated_at=v["updated_at"],
                name=v["name"],
                status=v.get("status", VendorStatus.PENDING),
                trust_score=v.get("trust_score"),
                industry=v.get("industry"),
                is_alert_triggered=bool(v.get("is_alert_triggered")),
                flagged_clauses_count=v.get("flagged_clauses_count", 0),
            )
        )
    return items


@router.get("/{vendor_id}", response_model=VendorDetailResponse)
async def get_vendor_detail(vendor_id: str):
    """
    Returns the complete vendor profile, including flagged clauses and historical agent reasoning logs.
    """
    vendor = await db_service.get_vendor(vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    flagged_clauses = [
        FlaggedClauseResponse(
            id=fc.get("id", ""),
            vendor_id=fc.get("vendor_id", vendor_id),
            domain=RiskDomain(fc.get("domain", RiskDomain.LEGAL_LIABILITY.value)),
            severity=RiskSeverity(fc.get("severity", RiskSeverity.MEDIUM.value)),
            clause_text=fc.get("clause_text", ""),
            agent_reasoning=fc.get("agent_reasoning", ""),
        )
        for fc in vendor.get("flagged_clauses", [])
    ]

    agent_logs = [
        AgentLogResponse(
            id=log.get("id", ""),
            vendor_id=log.get("vendor_id", vendor_id),
            created_at=log.get("created_at"),
            agent_name=log.get("agent_name"),
            log_message=log.get("log_message", ""),
            metadata=log.get("metadata"),
        )
        for log in vendor.get("agent_logs", [])
    ]

    return VendorDetailResponse(
        id=vendor["id"],
        created_at=vendor["created_at"],
        updated_at=vendor["updated_at"],
        name=vendor["name"],
        status=vendor.get("status", VendorStatus.PENDING),
        contract_text=vendor.get("contract_text"),
        trust_score=vendor.get("trust_score"),
        reputation_summary=vendor.get("reputation_summary"),
        overall_reasoning=vendor.get("overall_reasoning"),
        industry=vendor.get("industry"),
        legal_entity_name=vendor.get("legal_entity_name"),
        is_alert_triggered=bool(vendor.get("is_alert_triggered")),
        error_message=vendor.get("error_message"),
        flagged_clauses=flagged_clauses,
        agent_logs=agent_logs,
    )


@router.get("/{vendor_id}/logs", response_model=List[AgentLogResponse])
async def get_vendor_logs(vendor_id: str):
    """
    Returns the chronologically ordered agent_logs for UI streaming.
    """
    logs = await db_service.get_agent_logs(vendor_id)
    return [
        AgentLogResponse(
            id=log.get("id", ""),
            vendor_id=log.get("vendor_id", vendor_id),
            created_at=log.get("created_at"),
            agent_name=log.get("agent_name"),
            log_message=log.get("log_message", ""),
            metadata=log.get("metadata"),
        )
        for log in logs
    ]
