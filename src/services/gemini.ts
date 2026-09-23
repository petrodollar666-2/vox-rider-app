export interface Example {
  en: string;
  vi: string;
}

export interface VocabularyWord {
  englishWord: string;
  vietnameseMeaning: string;
  examples: Example[]; // Đảm bảo đúng 2 ví dụ
}

export interface VocabularyResponse {
  words: VocabularyWord[];
}

export interface GenerateVocabularyOptions {
  topic: string;
  apiKey?: string;
  model?: string;
  signal?: AbortSignal;
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_PRIMARY_MODEL = 'gemini-2.0-flash';
const FALLBACK_MODEL = 'gemini-1.5-flash';

// JSON Schema nghiêm ngặt cho Gemini Structured Outputs
const VOCABULARY_JSON_SCHEMA = {
  type: 'OBJECT',
  properties: {
    words: {
      type: 'ARRAY',
      description: 'Danh sách chính xác 10 từ vựng tiếng Anh theo chủ đề được yêu cầu',
      items: {
        type: 'OBJECT',
        properties: {
          englishWord: {
            type: 'STRING',
            description: 'Từ vựng hoặc cụm từ tiếng Anh chuẩn'
          },
          vietnameseMeaning: {
            type: 'STRING',
            description: 'Nghĩa tiếng Việt ngắn gọn, chuẩn xác và tự nhiên'
          },
          examples: {
            type: 'ARRAY',
            description: 'Chính xác 2 câu ví dụ thực tế minh họa cách dùng trong ngữ cảnh',
            items: {
              type: 'OBJECT',
              properties: {
                en: {
                  type: 'STRING',
                  description: 'Câu ví dụ hoàn chỉnh bằng tiếng Anh chứa từ vựng'
                },
                vi: {
                  type: 'STRING',
                  description: 'Bản dịch tiếng Việt tự nhiên và chuẩn xác của câu ví dụ'
                }
              },
              required: ['en', 'vi']
            }
          }
        },
        required: ['englishWord', 'vietnameseMeaning', 'examples']
      }
    }
  },
  required: ['words']
};

/**
 * Lấy Gemini API key từ tham số, biến môi trường Vite (.env), hoặc localStorage
 */
export function getGeminiApiKey(customKey?: string): string {
  if (customKey && customKey.trim()) {
    return customKey.trim();
  }

  // Đọc từ localStorage (hỗ trợ nhập API key trực tiếp trên UI settings)
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedKey = window.localStorage.getItem('gemini_api_key');
    if (storedKey && storedKey.trim()) {
      return storedKey.trim();
    }
  }

  return '';
}

/**
 * Phục vụ generate
 */
async function callGeminiApi(
  model: string,
  apiKey: string,
  topic: string,
  signal?: AbortSignal
): Promise<VocabularyResponse> {
  const systemPrompt = `You are a high-level English language instructor for Vietnamese students.
Your mission is to generate exactly 10 high-frequency, practical English vocabulary words or expressions for the topic: "${topic.trim()}".
For each vocabulary word:
1. Provide the English word/phrase ('englishWord').
2. Provide natural Vietnamese meaning ('vietnameseMeaning').
3. Provide EXACTLY 2 practical, natural example sentences in everyday or professional contexts:
   - 'en': English sentence using the word.
   - 'vi': Vietnamese translation of the example sentence.

Strictly adhere to the JSON schema.`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: systemPrompt
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: VOCABULARY_JSON_SCHEMA,
      temperature: 0.7
    }
  };

  const response = await fetch(`${GEMINI_API_URL}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody),
    signal
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error?.message || `HTTP error ${response.status}: ${response.statusText}`;
    throw new Error(`[Gemini ${model} Error ${response.status}]: ${errorMessage}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Không nhận được nội dung phản hồi từ Gemini API.');
  }

  let cleanedText = rawText.trim();
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const parsed = JSON.parse(cleanedText) as VocabularyResponse;
  return parsed;
}

export async function fetchVocabularyByTopic(
  topic: string,
  apiKey?: string
): Promise<VocabularyResponse> {
  const resolvedApiKey = getGeminiApiKey(apiKey);
  if (!resolvedApiKey) {
    throw new Error('Chưa cấu hình Gemini API Key.');
  }
  const cleanTopic = topic.trim();
  try {
    return await callGeminiApi(DEFAULT_PRIMARY_MODEL, resolvedApiKey, cleanTopic);
  } catch (primaryError) {
    console.warn(`Lỗi khi gọi ${DEFAULT_PRIMARY_MODEL}, thử lại với ${FALLBACK_MODEL}:`, primaryError);
    return await callGeminiApi(FALLBACK_MODEL, resolvedApiKey, cleanTopic);
  }
}
