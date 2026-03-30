"""
Google Gemini AI integration for clinical narrative generation
"""
import os
import asyncio
import google.generativeai as genai
from typing import Optional


class GeminiService:
    """Service for generating clinical narratives using Google Gemini"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Gemini service
        
        Args:
            api_key: Google API key (falls back to GEMINI_API_KEY env var)
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        
        if not self.api_key:
            print("Warning: GEMINI_API_KEY not set. Using mock responses.")
            self.model = None
        else:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    async def generate_clinical_summary(
        self,
        modality: str,
        prediction: str,
        confidence: float,
        severity_score: float,
        is_uncertain: bool
    ) -> str:
        """
        Generate clinical narrative summary
        
        IMPORTANT: The LLM must NOT change the CNN's classification.
        It should only provide context and explanation.
        
        Args:
            modality: Imaging modality (MRI, CT, X-Ray, ECG)
            prediction: Predicted class from CNN
            confidence: Confidence score
            severity_score: Severity score (1-10)
            is_uncertain: Whether prediction has high uncertainty
        
        Returns:
            Clinical narrative text
        """
        if not self.model:
            return self._generate_mock_summary(modality, prediction, confidence, severity_score, is_uncertain)
        
        # Construct prompt that explicitly forbids changing classification
        prompt = f"""You are a medical imaging assistant helping radiologists understand AI findings.

IMPORTANT RULES:
1. DO NOT change or question the CNN's classification result
2. DO NOT suggest alternative diagnoses
3. ONLY explain what the given finding means in clinical context
4. Provide relevant background about the condition
5. Suggest potential next steps for confirmation

IMAGING MODALITY: {modality}
AI PREDICTION: {prediction}
CONFIDENCE: {confidence:.1%}
SEVERITY SCORE: {severity_score}/10.0
UNCERTAINTY FLAG: {"HIGH - Review Recommended" if is_uncertain else "Normal"}

Please provide a brief clinical summary (3-4 sentences) that:
- Explains what {prediction} means in the context of {modality} imaging
- Notes the confidence level and its implications
- Mentions any relevant clinical correlations
- Suggests appropriate follow-up if needed

Clinical Summary:"""

        try:
            response = await asyncio.get_event_loop().run_in_executor(
                None, lambda: self.model.generate_content(prompt)
            )
            return response.text.strip()
        except Exception as e:
            print(f"Gemini API error: {e}")
            return self._generate_mock_summary(modality, prediction, confidence, severity_score, is_uncertain)
    
    def _generate_mock_summary(
        self,
        modality: str,
        prediction: str,
        confidence: float,
        severity_score: float,
        is_uncertain: bool
    ) -> str:
        """Generate mock clinical summary when API is unavailable"""
        
        uncertainty_note = ""
        if is_uncertain:
            uncertainty_note = " This prediction has elevated uncertainty and should be reviewed carefully by a radiologist."
        
        severity_note = ""
        if severity_score >= 7:
            severity_note = " The high severity score suggests this finding may be clinically significant."
        elif severity_score >= 4:
            severity_note = " The moderate severity score indicates this finding warrants attention."
        else:
            severity_note = " The low severity score suggests this finding may be less urgent."
        
        return (
            f"The AI system has identified **{prediction}** in this {modality} study with "
            f"{confidence:.1%} confidence.{uncertainty_note}{severity_note} "
            f"This automated finding should be correlated with clinical presentation and other diagnostic information. "
            f"Recommend radiologist review for final interpretation and clinical correlation."
        )


# Singleton instance
_gemini_service: Optional[GeminiService] = None


def get_gemini_service() -> GeminiService:
    """Get or create Gemini service singleton"""
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiService()
    return _gemini_service
