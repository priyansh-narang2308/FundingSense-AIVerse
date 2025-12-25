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
        self.vector_store = None
        
        if settings.ENABLE_VECTOR_DB:
            try:
                self.vector_store = EvidenceStore()
                print("[*] Local vector store initialized.")
            except Exception as e:
                print(f"[!] Vector store failed to initialize: {e}")
        else:
            print("[*] Vector store disabled by config.")

        if settings.GOOGLE_API_KEY:
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            print("[*] Google API Key found. Initializing AI components...")
        else:
            print("[!] WARNING: GOOGLE_API_KEY not found. Generative retrieval will be disabled.")

        # Initializing Gemini 2.0 with Live Web Search Tooling
        self.model = genai.GenerativeModel(
            model_name="gemini-2.0-flash-exp", 
            tools=[{"google_search_retrieval": {"dynamic_retrieval_config": {"mode": "dynamic", "dynamic_threshold": 0.3}}}]
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
        if generative_evidence:
            print(f"[*] [LOG] Generative retrieval successful: {len(generative_evidence)} units.")
            evidence_results.extend(generative_evidence)
        else:
            print(f"[*] [LOG] Generative retrieval returned 0 units.")

        # 2. Vector DB Check
        if len(evidence_results) < 5 and self.vector_store:
            try:
                print(
                    f"[*] [LOG] Supplementing with cached proprietary intelligence..."
                )
                vector_data = self.vector_store.query_evidence(
                    f"{sector} {funding_stage} in {geography} {startup_description}"
                )
                if vector_data:
                    print(f"[*] [LOG] Vector store returned {len(vector_data)} units.")
                    evidence_results.extend(vector_data)
            except Exception as e:
                print(f"[!] Vector Search failed: {e}")

        # 3. File Scan Fallback
        if len(evidence_results) < 3:
            print(f"[*] [LOG] Still low on evidence. Scanning local files for {sector}...")
            local_data = self._scan_local_files(sector, geography)
            if local_data:
                print(f"[*] [LOG] File scan returned {len(local_data)} units.")
                evidence_results.extend(local_data)

        print(
            f"[*] [LOG] Retrieval complete. Fetched {len(evidence_results)} real-world evidence units."
        )
        return evidence_results[:10]

    def _scan_local_files(self, sector: str, geography: str) -> List[EvidenceUnit]:
        local_results = []
        try:
            if not os.path.exists(self.data_root):
                print(f"[!] Data root {self.data_root} does not exist.")
                return []

            sector_words = set(sector.lower().replace("&", " ").split())
            geo_words = set(geography.lower().replace("-", " ").split())

            for root, _, files in os.walk(self.data_root):
                for file in files:
                    if file.endswith(".md"):
                        file_path = os.path.join(root, file)
                        with open(file_path, "r") as f:
                            content = f.read()
                            if content.startswith("---"):
                                parts = content.split("---")
                                if len(parts) >= 3:
                                    try:
                                        metadata = yaml.safe_load(parts[1])
                                        body = parts[2].strip()

                                        file_sector = metadata.get("sector", "").lower()
                                        file_geo = metadata.get("geography", "").lower()
                                        
                                        # Word-based overlap matching for more robustness
                                        sector_match = any(word in file_sector for word in sector_words)
                                        geo_match = any(word in file_geo for word in geo_words)

                                        # Handle usage_tags being either a list or a comma-separated string
                                        raw_tags = metadata.get("usage_tags", ["proprietary-analysis"])
                                        if isinstance(raw_tags, str):
                                            tags = [t.strip() for t in raw_tags.split(",")]
                                        else:
                                            tags = list(raw_tags) if raw_tags else ["proprietary-analysis"]

                                        # Handle investors being either a list or a comma-separated string
                                        raw_investors = metadata.get("investors", [])
                                        if isinstance(raw_investors, str):
                                            investors = [inv.strip() for inv in raw_investors.split(",")]
                                        else:
                                            investors = list(raw_investors) if raw_investors else []

                                        if sector_match or geo_match:
                                            local_results.append(
                                                EvidenceUnit(
                                                    evidence_id=f"ev_repo_{file.replace('.md', '')}_{len(local_results)}",
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
                                                    investors=investors,
                                                    content=body[:2000], # Cap content size
                                                    usage_tags=tags,
                                                )
                                            )
                                    except Exception as e:
                                        print(f"[!] Error parsing local file {file}: {e}")
        except Exception as e:
            print(f"[!] Error reading repository: {e}")
        return local_results

    async def _generative_retrieval(
        self, sector: str, geography: str, stage: str, description: str = ""
    ) -> List[EvidenceUnit]:
        if not settings.GOOGLE_API_KEY:
            return []

        prompt = (
            f"You are a Venture Capital Analyst. Use GOOGLE SEARCH to find the 5 most RELEVANT and RECENT "
            f"(2024-2025) funding rounds, news, and regulatory updates for a {stage} startup in {sector} "
            f"located in {geography}.\n\n"
            f"STARTUP CONTEXT: {description}\n\n"
            f"REQUIREMENTS:\n"
            f"1. Identify REAL NAMES of investors and actual funding amounts if mentioned.\n"
            f"2. Summarize each find into a structured format.\n"
            f"3. Return ONLY a JSON list of objects with these keys: source_type, title, source_name, published_year, url, investors, content, usage_tags.\n"
            f"4. source_type must be one of: news, policy, dataset.\n"
        )

        try:
            response = self.model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            print(f"[*] [DEBUG] Generative response received. Length: {len(response.text)}")
            
            data = json.loads(response.text)
            if not isinstance(data, list):
                print(f"[!] [DEBUG] Expected list from LLM, got {type(data)}")
                return []

            units = []
            for i, item in enumerate(data):
                units.append(
                    EvidenceUnit(
                        evidence_id=f"ev_gen_{i}_{hash(item.get('title', str(i)))}",
                        source_type=SourceType(item.get("source_type", "news")),
                        title=item.get("title", "Untitled Source"),
                        source_name=item.get("source_name", "Unknown Source"),
                        published_year=item.get("published_year", 2024),
                        url=item.get("url"),
                        sector=sector,
                        geography=geography,
                        investors=item.get("investors", []),
                        content=item.get("content", ""),
                        usage_tags=item.get("usage_tags", ["generative-retrieval"]),
                    )
                )
            return units
        except Exception as e:
            print(f"[!] Generative retrieval failed with error: {e}")
            import traceback
            traceback.print_exc()
            return []

    async def retrieve_relevant_data(
        self, query: str, context: dict
    ) -> List[EvidenceUnit]:
        return await self.retrieve_relevant_evidence(
            sector=context.get("sector", "General Tech"),
            geography=context.get("geography", "Global"),
            funding_stage=context.get("funding_stage", "Seed"),
        )
