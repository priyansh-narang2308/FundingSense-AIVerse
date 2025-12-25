import os
import chromadb
from chromadb.utils import embedding_functions
from typing import List, Optional
from app.schemas.evidence import EvidenceUnit, SourceType
from app.config.settings import settings


class EvidenceStore:
    def __init__(self, persist_directory: str = "db"):
        try:
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
        except Exception as e:
            print(f"[!] ChromaDB initialization failed: {e}")
            raise e

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

    def query_evidence(self, query_text: str, n_results: int = 5) -> List[EvidenceUnit]:
        
        #search for evidence using semantic similarity.

        results = self.collection.query(query_texts=[query_text], n_results=n_results)

        evidence_units = []
        if not results["ids"] or not results["ids"][0]:
            return []

        for i in range(len(results["ids"][0])):
            meta = results["metadatas"][0][i]
            evidence_units.append(
                EvidenceUnit(
                    evidence_id=results["ids"][0][i],
                    source_type=SourceType(meta.get("source_type", "news")),
                    title=meta.get("title", "Untitled"),
                    source_name=meta.get("source_name", "Unknown"),
                    published_year=int(meta.get("published_year", 2024)),
                    url=meta.get("url"),
                    sector=meta.get("sector", "General"),
                    geography=meta.get("geography", "Global"),
                    investors=(
                        meta.get("investors", "").split(",")
                        if meta.get("investors")
                        else []
                    ),
                    content=results["documents"][0][i],
                    usage_tags=[meta.get("source_type", "evidence-store")],
                )
            )

        return evidence_units

    def list_all_evidence(self) -> List[EvidenceUnit]:

        return []
