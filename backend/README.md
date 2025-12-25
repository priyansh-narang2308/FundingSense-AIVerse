# FundingSense: Backend (Intelligence Engine)

The core intelligence layer of **FundingSense**, responsible for evidence retrieval, analysis validation, and report generation using Gemini 2.0.

## 🧠 Brain: Gemini 2.0 Flash
FundingSense uses the latest **Gemini 2.0 Flash** model to provide:
- **Live Search Grounding**: Real-time evidence fetching from the web to avoid hallucinations.
- **RAG Architecture**: Retrieval-Augmented Generation that combines local knowledge (ChromaDB) with live web data.
- **Structured Logic**: Strict Pydantic-enforced JSON outputs for seamless frontend integration.

## 🛠️ Tech Stack
- **FastAPI**: High-performance asynchronous API framework.
- **google-genai SDK**: Modern SDK for Gemini 2.0 integration.
- **ChromaDB**: Native vector database for indexing startup policies and investor portfolios.
- **Uvicorn**: ASGI server for production-grade serving.

## 📡 API Endpoints
- `POST /api/v1/analyze`: Triggers the full RAG pipeline (Retrieval -> Validation -> Generation).
- `POST /api/v1/translate`: Dynamic AI-powered text localization.
- `GET /api/v1/history`: Retrieves analysis history for a specific user.
- `GET /api/v1/stats`: Returns aggregated intelligence metrics.

## ⚙️ Development
To run the backend locally:
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

For the full setup instructions, please refer to the [Root README](../README.md).
