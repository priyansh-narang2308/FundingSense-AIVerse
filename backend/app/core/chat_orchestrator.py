import json
from typing import List, Dict, Optional
from app.schemas.chat import ChatRequest, ChatResponse, ChatSource
from app.rag.retriever import Retriever
from app.generation.generator import Generator
from app.core.storage import storage
from google.genai import types

class ChatOrchestrator:
    def __init__(self):
        self.retriever = Retriever()
        self.generator = Generator()

    async def handle_chat(self, request: ChatRequest) -> ChatResponse:
        # 1. Fetch Context if analysis_id is provided
        context_description = ""
        sector = "General"
        geography = "India"
        stage = ""
        
        if request.analysis_id:
            analysis = storage.get_analysis_by_id(request.analysis_id, request.user_id)
            if analysis:
                context_description = analysis.startup_summary
                sector = analysis.metadata.get("sector", "General") if analysis.metadata else "General"
                geography = analysis.metadata.get("geography", "India") if analysis.metadata else "India"
                stage = analysis.metadata.get("stage", "") if analysis.metadata else ""

 
        retrieval_query = request.message
        if request.language != "en":
            try:
                expansion_prompt = (
                    f"Translate and expand the following user question into a professional English search query "
                    f"for venture capital and market analysis.\n\n"
                    f"Original Question: {request.message}\n"
                    f"Context: {sector} startup in {geography}\n\n"
                    "Output ONLY the English search query string."
                )
                expansion_resp = await self.generator.client.aio.models.generate_content(
                    model="gemini-2.0-flash-exp",
                    contents=expansion_prompt
                )
                retrieval_query = expansion_resp.text.strip()
                print(f"[*] [LOG] TRANSLATION-AWARE EXPANSION: '{request.message}' -> '{retrieval_query}'")
            except Exception as e:
                print(f"[!] Expansion failed, falling back to raw message: {e}")

        # 3. Retrieve relevant evidence using the expanded query
        evidence_units = await self.retriever.retrieve_relevant_evidence(
            sector=sector,
            geography=geography,
            funding_stage=stage,
            startup_description=f"{context_description} {retrieval_query}"
        )

        system_prompt = (
            "You are FundingSense AI, acting as the user's Personal VC Lead and Strategy Consultant.\n"
            "Your goal is to provide deep-dive analysis into the user's startup pitch and funding journey.\n"
            "CRITICAL: If 'Internal Context' is provided, your answers MUST be tailored specifically to that startup.\n"
            "Always bridge the gap between human pitch data and Grounded Evidence (market data).\n"
            f"REQUIRED LANGUAGE: {request.language}.\n"
            "FORMATTING: Use clear headings, bullet points, and professional structure. Use bold text for emphasis but ensure it renders cleanly in markdown."
        )

        chat_context = f"Internal Context: {context_description}\nSector: {sector}\nGeography: {geography}\nStage: {stage}\n\n"
        history_str = ""
        if request.chat_history:
            history_str = "Conversation History:\n" + "\n".join([f"{h['role'].upper()}: {h['content']}" for h in request.chat_history]) + "\n\n"

        evidence_str = "Grounded Evidence (Sources found via search & docs):\n" + "\n".join([
            f"- {ev.title} ({ev.source_name}, {ev.published_year}): {ev.content[:300]}..." 
            for ev in evidence_units
        ])

        full_prompt = (
            f"{system_prompt}\n\n"
            f"{chat_context}"
            f"{history_str}"
            f"{evidence_str}\n\n"
            f"USER QUESTION: {request.message}\n"
            f"RESPONSE LANGUAGE: {request.language}\n"
            "ASSISTANT ANSWER:"
        )

        try:
            response = await self.generator.client.aio.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    temperature=0.4
                )
            )
            answer = response.text.strip()
        except Exception as e:
            print(f"[!] Chat generation failed: {e}")
            answer = "I'm sorry, I'm having trouble processing your request right now. Please try again shortly."

        sources = [
            ChatSource(
                title=ev.title,
                url=ev.url,
                source_name=ev.source_name
            ) for ev in evidence_units[:3]
        ]

        return ChatResponse(
            answer=answer,
            sources=sources,
            language=request.language
        )
