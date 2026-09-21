export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  status?: number;
  originalError?: unknown;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  persona: string;
  history: LLMMessage[];
  userInput: string;
  caseId: string;
  chapterId: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  reply: string;
  mood?: 'calm' | 'fearful' | 'angry' | 'sad' | 'neutral' | 'hostile';
  suggestedChoices?: string[];
  isFallback: boolean;
}

export interface LLMConfig {
  endpoint: string;
  apiKey: string;
  model: string;
  timeoutMs: number;
}