import json
import logging
import re
from typing import Any, Dict, Optional, Type, TypeVar
from openai import AsyncOpenAI
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger("nexus.nebius")

T = TypeVar("T", bound=BaseModel)

NEXUS_SYSTEM_PERSONA = (
    "You are the Nexus Orchestrator, an elite, highly critical Zero-Touch Compliance Analyst. "
    "Your purpose is to protect the enterprise from third-party risk. You do not make assumptions. "
    "You aggressively cross-reference legal contracts with real-world reputation data. "
    "You are objective, precise, and ruthless in identifying liabilities in Information Security, "
    "Financial Risk, Legal Liability, and Regulatory Compliance."
)

class NebiusService:
    def __init__(self):
        self.api_key = settings.NEBIUS_API_KEY
        self.base_url = settings.NEBIUS_BASE_URL
        self.client: Optional[AsyncOpenAI] = None
        
        if self.api_key and "your_" not in self.api_key:
            try:
                self.client = AsyncOpenAI(
                    base_url=self.base_url,
                    api_key=self.api_key,
                    timeout=45.0,
                )
                logger.info(f"Initialized Nebius Token Factory client at {self.base_url}")
            except Exception as e:
                logger.error(f"Failed to initialize Nebius client: {e}")

    async def call_llm(
        self,
        model: str,
        system_prompt: str,
        user_prompt: str,
        response_model: Optional[Type[T]] = None,
        temperature: float = 0.1,
    ) -> Dict[str, Any]:
        """
        Invokes Nebius Token Factory LLM endpoint, enforcing strict JSON output.
        """
        combined_system = f"{NEXUS_SYSTEM_PERSONA}\n\n{system_prompt}\nIMPORTANT: You must respond in valid JSON format only, matching the exact required schema with no additional commentary."

        if self.client:
            try:
                response = await self.client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": combined_system},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=temperature,
                    response_format={"type": "json_object"} if "json_object" in ["json_object"] else None,
                )
                raw_text = response.choices[0].message.content or ""
                return self._parse_json_response(raw_text)
            except Exception as e:
                logger.error(f"Nebius API call failed for model {model}: {e}. Falling back to internal engine.")

        # Return mock / fallback if live key is not available
        return {}

    def _parse_json_response(self, text: str) -> Dict[str, Any]:
        """Extracts and parses JSON from raw LLM text with markdown code block cleaning."""
        cleaned = text.strip()
        if "```json" in cleaned:
            match = re.search(r"```json\s*(.*?)\s*```", cleaned, re.DOTALL)
            if match:
                cleaned = match.group(1).strip()
        elif "```" in cleaned:
            match = re.search(r"```\s*(.*?)\s*```", cleaned, re.DOTALL)
            if match:
                cleaned = match.group(1).strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            # Fallback regex extraction for json object
            obj_match = re.search(r"(\{.*\})", cleaned, re.DOTALL)
            if obj_match:
                try:
                    return json.loads(obj_match.group(1))
                except Exception:
                    pass
            logger.warning(f"Could not parse raw LLM JSON: {text[:200]}")
            return {}


nebius_service = NebiusService()
