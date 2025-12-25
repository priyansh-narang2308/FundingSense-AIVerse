import os
import chromadb
from chromadb.utils import embedding_functions
from typing import List, Optional
from app.schemas.evidence import EvidenceUnit, SourceType
from app.config.settings import settings


class EvidenceStore:
    def __init__(self, persist_directory: str = "db"):
        self.client = chromadb.PersistentClient(path=persist_directory)

        if settings.GOOGLE_API_KEY:
            self.emb_fn = embedding_functions.GoogleGenerativeAiEmbeddingFunction(
                api_key=settings.GOOGLE_API_KEY, model_name="models/embedding-001"
            )
        else:
            self.emb_fn = embedding_functions.DefaultEmbeddingFunction()

        self.collection = self.client.get_or_create_collection(
            name="funding_evidence", embedding_function=self.emb_fn
        )

    def save_evidence(self, evidence: EvidenceUnit):

        # this saves a single EvidenceUnit to the ChromaDB vector store.

        metadata = {
            "source_type": str(evidence.source_type.value),
            "source_name": evidence.source_name,
            "published_year": evidence.published_year,
            "url": evidence.url or "",
            "sector": evidence.sector,
            "geography": evidence.geography,
            "title": evidence.title,
        }

        # adding the invesitoes as comma seperated
        if evidence.investors:
            metadata["investors"] = ",".join(evidence.investors)

        self.collection.add(
            ids=[evidence.evidence_id],
            documents=[evidence.content],
            metadatas=[metadata],
        )
