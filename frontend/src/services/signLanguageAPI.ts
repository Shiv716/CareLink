import { DetectionResponse, HealthResponse, SupportedSignsResponse } from '@/types/api';

const API_BASE = 'http://localhost:8000';

export class SignLanguageAPI {
  static async detectSign(videoBlob: Blob): Promise<DetectionResponse> {
    const formData = new FormData();
    formData.append('file', videoBlob, 'recording.webm');

    const response = await fetch(`${API_BASE}/detect`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Detection failed: ${response.statusText}`);
    }

    return response.json();
  }

  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/health`);
      const data: HealthResponse = await response.json();
      return data.status === 'healthy';
    } catch {
      return false;
    }
  }

  static async getSupportedSigns(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE}/supported-signs`);
      const data: SupportedSignsResponse = await response.json();
      return data.signs;
    } catch {
      return [];
    }
  }
}
