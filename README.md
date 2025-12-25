# FundingSense: The AI-Driven Funding Intelligence Platform

**FundingSense** is a state-of-the-art, evidence-backed decision intelligence platform designed to bridge the gap between startups and investors. By leveraging a sophisticated **Retriever-Augmented Generation (RAG)** pipeline and **Google Gemini 2.0 Flash**, it provides founders with deep, verifiable insights into their funding readiness.

## Key Features

### Real-World Evidence Retrieval (Live Web Search)
Unlike traditional AI tools that rely on stale training data, FundingSense uses **Gemini 2.0 Web Search Grounding**. It crawls 2024-2025 news, policy documents, and venture databases in real-time to find:
- Actual active investors (Peak XV, Blume, Accel, etc.).
- Recent funding rounds and market trends.
- Up-to-date government policies and regulatory changes.

### Bharat-First Multilingual UI
FundingSense is built for the diverse Indian startup ecosystem, supporting **English + 7 major Indian languages**:
- **Hindi (हिंदी)**, **Bengali (বাংলা)**, **Tamil (தமிழ்)**, **Telugu (తెలుగు)**, **Marathi (मराठी)**, **Gujarati (ગુજરાતી)**, and **Kannada (ಕನ್ನಡ)**.
- **Dynamic AI Translation**: Historical summaries and real-time insights are automatically translated into your preferred language using our custom-built AI translation engine.

### Deep Funding Fit Analysis
- **Fit Score & Confidence**: Proprietary scoring algorithm that calculates the alignment between your startup and current market sentiment.
- **Why This Fits/Does Not Fit**: Bulleted, evidence-backed reasons explaining the AI's reasoning.
- **Recommended Investors**: A curated list of 3-5 VCs with specific reasons for their match.

### Evidence Vault
Every analysis is backed by an "Evidence Vault" containing:
- **News articles** with direct URLs.
- **Policy documents** and datasets.
- **Usage Tags** explaining exactly how each piece of data influenced your report.

---

## Architecture & Tech Stack

FundingSense uses a modern, distributed architecture:

### Frontend
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Vanilla CSS (Fluid UI)
- **Animations**: Framer Motion (motion/react)
- **Components**: Shadcn UI & Lucide Icons
- **Auth**: Supabase Auth
- **State**: React Context API (Language & UI state)

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Brain**: Google Gemini 2.0 Flash (`google-genai` SDK)
- **Vector DB**: ChromaDB for local document retrieval
- **Orchestrator**: Custom RAG pipeline that handles Evidence Retrieval -> Validation -> Report Generation
- **Validation**: Pydantic for strict schema enforcement

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google Gemini API Key

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Mac/Linux
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file from `.env.example`:
   ```bash
   GOOGLE_API_KEY=your_gemini_key_here
   ```
5. Run the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set environment variables in `.env`:
   ```bash
   VITE_API_URL=http://localhost:8000/api/v1
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```

