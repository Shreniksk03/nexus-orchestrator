import asyncio
import logging
import time
from typing import Optional
from app.agents.analyst import analyst_agent
from app.agents.researcher import researcher_agent
from app.agents.router import router_agent
from app.models.schemas import AgentName, VendorStatus
from app.services.db_service import db_service
from app.services.webhook_service import webhook_service

logger = logging.getLogger("nexus.orchestrator")

class NexusOrchestrator:
    async def run_pipeline(self, vendor_id: str, vendor_name: str, contract_text: str):
        """
        Executes the autonomous multi-agent compliance pipeline end-to-end.
        """
        start_time = time.time()
        logger.info(f"Starting compliance pipeline for vendor {vendor_id} ({vendor_name})")

        try:
            # Update status to PROCESSING
            await db_service.update_vendor(vendor_id, {"status": VendorStatus.PROCESSING.value})
            
            await db_service.add_agent_log(
                vendor_id=vendor_id,
                agent_name=AgentName.ORCHESTRATOR.value,
                log_message=f"Pipeline initialized for '{vendor_name}'. Ingesting Master Service Agreement ({len(contract_text)} characters).",
                metadata={"stage": "INIT", "contract_length": len(contract_text)},
            )
            await asyncio.sleep(0.5)

            # -------------------------------------------------------------
            # Step 1: The Router Agent (Nemotron Nano)
            # -------------------------------------------------------------
            await db_service.add_agent_log(
                vendor_id=vendor_id,
                agent_name=AgentName.ROUTER.value,
                log_message=f"Analyzing vendor '{vendor_name}' and contract scope. Extracting legal entity name and industry classification...",
                metadata={"model": "nvidia/nemotron-nano", "task": "entity_extraction"},
            )

            router_output = await router_agent.analyze(vendor_name, contract_text)

            await db_service.update_vendor(
                vendor_id,
                {
                    "legal_entity_name": router_output.legal_entity_name,
                    "industry": router_output.industry,
                },
            )

            await db_service.add_agent_log(
                vendor_id=vendor_id,
                agent_name=AgentName.ROUTER.value,
                log_message=(
                    f"Entity resolved: '{router_output.legal_entity_name}' | Sector: '{router_output.industry}'. "
                    f"Context routed to Web Researcher and Legal Analyst agents."
                ),
                metadata={
                    "legal_entity_name": router_output.legal_entity_name,
                    "industry": router_output.industry,
                    "requires_heavy_review": router_output.requires_heavy_legal_review,
                },
            )
            await asyncio.sleep(0.6)

            # -------------------------------------------------------------
            # Step 2: The Web Researcher Agent (Nemotron Super + Tavily API)
            # -------------------------------------------------------------
            await db_service.add_agent_log(
                vendor_id=vendor_id,
                agent_name=AgentName.RESEARCHER.value,
                log_message=f"Dispatching autonomous Tavily search query: Adverse media, lawsuits, SEC fines, and data breaches for '{router_output.legal_entity_name}'...",
                metadata={"agent": "Nemotron Super", "tool": "Tavily API"},
            )

            researcher_output, search_data = await researcher_agent.investigate(router_output.legal_entity_name)

            await db_service.update_vendor(
                vendor_id,
                {
                    "reputation_summary": researcher_output.reputation_summary,
                },
            )

            adverse_status = "CRITICAL ADVERSE MEDIA DETECTED" if researcher_output.found_adverse_media else "NO ADVERSE ENFORCEMENT FOUND"
            await db_service.add_agent_log(
                vendor_id=vendor_id,
                agent_name=AgentName.RESEARCHER.value,
                log_message=(
                    f"OSINT Investigation Complete [{adverse_status}]. "
                    f"Synthesized {len(researcher_output.key_findings)} intelligence findings into reputation report."
                ),
                metadata={
                    "found_adverse_media": researcher_output.found_adverse_media,
                    "key_findings": researcher_output.key_findings,
                    "search_results_count": len(search_data.get("results", [])),
                },
            )
            await asyncio.sleep(0.6)

            # -------------------------------------------------------------
            # Step 3: The Legal Analyst Agent (Nemotron 3 Ultra)
            # -------------------------------------------------------------
            await db_service.add_agent_log(
                vendor_id=vendor_id,
                agent_name=AgentName.ANALYST.value,
                log_message=(
                    f"Cross-referencing contract provisions against live reputation report. "
                    f"Evaluating risk domains: INFORMATION_SECURITY, FINANCIAL_RISK, LEGAL_LIABILITY, REGULATORY_COMPLIANCE..."
                ),
                metadata={"model": "nvidia/nemotron-3-ultra", "task": "heavy_reasoning"},
            )

            analyst_output = await analyst_agent.evaluate(
                contract_text=contract_text,
                reputation_summary=researcher_output.reputation_summary,
                found_adverse_media=researcher_output.found_adverse_media,
                key_findings=researcher_output.key_findings,
            )

            # Save flagged clauses
            await db_service.save_flagged_clauses(vendor_id, analyst_output.flagged_clauses)

            await db_service.add_agent_log(
                vendor_id=vendor_id,
                agent_name=AgentName.ANALYST.value,
                log_message=(
                    f"Legal analysis finalized. Calculated Trust Score: {analyst_output.trust_score}/100. "
                    f"Flagged {len(analyst_output.flagged_clauses)} actionable liability clauses."
                ),
                metadata={
                    "trust_score": analyst_output.trust_score,
                    "flagged_clauses_count": len(analyst_output.flagged_clauses),
                    "overall_reasoning": analyst_output.overall_reasoning,
                },
            )
            await asyncio.sleep(0.5)

            # -------------------------------------------------------------
            # Step 4: Autonomous Action (n8n Webhook & Final State)
            # -------------------------------------------------------------
            settings_obj = await db_service.get_settings()
            webhook_url = settings_obj.get("webhook_url", "")
            alert_threshold = int(settings_obj.get("alert_threshold", 70))

            is_alert_triggered = False

            if analyst_output.trust_score < alert_threshold:
                await db_service.add_agent_log(
                    vendor_id=vendor_id,
                    agent_name=AgentName.ORCHESTRATOR.value,
                    log_message=(
                        f"ALERT TRIGGERED: Trust Score ({analyst_output.trust_score}) is below enterprise threshold ({alert_threshold}). "
                        f"Executing autonomous n8n webhook dispatch to Slack/WhatsApp compliance channel..."
                    ),
                    metadata={
                        "score": analyst_output.trust_score,
                        "threshold": alert_threshold,
                        "webhook_url": webhook_url if webhook_url else "Not configured",
                    },
                )

                if webhook_url:
                    dispatch_res = await webhook_service.dispatch_risk_alert(
                        webhook_url=webhook_url,
                        vendor_id=vendor_id,
                        vendor_name=router_output.legal_entity_name or vendor_name,
                        trust_score=analyst_output.trust_score,
                        alert_threshold=alert_threshold,
                        reputation_summary=researcher_output.reputation_summary,
                        overall_reasoning=analyst_output.overall_reasoning,
                        flagged_clauses=analyst_output.flagged_clauses,
                    )
                    is_alert_triggered = dispatch_res.dispatched
                    
                    status_text = f"HTTP {dispatch_res.status_code}" if dispatch_res.dispatched else f"Failed ({dispatch_res.error})"
                    await db_service.add_agent_log(
                        vendor_id=vendor_id,
                        agent_name=AgentName.ORCHESTRATOR.value,
                        log_message=f"n8n Webhook response: {status_text}. Real-time compliance alert broadcasted.",
                        metadata={"webhook_result": dispatch_res.model_dump()},
                    )
                else:
                    is_alert_triggered = True
                    await db_service.add_agent_log(
                        vendor_id=vendor_id,
                        agent_name=AgentName.ORCHESTRATOR.value,
                        log_message="Alert generated (Simulated webhook: Configure your n8n Webhook in /settings to receive live Slack/WhatsApp notifications).",
                        metadata={"simulated_dispatch": True},
                    )
            else:
                await db_service.add_agent_log(
                    vendor_id=vendor_id,
                    agent_name=AgentName.ORCHESTRATOR.value,
                    log_message=f"Trust Score ({analyst_output.trust_score}) meets compliance threshold ({alert_threshold}). Fast-track vendor onboarding approved.",
                    metadata={"status": "PASSED_VERIFICATION"},
                )

            # Update Vendor Record to COMPLETED
            elapsed = round(time.time() - start_time, 2)
            await db_service.update_vendor(
                vendor_id,
                {
                    "status": VendorStatus.COMPLETED.value,
                    "trust_score": analyst_output.trust_score,
                    "overall_reasoning": analyst_output.overall_reasoning,
                    "is_alert_triggered": is_alert_triggered,
                },
            )

            await db_service.add_agent_log(
                vendor_id=vendor_id,
                agent_name=AgentName.ORCHESTRATOR.value,
                log_message=f"Nexus compliance workflow completed in {elapsed}s. Report ready for review.",
                metadata={"total_elapsed_seconds": elapsed, "final_status": "COMPLETED"},
            )

            logger.info(f"Vendor pipeline {vendor_id} completed successfully in {elapsed}s.")

        except Exception as e:
            elapsed = round(time.time() - start_time, 2)
            logger.error(f"Pipeline error for vendor {vendor_id}: {e}", exc_info=True)
            await db_service.update_vendor(
                vendor_id,
                {
                    "status": VendorStatus.FAILED.value,
                    "error_message": str(e),
                },
            )
            await db_service.add_agent_log(
                vendor_id=vendor_id,
                agent_name=AgentName.ORCHESTRATOR.value,
                log_message=f"Pipeline encountered an unexpected error: {str(e)}",
                metadata={"error": str(e), "failed_at": elapsed},
            )


orchestrator = NexusOrchestrator()
