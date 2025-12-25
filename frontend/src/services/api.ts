/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export interface AnalysisRequest {
  startup_description: string;
  sector: string;
  funding_stage: string;
  geography: string;
  language: string;
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

export const getStats = async (): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/stats`);
  if (!response.ok) throw new Error("Failed to fetch stats");
  return response.json();
};

export const getHistory = async (): Promise<AnalysisResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/history`);
  if (!response.ok) throw new Error("Failed to fetch history");
  return response.json();
};

export const getAnalysisById = async (
  id: string
): Promise<AnalysisResponse> => {
  const response = await fetch(`${API_BASE_URL}/analyses/${id}`);
  if (!response.ok) throw new Error("Failed to fetch analysis");
  return response.json();
};

export const getAllEvidence = async (): Promise<EvidenceUsed[]> => {
  const response = await fetch(`${API_BASE_URL}/evidence`);
  if (!response.ok) throw new Error("Failed to fetch evidence");
  return response.json();
};
