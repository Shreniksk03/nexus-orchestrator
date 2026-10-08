import json
import logging
from typing import Any, Dict
from app.core.config import settings
from app.models.schemas import ResearcherOutput
from app.services.nebius_service import nebius_service
from app.services.tavily_service import tavily_service

logger = logging.getLogger("nexus.agent.researcher")

RESEARCHER_SYSTEM_PROMPT = (
    "You are the Web Researcher Agent powered by NVIDIA Nemotron Super with Tavily Search integration. "
    "Your mission is to perform comprehensive OSINT and regulatory intelligence synthesis. "
    "Investigate the legal entity for active litigation, SEC/FTC enforcement actions, data breaches, "
    "GDPR fines, credit distress, and adverse media signals. Output strict JSON format."
)

class ResearcherAgent:
    async def investigate(self, legal_entity_name: str) -> tuple[ResearcherOutput, Dict[str, Any]]:
        """
        Executes Tavily live search and uses Nemotron Super to synthesize reputation intelligence.
        """
        # Step 1: Query Tavily Search
        search_data = await tavily_service.search_vendor_risk(legal_entity_name)
        search_results_str = json.dumps(search_data.get("results", []), indent=2)

        # Step 2: Synthesize via Nemotron Super
        user_prompt = (
            f"Using the Tavily search tool results, investigate the vendor: {legal_entity_name}. "
            f"Search for recent lawsuits, data breaches, regulatory fines, and SEC actions. "
            f"Synthesize the findings into a comprehensive reputation report. Output strict JSON.\n\n"
            f"Search Query Executed: {search_data.get('query')}\n"
            f"Search Synthesis Summary: {search_data.get('answer')}\n\n"
            f"Tavily Raw Snippets:\n{search_results_str}\n\n"
            f"JSON Schema required:\n"
            f"{{\n"
            f'  "reputation_summary": "string",\n'
            f'  "found_adverse_media": true|false,\n'
            f'  "key_findings": ["string", "string"]\n'
            f"}}"
        )

        raw_data = await nebius_service.call_llm(
            model=settings.RESEARCHER_MODEL,
            system_prompt=RESEARCHER_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            response_model=ResearcherOutput,
            temperature=0.1,
        )

        if raw_data and "reputation_summary" in raw_data:
            output = ResearcherOutput(
                reputation_summary=raw_data.get("reputation_summary", ""),
                found_adverse_media=raw_data.get("found_adverse_media", False),
                key_findings=raw_data.get("key_findings", []),
            )
            return output, search_data

        # Fallback intelligent synthesis from Tavily data
        findings = []
        for item in search_data.get("results", []):
            if item.get("title"):
                findings.append(f"{item.get('title')}: {item.get('content', '')[:120]}")

        has_adverse = bool(search_data.get("results")) and any(
            w in str(search_data).lower() for w in ["lawsuit", "breach", "fine", "investigation", "negligence", "fined"]
        )

        summary = (
            search_data.get("answer")
            or f"Adverse media assessment for {legal_entity_name} identified {len(findings)} relevant legal/regulatory disclosures in public records."
        )

        output = ResearcherOutput(
            reputation_summary=summary,
            found_adverse_media=has_adverse,
            key_findings=findings[:4] if findings else ["No adverse regulatory actions detected in public registry."],
        )
        return output, search_data


researcher_agent = ResearcherAgent()
