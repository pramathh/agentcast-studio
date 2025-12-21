export interface PodcastRequest {
  topic: string;
  language: string;
  tone: string;
}

export interface PodcastResponse {
  status: string;
  script: string;
  original_script: string | null;
  language: string;
}

export interface AudioResponse {
  audio_url: string;
}

const API_BASE_URL = 'http://localhost:8000';

export const generatePodcast = async (request: PodcastRequest): Promise<PodcastResponse> => {
  const response = await fetch(`${API_BASE_URL}/generate-podcast`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to generate podcast');
  }

  return response.json();
};

export const generateAudio = async (script: string): Promise<AudioResponse> => {
  const response = await fetch(`${API_BASE_URL}/generate-audio`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ script }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate audio');
  }

  return response.json();
};
