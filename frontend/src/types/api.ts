export interface DetectionResponse {
  result: string;
  success: boolean;
  timestamp: string;
  processing_time: number;
}

export interface HealthResponse {
  status: string;
  api_key_configured: boolean;
  timestamp: string;
}

export interface SupportedSignsResponse {
  signs: string[];
  total: number;
}
