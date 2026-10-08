import logging
from app.core.config import settings
from app.models.schemas import RouterOutput
from app.services.nebius_service import nebius_service

logger = logging.getLogger("nexus.agent.router")

ROUTER_SYSTEM_PROMPT = (
    "You are the Router Agent powered by NVIDIA Nemotron Nano. "
    "Your objective is to perform rapid semantic entity extraction on inbound vendor agreements. "
    "Extract the exact legal entity name and identify the vendor's primary operating industry sector. "
    "Determine if the contract scope demands intensive cross-domain legal scrutiny."
)

class RouterAgent:
    async def analyze(self, vendor_name: str, contract_text: str) -> RouterOutput:
        """
        Analyzes the vendor name and contract text, extracting legal entity name and industry.
        """
        user_prompt = (
            f"Analyze the provided vendor name and contract text. "
            f"Extract the exact legal entity name and determine the primary industry of the vendor. "
            f"Output strict JSON with fields: legal_entity_name, industry, requires_heavy_legal_review.\n\n"
            f"Vendor Name: {vendor_name}\n\n"
            f"Contract Snippet:\n{contract_text[:3000]}"
        )

        raw_data = await nebius_service.call_llm(
            model=settings.ROUTER_MODEL,
            system_prompt=ROUTER_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            response_model=RouterOutput,
            temperature=0.0,
        )

        if raw_data and "legal_entity_name" in raw_data and "industry" in raw_data:
            return RouterOutput(
                legal_entity_name=raw_data.get("legal_entity_name", vendor_name),
                industry=raw_data.get("industry", "Enterprise Software & Cloud"),
                requires_heavy_legal_review=raw_data.get("requires_heavy_legal_review", True),
            )

        # Fallback heuristic entity resolution
        lower_text = contract_text.lower()
        industry = "Enterprise Cloud & SaaS"
        if "financial" in lower_text or "payment" in lower_text or "banking" in lower_text or "ledger" in lower_text:
            industry = "Financial Technology & Payment Systems"
        elif "logistics" in lower_text or "freight" in lower_text or "shipping" in lower_text:
            industry = "Supply Chain & Global Logistics"
        elif "health" in lower_text or "hipaa" in lower_text or "patient" in lower_text or "medical" in lower_text:
            industry = "Healthcare & Life Sciences"
        elif "cyber" in lower_text or "security" in lower_text or "infosec" in lower_text:
            industry = "Cybersecurity & Infrastructure"

        # Determine full legal entity name
        legal_name = vendor_name.strip()
        if "inc" not in legal_name.lower() and "corp" not in legal_name.lower() and "llc" not in legal_name.lower():
            if "inc" in contract_text[:500].lower():
                legal_name = f"{legal_name}, Inc."
            elif "llc" in contract_text[:500].lower():
                legal_name = f"{legal_name}, LLC"

        return RouterOutput(
            legal_entity_name=legal_name,
            industry=industry,
            requires_heavy_legal_review=True,
        )


router_agent = RouterAgent()
