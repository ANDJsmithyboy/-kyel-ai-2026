import { api } from './client';

export interface SimulationItem {
  id: string;
  mission_id: string;
  version: number;
  status: string;
  estimated_duration_min_seconds: number;
  estimated_duration_max_seconds: number;
  estimated_cost_low: number;
  estimated_cost_high: number;
  risk_level: string;
  confidence: string;
  summary?: string;
  created_at: string;
}

export interface PredictionItem {
  id: string;
  mission_id: string;
  prediction_type: string;
  confidence: string;
  value_json?: any;
  basis?: any;
  created_at: string;
}

export const simulationsApi = {
  list: (missionId: string) =>
    api.get<SimulationItem[]>(`/api/v1/simulations?mission_id=${missionId}`),

  create: (missionId: string, summary: string, riskLevel = 'LOW', confidence = '0.92', plan?: any) =>
    api.post<SimulationItem>('/api/v1/simulations', {
      mission_id: missionId,
      summary,
      risk_level: riskLevel,
      confidence,
      plan,
    }),

  listPredictions: (missionId: string) =>
    api.get<PredictionItem[]>(`/api/v1/predictions?mission_id=${missionId}`),
};
