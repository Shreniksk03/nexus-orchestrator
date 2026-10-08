from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# -------------------------------------------------------------
# Enums
# -------------------------------------------------------------
class VendorStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class RiskDomain(str, Enum):
    INFORMATION_SECURITY = "INFORMATION_SECURITY"
    FINANCIAL_RISK = "FINANCIAL_RISK"
    LEGAL_LIABILITY = "LEGAL_LIABILITY"
    REGULATORY_COMPLIANCE = "REGULATORY_COMPLIANCE"


class RiskSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AgentName(str, Enum):
    ROUTER = "ROUTER"
    RESEARCHER = "RESEARCHER"
    ANALYST = "ANALYST"
    ORCHESTRATOR = "ORCHESTRATOR"


# -------------------------------------------------------------
# Agent Output Models (Strict Schemas)
# -------------------------------------------------------------
class RouterOutput(BaseModel):
    legal_entity_name: str = Field(..., description="The verified exact legal entity name")
    industry: str = Field(..., description="The primary industry sector of the vendor")
    requires_heavy_legal_review: bool = Field(
        True, description="Flag indicating if the agreement warrants deep legal cross-referencing"
    )


class ResearcherOutput(BaseModel):
    reputation_summary: str = Field(
        ..., description="Synthesized live reputation report based on Tavily adverse media search"
    )
    found_adverse_media: bool = Field(
        ..., description="True if lawsuits, data breaches, regulatory fines or negative signals were found"
    )
    key_findings: List[str] = Field(
        default_factory=list, description="Bullet points of critical adverse findings"
    )


class FlaggedClauseItem(BaseModel):
    domain: RiskDomain = Field(..., description="Target risk domain")
    severity: RiskSeverity = Field(..., description="Severity level")
    clause_text: str = Field(..., description="Exact or quoted contract clause text")
    agent_reasoning: str = Field(..., description="In-depth reasoning connecting contract clause to risk/reputation")


class AnalystOutput(BaseModel):
    trust_score: int = Field(..., ge=0, le=100, description="Final calculated Trust Score from 0 to 100")
    overall_reasoning: str = Field(..., description="Holistic risk assessment and executive synthesis")
    flagged_clauses: List[FlaggedClauseItem] = Field(
        default_factory=list, description="List of identified risky clauses"
    )


# -------------------------------------------------------------
# API Request & Response Models
# -------------------------------------------------------------
class VendorAnalyzeRequest(BaseModel):
    name: str = Field(..., min_length=2, description="Vendor legal or brand name")
    contract_text: str = Field(..., min_length=50, description="Extracted plain text of the contract/MSA")


class VendorAnalyzeResponse(BaseModel):
    vendor_id: str
    name: str
    status: VendorStatus
    message: str


class FlaggedClauseResponse(BaseModel):
    id: str
    vendor_id: str
    domain: RiskDomain
    severity: RiskSeverity
    clause_text: str
    agent_reasoning: str


class AgentLogResponse(BaseModel):
    id: str
    vendor_id: str
    created_at: datetime
    agent_name: AgentName
    log_message: str
    metadata: Optional[Dict[str, Any]] = None


class VendorDetailResponse(BaseModel):
    id: str
    created_at: datetime
    updated_at: datetime
    name: str
    status: VendorStatus
    contract_text: Optional[str] = None
    trust_score: Optional[int] = None
    reputation_summary: Optional[str] = None
    overall_reasoning: Optional[str] = None
    industry: Optional[str] = None
    legal_entity_name: Optional[str] = None
    is_alert_triggered: bool = False
    error_message: Optional[str] = None
    flagged_clauses: List[FlaggedClauseResponse] = []
    agent_logs: List[AgentLogResponse] = []


class VendorListItem(BaseModel):
    id: str
    created_at: datetime
    updated_at: datetime
    name: str
    status: VendorStatus
    trust_score: Optional[int] = None
    industry: Optional[str] = None
    is_alert_triggered: bool = False
    flagged_clauses_count: int = 0


class AppSettingsModel(BaseModel):
    id: Optional[str] = None
    webhook_url: str = Field(default="", description="Target n8n webhook URL for alerts")
    alert_threshold: int = Field(default=70, ge=1, le=100, description="Trust Score cutoff threshold")
    updated_at: Optional[datetime] = None


class SettingsUpdateRequest(BaseModel):
    webhook_url: str = Field(default="")
    alert_threshold: int = Field(default=70, ge=1, le=100)


class WebhookTestRequest(BaseModel):
    webhook_url: Optional[str] = None
    test_score: int = 42
    vendor_name: str = "Test Cyber Vendor Inc."


class WebhookDispatchResult(BaseModel):
    dispatched: bool
    status_code: Optional[int] = None
    response_body: Optional[str] = None
    error: Optional[str] = None
