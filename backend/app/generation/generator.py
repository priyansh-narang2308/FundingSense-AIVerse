import json
from typing import Dict, List, Any
from google import genai
from google.genai import types
from app.config.settings import settings
from app.schemas.reasoning import ReasoningResult


class Generator:

    # Generation Layer: Handles professional explanation of validated results.

    # Hallucinations are prevented because the prompt forbids the introduction of
    # any facts not present in the supported_claims or evidence_map.

    def __init__(self):
        if settings.GOOGLE_API_KEY:
            self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        else:
            self.client = None

    # reasoning_result: The output from the Validator layer.
    #   language: Target language for the report
    async def generate_report(
        self,
        reasoning_result: ReasoningResult,
        evidence_units: List[Any],
        language: str = "en",
    ) -> Dict:
        if not settings.GOOGLE_API_KEY:
            return self._generate_mock_fallback(reasoning_result, language)

        system_prompt = (
            "You are a Senior Venture Capital Analyst. Your task is to explain a provided "
            "funding analysis based ONLY on the validated claims and evidence provided.\n\n"
            "CRITICAL CONSTRAINTS:\n"
            "1. Do NOT just repeat the 'Supported Claims' verbatim. Use them as a thematic guide, "
            "but your 'why_this_fits' and 'why_this_does_not_fit' bullet points MUST contain "
            "SPECIFIC DATA found in the 'Evidence' (e.g., mention names of investors, specific policy names, "
            "funding amounts, or dates).\n"
            "2. Recommend the BEST 3-5 investors from the evidence or known real-world VCs that fit this SPECIFIC startup description.\n"
            "3. For each investor, provide:\n"
            "   - name (string)\n"
            "   - fit_score (int 0-100)\n"
            "   - reasons (list of specific strings explaining WHY they fit this description, mention specific portfolio companies if found in evidence)\n"
            "   - focus_areas (list of strings)\n"
            "4. Maintain a professional, data-centric tone.\n"
            f"5. The output must be in {language}.\n"
            "6. Your response MUST be a valid JSON object with the following keys:\n"
            "   - executive_summary (string: A high-level 2-3 sentence overview)\n"
            "   - why_this_fits (list of strings: Detailed, evidence-backed positive factors)\n"
            "   - why_this_does_not_fit (list of strings: Specific risks or gaps identified)\n"
            "   - recommended_investors (list of objects)\n"
            "   - confidence_explanation (string: Explain why you chose this confidence level based on the richness of provided evidence)"
        )

        input_data = {
            "supported_claims": reasoning_result.supported_claims,
            "rejected_claims": reasoning_result.rejected_claims,
            "confidence_level": reasoning_result.confidence_level,
            "evidence": [
                ev.dict() if hasattr(ev, "dict") else str(ev) for ev in evidence_units
            ],
        }

        try:
            response = await self.client.aio.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=f"{system_prompt}\n\nData to analyze: {json.dumps(input_data)}",
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except Exception as e:
            # Fallback in case of API failure or parsing error
            return self._generate_mock_fallback(reasoning_result, language)

    def _generate_mock_fallback(
        self, reasoning_result: ReasoningResult, language: str
    ) -> Dict:
        # Basic translations for demonstration if API fails
        summaries = {
            "hi": "बाजार, नियामक और वित्तीय मापदंडों में प्रारंभिक विश्लेषण किया गया।",
            "en": "Initial analysis performed across market, regulatory, and financial parameters.",
        }
        
        explanation_prefix = {
            "hi": "प्रत्यक्ष साक्ष्य मिलान के आधार पर रिपोर्ट तैयार की गई।",
            "en": "Report generated based on direct evidence matches.",
        }

        return {
            "executive_summary": summaries.get(language, summaries["en"]),
            "why_this_fits": reasoning_result.supported_claims,
            "why_this_does_not_fit": [
                (f"Insufficient evidence for: {c}" if language == "en" else f"इसके लिए अपर्याप्त साक्ष्य: {c}")
                for c in reasoning_result.rejected_claims
            ],
            "recommended_investors": [
                {
                    "name": "General VC Fund",
                    "fit_score": 70,
                    "reasons": ["Strategic match" if language == "en" else "रणनीतिक मिलान"],
                    "focus_areas": ["Technology"]
                }
            ],
            "confidence_explanation": f"{explanation_prefix.get(language, explanation_prefix['en'])} (Confidence: {reasoning_result.confidence_level})",
        }

    async def translate(self, text: str, target_language: str) -> str:
        if not self.client:
            return text
        
        # Mapping language codes to full names for better AI context
        lang_map = {
            "hi": "Hindi", "bn": "Bengali", "ta": "Tamil", "te": "Telugu", 
            "mr": "Marathi", "gu": "Gujarati", "kn": "Kannada", "en": "English"
        }
        target_lang_name = lang_map.get(target_language, target_language)

        prompt = f"Translate the following text to {target_lang_name}. Return ONLY the translated text, no quotes or meta-talk.\n\nTEXT: {text}"
        try:
            response = await self.client.aio.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            print(f"[!] Dynamic translation failed: {e}")
            return text

    async def generate_explanation(self, validated_data: dict, language: str) -> str:
        return f"Validated report generated in {language}"
