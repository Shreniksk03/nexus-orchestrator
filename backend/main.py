import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.extract import router as extract_router
from app.api.settings import router as settings_router
from app.api.vendors import router as vendors_router
from app.core.config import settings
from app.models.schemas import FlaggedClauseItem, RiskDomain, RiskSeverity, VendorStatus
from app.services.db_service import db_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("nexus.main")


async def seed_initial_demo_vendors():
    """Seeds initial realistic vendor records if the database is brand new."""
    existing = await db_service.list_vendors()
    if existing and len(existing) > 0:
        return

    logger.info("Database is empty. Seeding initial benchmark compliance vendors...")

    # Vendor 1: High-Risk Cloud Vendor
    v1_id = await db_service.create_vendor(
        name="Apex Cloud Infrastructure Ltd.",
        contract_text=(
            "MASTER SERVICES AGREEMENT\nBetween Customer and Apex Cloud Infrastructure Ltd.\n\n"
            "Section 8. Limitation of Liability: Vendor's total aggregate liability for any security incident, "
            "unauthorized disclosure, or data breach shall not exceed the fees paid by Customer in the preceding 3 months. "
            "Section 11. Regulatory Compliance: Vendor makes no warranty that services comply with foreign or specialized "
            "regulatory frameworks, including CCPA, GDPR, and SEC Rule 10-K cyber reporting timelines.\n"
            "Section 14. Term and Renewal: Agreement shall automatically renew for successive 24-month periods unless notice "
            "is given 120 days prior to expiration. Fees increase by 15% annually upon renewal."
        ),
    )
    await db_service.update_vendor(
        v1_id,
        {
            "status": VendorStatus.COMPLETED.value,
            "legal_entity_name": "Apex Cloud Infrastructure Ltd.",
            "industry": "Enterprise Cloud & SaaS",
            "trust_score": 38,
            "is_alert_triggered": True,
            "reputation_summary": "Adverse media confirmed: Vendor is subject to an ongoing SEC investigation into undisclosed unauthorized database access in Q3 2025 and a $4.2M FTC penalty.",
            "overall_reasoning": "CRITICAL RISK: Direct contradiction between recent adverse data breach disclosures and contract terms capping cyber liability at 3 months of fees while disclaiming GDPR/SEC warranties.",
        },
    )
    await db_service.save_flagged_clauses(
        v1_id,
        [
            FlaggedClauseItem(
                domain=RiskDomain.INFORMATION_SECURITY,
                severity=RiskSeverity.CRITICAL,
                clause_text="\"Vendor's total aggregate liability for any security incident, unauthorized disclosure, or data breach shall not exceed the fees paid by Customer in the preceding 3 months.\"",
                agent_reasoning="Severely disproportionate liability cap. A 3-month fee cap is insufficient to cover forensic remediation, GDPR fines, and cyber restoration.",
            ),
            FlaggedClauseItem(
                domain=RiskDomain.REGULATORY_COMPLIANCE,
                severity=RiskSeverity.CRITICAL,
                clause_text="\"Vendor makes no warranty that services comply with foreign or specialized regulatory frameworks, including CCPA, GDPR, and SEC Rule 10-K.\"",
                agent_reasoning="Direct contradiction with live adverse media: The vendor was previously investigated by regulatory authorities for delayed breach reporting.",
            ),
            FlaggedClauseItem(
                domain=RiskDomain.FINANCIAL_RISK,
                severity=RiskSeverity.MEDIUM,
                clause_text="\"Agreement shall automatically renew for successive 24-month periods... Fees increase by 15% annually upon renewal.\"",
                agent_reasoning="120-day notice window and fixed 15% annual fee escalation create non-standard financial lock-in.",
            ),
        ],
    )
    await db_service.add_agent_log(
        v1_id, "ORCHESTRATOR", "Pipeline completed in 4.12s. ALERT TRIGGERED: Trust Score (38) < 70.", {"score": 38}
    )

    # Vendor 2: Clean Secure Vendor
    v2_id = await db_service.create_vendor(
        name="Nordic Sentinel Security Systems",
        contract_text=(
            "ENTERPRISE SERVICE LEVEL AGREEMENT\nBetween Customer and Nordic Sentinel Security Systems Oy.\n\n"
            "Section 4. Information Security: Vendor shall maintain SOC 2 Type II and ISO 27001 certifications. "
            "Vendor shall notify Customer within 24 hours of any confirmed security incident.\n"
            "Section 7. Indemnification: Vendor agrees to defend and indemnify Customer against any third-party claims "
            "arising from breach of confidentiality, gross negligence, or IP infringement without arbitrary liability caps.\n"
            "Section 10. Audit Rights: Customer or its designated independent auditor may conduct annual security audits."
        ),
    )
    await db_service.update_vendor(
        v2_id,
        {
            "status": VendorStatus.COMPLETED.value,
            "legal_entity_name": "Nordic Sentinel Security Systems Oy",
            "industry": "Cybersecurity & Infrastructure",
            "trust_score": 94,
            "is_alert_triggered": False,
            "reputation_summary": "Clean reputation profile: Renewed SOC 2 Type II with zero exceptions. No regulatory penalties, active lawsuits, or adverse cyber incidents recorded.",
            "overall_reasoning": "VERIFIED SAFE: Robust 24-hour incident notification window, uncapped mutual indemnification, comprehensive audit rights, and spotless regulatory standing.",
        },
    )
    await db_service.save_flagged_clauses(
        v2_id,
        [
            FlaggedClauseItem(
                domain=RiskDomain.REGULATORY_COMPLIANCE,
                severity=RiskSeverity.LOW,
                clause_text="\"Vendor shall notify Customer within 24 hours of any confirmed security incident.\"",
                agent_reasoning="Exemplary notification window exceeding standard SEC and GDPR guidelines.",
            ),
        ],
    )
    await db_service.add_agent_log(
        v2_id, "ORCHESTRATOR", "Pipeline completed in 3.48s. Vendor approved for expedited onboarding (Score: 94/100).", {"score": 94}
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Nexus Orchestrator Backend...")
    await db_service.init_sqlite()
    await seed_initial_demo_vendors()
    logger.info("Nexus Orchestrator Backend is ready for ingestion.")
    yield
    logger.info("Shutting down Nexus Orchestrator Backend.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Multi-Agent Zero-Touch Compliance Analyst Platform",
    lifespan=lifespan,
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows Next.js frontend on localhost:3000 or any host
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(vendors_router, prefix=settings.API_V1_PREFIX)
app.include_router(settings_router, prefix=settings.API_V1_PREFIX)
app.include_router(extract_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "ONLINE",
        "docs": "/docs",
        "endpoints": {
            "vendors": f"{settings.API_V1_PREFIX}/vendors",
            "settings": f"{settings.API_V1_PREFIX}/settings",
            "extract": f"{settings.API_V1_PREFIX}/extract",
        },
    }
