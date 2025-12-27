export interface PodcastRequest {
  topic: string;
  language: string; // "English", "Kannada", etc.
  tone: string;
}

export interface PodcastResponse {
  status: string;
  script: string; // Backend returns "final_script" which is a string
  original_script: string | null;
  language: string;
}

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

const API_BASE_URL = 'http://localhost:8000';

export const generatePodcast = async (request: PodcastRequest): Promise<PodcastResponse> => {
  // Step 1: Generate Podcast (always defaults to English in backend logic shown)
  console.log('Generating podcast for:', request.topic);
  const genResponse = await fetch(`${API_BASE_URL}/generate-podcast`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: request.topic,
      // Backend request model in user snippet only showed 'topic', 
      // but let's send 'tone' just in case or if it updates later.
      // The snippet provided: `initial_state = { "topic": request.topic, ... }`
      // It doesn't look like 'tone' or 'language' is used in the initial generation, 
      // but we lose nothing by sending them if the backend validates strictly we might need to remove.
      // User snippet shows `request: PodcastRequest`, we assume it allows extras or matches.
      // Actually, user snippet `class PodcastRequest` isn't fully defined but `request.topic` is used.
      // We will send just topic to be safe based on "topic": request.topic usage, 
      // but keep tone if we think it's needed. Let's send the whole request objects properties needed.
    }),
  });

  if (!genResponse.ok) {
    const errorText = await genResponse.text();
    throw new Error(`Failed to generate podcast: ${errorText}`);
  }

  const genData: PodcastResponse = await genResponse.json();

  // Step 2: Handle Translation if language is NOT English
  // The backend defaults to "English" for generated content.
  if (request.language.toLowerCase() !== 'english') {
    console.log(`Translating podcast to ${request.language}...`);
    try {
      const translateResponse = await fetch(`${API_BASE_URL}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: genData.script,
          target_language: request.language,
        }),
      });

      if (!translateResponse.ok) {
        console.warn('Translation failed, returning original English script.');
        // Optional: throw error or return English. returning English is safer fallback.
        const errorText = await translateResponse.text();
        throw new Error(`Translation failed: ${errorText}`);
      }

      const translateData: TranslationResponse = await translateResponse.json();

      return {
        ...genData,
        script: translateData.translated_script || genData.script,
        language: translateData.language,
        original_script: genData.script,
      };
    } catch (error) {
      console.error('Translation error:', error);
      // Decide/User Policy: Fail hard or soft? 
      // User asked to incorporate endpoints. We should probably fail or warn. 
      // Let's rethrow for now so UI shows error, as user explicitly selected a language.
      throw error;
    }
  }

  return genData;
};

export const generateAudio = async (script: string): Promise<AudioResponse> => {
  // Assuming there is a /generate-audio endpoint. 
  // The user prompt didn't show it but previous code had it.
  // We will pass the script string.
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
