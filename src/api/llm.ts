import type {
  LLMRequest,
  LLMResponse,
  LLMConfig,
  LLMMessage,
} from '@/types/api';
import { createAuthClient } from './client';
import { normalizeError } from '@/utils/errors';

const DEFAULT_CONFIG: LLMConfig = {
  endpoint: '',
  apiKey: '',
  model: 'gpt-4o-mini',
  timeoutMs: 60000,
};

function buildSystemPrompt(req: LLMRequest): string {
  return [
    req.persona,
    '',
    '你正在一款恐怖推理文字游戏中扮演一名角色。',
    '玩家的输入是他们在游戏中的对话或行动。',
    '请用简短、沉浸、符合角色的方式回应（1-3 句话）。',
    '保持恐怖悬疑的氛围。不要脱离角色。',
    '不要暴露你是 AI。不要使用任何 emoji。',
    '如果需要，可以反问玩家来推进剧情。',
  ].join('\n');
}

function buildMessages(req: LLMRequest): LLMMessage[] {
  const messages: LLMMessage[] = [
    { role: 'system', content: buildSystemPrompt(req) },
  ];
  for (const m of req.history) {
    messages.push(m);
  }
  messages.push({ role: 'user', content: req.userInput });
  return messages;
}

function buildFallbackReply(req: LLMRequest): LLMResponse {
  const fallbacks = [
    '……（对方沉默了一会儿）……你确定要继续问下去吗？',
    '我不知道……我真的不知道……别再逼我了。',
    '（信号似乎受到了干扰）……你听到了吗？那声音……',
    '……你不该来这里的。现在走还来得及。',
    '（长长的呼吸声）……告诉我，你真的想知道真相吗？',
  ];
  const pick = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  return {
    reply: pick,
    mood: 'fearful',
    isFallback: true,
  };
}

export async function requestLLMReply(
  req: LLMRequest,
  config: LLMConfig = DEFAULT_CONFIG,
): Promise<LLMResponse> {
  if (!config.endpoint || !config.apiKey) {
    return buildFallbackReply(req);
  }

  try {
    const client = createAuthClient(config.endpoint, config.apiKey, config.timeoutMs);
    const res = await client.post<{
      choices?: Array<{ message?: { content?: string } }>;
      reply?: string;
    }>('', {
      model: config.model,
      messages: buildMessages(req),
      temperature: req.temperature ?? 0.85,
      max_tokens: req.maxTokens ?? 220,
    });

    const reply =
      res.data.reply ??
      res.data.choices?.[0]?.message?.content ??
      '';

    if (!reply.trim()) {
      return buildFallbackReply(req);
    }

    return {
      reply: reply.trim(),
      mood: 'neutral',
      isFallback: false,
    };
  } catch (err) {
    const normalized = normalizeError(err);
    if (__DEV__) {
      console.warn('[LLM] request failed:', normalized.message);
    }
    return buildFallbackReply(req);
  }
}