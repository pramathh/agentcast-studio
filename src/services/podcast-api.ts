export interface PodcastRequest {
  topic: string;
  language: string;
  tone: string;
}

export interface ScriptItem {
  Host?: string;
  Guest?: string;
  [key: string]: string | undefined;
}

export interface PodcastResponse {
  status: string;
  script: ScriptItem[];
  original_script?: string | null;
  language: string;
}

export interface TTSRequest {
  script: ScriptItem[];
  language: string;
}

export interface TTSResponse {
  audio_file: string;
  language: string;
}

// Keeping these for reference but not used in simplified flow
export interface TranslationRequest {
  text?: string;
  script?: string;
  target_language: string;
}

export interface TranslationResponse {
  translated_text?: string;
  translated_script?: string;
  original_text?: string;
  original_script?: string;
  language: string;
}

export interface AudioResponse {
  audio_url: string;
}

const API_BASE_URL = 'http://127.0.0.1:8000';

export const generatePodcast = async (request: PodcastRequest): Promise<PodcastResponse> => {
  console.log('Generating podcast with params:', request);

  const response = await fetch(`${API_BASE_URL}/generate-podcast`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // User requested specific body format: topic, tone, language
    body: JSON.stringify({
      topic: request.topic,
      tone: request.tone,
      language: request.language
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to generate podcast: ${errorText}`);
  }

  const data: PodcastResponse = await response.json();
  return data;
};

export const generateSpeech = async (script: ScriptItem[], language: string): Promise<TTSResponse> => {
  console.log('Generatng speech for language:', language);

  const response = await fetch(`${API_BASE_URL}/text-to-speech`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      script,
      language
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to generate audio: ${errorText}`);
  }

  return response.json();
};

export const generateAudio = async (script: string): Promise<AudioResponse> => {
  // Keeping this as is.
  const response = await fetch(`${API_BASE_URL}/generate-audio`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ script }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to generate audio: ${errorText}`);
  }

  return response.json();
};
