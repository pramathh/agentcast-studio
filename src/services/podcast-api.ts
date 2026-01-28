export interface PodcastRequest {
  topic: string;
  language: string; // "English", "Kannada", etc.
  tone: string;
}

export interface PodcastResponse {
  status: string;
  script: Array<Record<string, string>>; // List of { "Speaker": "Text" } objects
  original_script: Array<Record<string, string>> | null;
  language: string;
}

export interface TranslationRequest {
  text?: string;
  script?: Array<Record<string, string>>;
  target_language: string;
}

export interface TranslationResponse {
  translated_text?: string;
  translated_script?: Array<Record<string, string>>;
  original_text?: string;
  original_script?: Array<Record<string, string>>;
  language: string;
}



const API_BASE_URL = '';

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
      tone: request.tone,
      language: request.language,
    }),
  });

  if (!genResponse.ok) {
    const errorText = await genResponse.text();
    throw new Error(`Failed to generate podcast: ${errorText}`);
  }

  const genData = await genResponse.json();
  // Backend returns 'script' which is a list of objects
  const scriptContent = genData.script || [];

  const responseData: PodcastResponse = {
    language: request.language,
    ...genData,
    script: scriptContent,
  };

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
          script: responseData.script,
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
        ...responseData,
        script: translateData.translated_script || responseData.script,
        language: translateData.language,
        original_script: responseData.script,
      };
    } catch (error) {
      console.error('Translation error:', error);
      // Decide/User Policy: Fail hard or soft? 
      // User asked to incorporate endpoints. We should probably fail or warn. 
      // Let's rethrow for now so UI shows error, as user explicitly selected a language.
      throw error;
    }
  }

  return responseData;
};



export interface TTSRequest {
  script: Array<Record<string, string>>;
  language: string;
}

export interface TTSResponse {
  audio_file: string;
  language: string;
}

export const generateTTS = async (request: TTSRequest): Promise<TTSResponse> => {
  console.log(`Generating TTS for language: ${request.language}`);
  const response = await fetch(`${API_BASE_URL}/text-to-speech`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to generate TTS: ${errorText}`);
  }

  return response.json();
};
