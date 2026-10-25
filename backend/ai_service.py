"""
Centralized Groq MLLM integration layer.
Handles all AI interactions with structured output and fallback safety.
"""
import json
import base64
import logging
from typing import Optional, Type, TypeVar
from pathlib import Path

from groq import Groq
from pydantic import BaseModel, ValidationError

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"  # Multimodal model
GROQ_TEXT_MODEL = "llama-3.3-70b-versatile"


def _encode_image(image_bytes: bytes) -> str:
    """Encode image bytes to base64 string."""
    return base64.b64encode(image_bytes).decode("utf-8")


def _safe_parse(response_text: str, schema: Type[T], fallback: T) -> T:
    """
    Parse JSON response safely. On any failure, returns the fallback model.
    """
    try:
        # Try to extract JSON from markdown code blocks
        text = response_text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        
        data = json.loads(text)
        return schema.model_validate(data)
    except (json.JSONDecodeError, ValidationError, IndexError, KeyError) as e:
        logger.warning(f"Response parse failed ({type(e).__name__}): {e}. Using fallback.")
        return fallback


def build_json_prompt(schema: Type[T], extra_instruction: str = "") -> str:
    """Generate a prompt that instructs the AI to respond with valid JSON."""
    schema_json = json.dumps(schema.model_json_schema(), indent=2)
    return f"""You MUST respond with ONLY valid JSON conforming to this schema. No markdown, no explanation outside the JSON block.
{extra_instruction}

JSON Schema:
{schema_json}

Respond with a single valid JSON object only. Do not include any text before or after the JSON."""


class GroqAIService:
    """Centralized AI service using Groq SDK."""

    def __init__(self, api_key: str):
        self.client = Groq(api_key=api_key)

    def analyze_image_with_text(
        self,
        image_bytes: bytes,
        image_type: str,
        system_prompt: str,
        user_prompt: str,
        schema: Type[T],
        fallback: T,
    ) -> T:
        """Send an image + text query to the multimodal model and parse structured output."""
        try:
            b64_image = _encode_image(image_bytes)
            json_instruction = build_json_prompt(schema)

            completion = self.client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt + "\n\n" + json_instruction},
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{image_type};base64,{b64_image}"
                                },
                            },
                            {"type": "text", "text": user_prompt},
                        ],
                    },
                ],
                temperature=0.3,
                max_tokens=4096,
            )
            content = completion.choices[0].message.content or ""
            return _safe_parse(content, schema, fallback)
        except Exception as e:
            logger.error(f"Groq image analysis error: {e}")
            return fallback

    def query_text(
        self,
        system_prompt: str,
        user_prompt: str,
        schema: Type[T],
        fallback: T,
    ) -> T:
        """Send a text-only query to the LLM and parse structured output."""
        try:
            json_instruction = build_json_prompt(schema)

            completion = self.client.chat.completions.create(
                model=GROQ_TEXT_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt + "\n\n" + json_instruction},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.4,
                max_tokens=4096,
            )
            content = completion.choices[0].message.content or ""
            return _safe_parse(content, schema, fallback)
        except Exception as e:
            logger.error(f"Groq text query error: {e}")
            return fallback

    def chat_query(self, system_prompt: str, user_message: str, schema: Type[T], fallback: T) -> T:
        """General-purpose chat query with structured output."""
        return self.query_text(system_prompt, user_message, schema, fallback)
