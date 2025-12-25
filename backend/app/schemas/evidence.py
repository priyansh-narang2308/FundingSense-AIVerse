from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from datetime import datetime


class SourceType(str, Enum):
    NEWS = "news"
    POLICY = "policy"
    DATASET = "dataset"


class EvidenceUnit(BaseModel):
    """
    EvidenceUnit represents one atomic, verifiable funding fact.

    This schema is the foundation of the RAG system:
    1. It provides a standard structure for chunked text and its associated metadata.
    2. It enables evidence-backed reasoning by allowing the system to trace every
       AI-generated claim back to a specific id, source, and context (sector, geography, etc.).
    """

    evidence_id: str = Field(
        ..., description="Unique identifier for the evidence chunk"
    )
    source_type: SourceType = Field(
        ..., description="The nature of the source (news, policy, or dataset)"
    )
    title: str = Field(..., description="Title of the source document or article")
    source_name: str = Field(
        ..., description="Name of the publisher (e.g., TechCrunch, Ministry of Finance)"
    )
    published_year: int = Field(..., description="Year the information was published")
    url: Optional[str] = Field(None, description="Direct link to source")
    sector: str = Field(
        ..., description="The industry sector this evidence pertains to"
    )
    funding_stage: Optional[str] = Field(
        None, description="The startup stage this evidence is relevant for"
    )
    geography: Optional[str] = Field(
        None, description="The geographic region (e.g., India, Southeast Asia)"
    )
    investors: List[str] = Field(
        default_factory=list, description="List of investors mentioned in this evidence"
    )
    content: str = Field(
        ...,
        description="Cleaned text content used for generating embeddings and grounding LLM responses",
    )
    usage_tags: List[str] = Field(
        default_factory=list,
        description="Categorical tags for filtering (e.g., 'market-sizing', 'regulation', 'investor-behavior')",
    )


class IngestedEvidencePayload(BaseModel):

    # IngestedEvidencePayload represents the contract for data processed by ingestion scripts.
    evidence_units: List[EvidenceUnit]
    source_file: str = Field(
        ..., description="Path or name of the original file processed"
    )
    ingested_at: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat(),
        description="ISO timestamp of the ingestion event",
    )
