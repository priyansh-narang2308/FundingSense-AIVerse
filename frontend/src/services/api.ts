/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export interface AnalysisRequest {
  startup_description: string;
  sector: string;
  funding_stage: string;
  geography: string;
  language: string;
  user_id?: string;
}

export interface InvestorRecommendation {
  name: string;
  fit_score: number;
  logo_initials: string;
  focus_areas: string[];
  reasons: string[];
}

export interface EvidenceUsed {
  source_type: "news" | "policy" | "dataset";
  title: string;
  source_name: string;
  year: string;
  url?: string;
  usage_reason: string;
}

export interface AnalysisResponse {
  analysis_id: string;
  user_id?: string;
  startup_summary: string;
  confidence_indicator: "low" | "medium" | "high";
  overall_score: number;
  recommended_investors: InvestorRecommendation[];
  why_fits: string[];
  why_does_not_fit: string[];
  evidence_used: EvidenceUsed[];
  metadata: {
    language: string;
    engine_version: string;
    evidence_count: number;
    sector?: string;
    stage?: string;
    geography?: string;
  };
  created_at?: string;
}

export const analyzeStartup = async (
  data: AnalysisRequest
): Promise<AnalysisResponse> => {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || "Unable to analyze right now. Please try again."
    );
  }

  return response.json();
};

export const getStats = async (userId?: string): Promise<any> => {
  const url = userId ? `${API_BASE_URL}/stats?user_id=${userId}` : `${API_BASE_URL}/stats`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch stats");
  return response.json();
};

export const getHistory = async (userId?: string): Promise<AnalysisResponse[]> => {
  const url = userId ? `${API_BASE_URL}/history?user_id=${userId}` : `${API_BASE_URL}/history`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch history");
  return response.json();
};

export const getAnalysisById = async (
  id: string,
  userId?: string
): Promise<AnalysisResponse> => {
  const url = userId ? `${API_BASE_URL}/analyses/${id}?user_id=${userId}` : `${API_BASE_URL}/analyses/${id}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch analysis");
  return response.json();
};

export const getAllEvidence = async (userId?: string): Promise<EvidenceUsed[]> => {
  const url = userId ? `${API_BASE_URL}/evidence?user_id=${userId}` : `${API_BASE_URL}/evidence`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch evidence");
  return response.json();
};

export const translateText = async (
  text: string,
  targetLanguage: string
): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, target_language: targetLanguage }),
    });

    if (!response.ok) return text;
    const data = await response.json();
    return data.translated_text || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
};

export interface ChatRequest {
  message: string;
  analysis_id?: string;
  language: string;
  user_id?: string;
  chat_history?: { role: string; content: string }[];
}

export interface ChatResponse {
  answer: string;
  sources: { title: string; url?: string; source_name: string }[];
  language: string;
}

export const chatWithAI = async (data: ChatRequest): Promise<ChatResponse> => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to get answer from AI");
  }

  return response.json();
};

export const getChatMessages = async (userId: string): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/chat/history?user_id=${userId}`);
  if (!response.ok) throw new Error("Failed to fetch chat history");
  return response.json();
};

export const getIntelligenceLibrary = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/intelligence`);
  if (!response.ok) throw new Error("Failed to fetch intelligence library");
  return response.json();
};
