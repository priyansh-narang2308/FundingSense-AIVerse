import asyncio
from app.rag.retriever import Retriever
from app.config.settings import settings

async def test_retrieval():
    retriever = Retriever()
    print("Testing retrieval for Fintech in India...")
    results = await retriever.retrieve_relevant_evidence(
        sector="Fintech",
        geography="India",
        funding_stage="Seed",
        startup_description="A UPI based lending app"
    )
    print(f"Total results: {len(results)}")
    for i, r in enumerate(results):
        print(f"{i+1}. {r.title} ({r.source_name}) - Tags: {r.usage_tags}")

if __name__ == "__main__":
    asyncio.run(test_retrieval())
