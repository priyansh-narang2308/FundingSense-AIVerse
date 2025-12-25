from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum


class ConfidenceLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class AnalysisRequest(BaseModel):
    # fefines the shape of incoming analysis requests.
    startup_description: str = Field(
        ..., description="Startup elevator pitch or description"
    )
    sector: str = Field(..., description="Industry sector (e.g., Fintech, Healthtech)")
    funding_stage: str = Field(
        ..., description="Current funding stage (e.g., Seed, Series A)"
    )
    geography: str = Field(..., description="Target market geography")
    language: str = Field("en", description="Response language (e.g., en, hi)")


class InvestorRecommendation(BaseModel):
    name: str
    fit_score: int = Field(..., ge=0, le=100)
    logo_initials: Optional[str] = None
    focus_areas: List[str] = []
    reasons: List[str] = []


class EvidenceUsed(BaseModel):
    source_type: str = Field(..., description="e.g., news, policy, dataset")
    title: str
    source_name: str
    year: str
    url: Optional[str] = None
    usage_reason: str


class AnalysisResponse(BaseModel):

    # defines the shape of the analysis output.
    analysis_id: str
    startup_summary: str
    confidence_indicator: ConfidenceLevel
    overall_score: int = Field(..., ge=0, le=100)
    recommended_investors: List[InvestorRecommendation]
    why_fits: List[str]
    why_does_not_fit: List[str]
    evidence_used: List[EvidenceUsed]
    created_at: Optional[str] = Field(
        None, description="ISO timestamp of when the analysis was performed"
    )
    metadata: Dict = {}
