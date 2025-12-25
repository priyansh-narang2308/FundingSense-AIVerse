import os
import yaml
import json
from typing import List, Optional
import asyncio
import google.generativeai as genai
from app.schemas.evidence import EvidenceUnit, SourceType
from app.config.settings import settings
from app.data.evidence_store import EvidenceStore


class Retriever:

    # RAG Layer:

    # 1. Local Vector Search: Uses ChromaDB to semantic search through pre-ingested data.
    # 2. File Scan: Scans 'data/raw' as a secondary local fallback.
    # 3. Generative Retrieval: Uses Gemini

    def __init__(self, data_root: str = "data/raw"):
        self.data_root = data_root
        self.vector_store = EvidenceStore()
        if settings.GOOGLE_API_KEY:
            genai.configure(api_key=settings.GOOGLE_API_KEY)

        # Initializing Gemini 2.0 with Live Web Search Tooling
        self.model = genai.GenerativeModel(
            model_name="gemini-2.0-flash-exp", tools=["google_search_retrieval"]
        )

    async def retrieve_relevant_evidence(
        self,
        sector: str,
        geography: str,
        funding_stage: str,
        startup_description: str = "",
    ) -> List[EvidenceUnit]:
        print(f"[*] Starting high-fidelity retrieval for {sector} in {geography}..")
        evidence_results: List[EvidenceUnit] = []

        # 1. Real-Time Deep Scrape
        print(
            f"[*] [LOG] Initializing real-time generative crawl (Google Search grounded)..."
        )
        generative_evidence = await self._generative_retrieval(
            sector, geography, funding_stage, startup_description
        )
        evidence_results.extend(generative_evidence)

        # 2. Vector DB Check
        if len(evidence_results) < 5:
            try:
                print(
                    f"[*] [LOG] Supplementing with cached proprietary intelligence..."
                )
                vector_data = self.vector_store.query_evidence(
                    f"{sector} {funding_stage} in {geography} {startup_description}"
                )
                if vector_data:
                    evidence_results.extend(vector_data)
            except Exception as e:
                print(f"[!] Vector Search failed: {e}")

        # 3. File Scan Fallback
        if len(evidence_results) < 6:
            local_data = self._scan_local_files(sector, geography)
            if local_data:
                evidence_results.extend(local_data)

        print(
            f"[*] [LOG] Retrieval complete. Fetched {len(evidence_results)} real-world evidence units."
        )
        return evidence_results[:8]

    def _scan_local_files(self, sector: str, geography: str) -> List[EvidenceUnit]:
        local_results = []
        try:
            if not os.path.exists(self.data_root):
                return []

            for root, _, files in os.walk(self.data_root):
                for file in files:
                    if file.endswith(".md"):
                        file_path = os.path.join(root, file)
                        with open(file_path, "r") as f:
                            content = f.read()
                            if content.startswith("---"):
                                parts = content.split("---")
                                if len(parts) >= 3:
                                    metadata = yaml.safe_load(parts[1])
                                    body = parts[2].strip()

                                    if (
                                        sector.lower()
                                        in metadata.get("sector", "").lower()
                                        or geography.lower()
                                        in metadata.get("geography", "").lower()
                                    ):

                                        local_results.append(
                                            EvidenceUnit(
                                                evidence_id=f"ev_repo_{file.replace('.md', '')}",
                                                source_type=SourceType(
                                                    metadata.get("source_type", "news")
                                                ),
                                                title=metadata.get(
                                                    "title",
                                                    "Market Intelligence Report",
                                                ),
                                                source_name=metadata.get(
                                                    "source_name",
                                                    "Proprietary Funding Dataset",
                                                ),
                                                published_year=metadata.get(
                                                    "published_year", 2024
                                                ),
                                                url=metadata.get("source_url"),
                                                sector=metadata.get("sector", sector),
                                                geography=metadata.get(
                                                    "geography", geography
                                                ),
                                                investors=metadata.get("investors", []),
                                                content=body,
                                                usage_tags=metadata.get(
                                                    "usage_tags",
                                                    ["proprietary-analysis"],
                                                ),
                                            )
                                        )
        except Exception as e:
            print(f"[!] Error reading repository: {e}")
        return local_results

    async def _generative_retrieval(
        self, sector: str, geography: str, stage: str, description: str = ""
    ) -> List[EvidenceUnit]:
        # live search tool of gemeini
        if not settings.GOOGLE_API_KEY:
            return []

        prompt = (
            f"You are a LIVE WEB SEARCH RAG engine. Use your google_search_retrieval tool to find "
            f"4-6 ABSOLUTELY REAL and CURRENT evidence units (published in 2024 or 2025) for a "
            f"{stage} startup in {sector} targeting the {geography} market.\n\n"
            f"STARTUP DESCRIPTION: {description}\n\n"
            f"TASK:\n"
            f"1. Search for the latest news on this specific sub-sector and geography.\n"
            f"2. Find real names of active VCs (e.g. Accel, Blume, Peak XV) who have invested in SIMILAR models in the last 12 months.\n"
            f"3. Find actual policy changes or government grants relevant to this model.\n\n"
            f"FORMATTING CONSTRAINTS:\n"
            f"1. Output MUST be ONLY a raw JSON list of objects.\n"
            f"2. Each object must match this structure:\n"
            f"{{ 'source_type': 'news'|'policy'|'dataset', 'title': string, 'source_name': string, 'published_year': int, "
            f"'url': string, 'investors': [string], 'content': string, 'usage_tags': [string] }}\n"
            f"3. Usage tags must include one of: 'market-sizing', 'funding-trends', 'investor-sentiment', 'regulation', 'policy-impact', 'valuation', 'exit-metrics'.\n"
            f"4. ABSOLUTELY NO markdown (no ```json). NO introductory text."
        )

        try:
            response = self.model.generate_content(prompt)
            raw_json = response.text.strip()
            if raw_json.startswith("```json"):
                raw_json = raw_json[7:-3].strip()

            data = json.loads(raw_json)
            units = []
            for i, item in enumerate(data):
                units.append(
                    EvidenceUnit(
                        evidence_id=f"ev_gen_{i}_{hash(item['title'])}",
                        source_type=SourceType(item.get("source_type", "news")),
                        title=item.get("title"),
                        source_name=item.get("source_name"),
                        published_year=item.get("published_year", 2024),
                        url=item.get("url"),
                        sector=sector,
                        geography=geography,
                        investors=item.get("investors", []),
                        content=item.get("content"),
                        usage_tags=item.get("usage_tags", ["generative-retrieval"]),
                    )
                )
            return units
        except Exception as e:
            print(f"[!] Generative retrieval failed: {e}")
            return []

    async def retrieve_relevant_data(
        self, query: str, context: dict
    ) -> List[EvidenceUnit]:
        return await self.retrieve_relevant_evidence(
            sector=context.get("sector", "General Tech"),
            geography=context.get("geography", "Global"),
            funding_stage=context.get("funding_stage", "Seed"),
        )
