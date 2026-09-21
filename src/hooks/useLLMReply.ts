import { useMemo } from 'react';
import type { LLMConfig } from '@/types/api';
import { useSettingsStore } from '@/store/useSettingsStore';

export interface UseLLMReplyResult {
  config: LLMConfig;
  isConfigured: boolean;
}

export function useLLMReply(): UseLLMReplyResult {
  const endpoint = useSettingsStore((s) => s.llmEndpoint);
  const apiKey = useSettingsStore((s) => s.llmApiKey);
  const model = useSettingsStore((s) => s.llmModel);
  const timeoutMs = useSettingsStore((s) => s.llmTimeoutMs);

  const config = useMemo<LLMConfig>(
    () => ({
      endpoint,
      apiKey,
      model,
      timeoutMs,
    }),
    [endpoint, apiKey, model, timeoutMs],
  );

  return {
    config,
    isConfigured: endpoint.length > 0 && apiKey.length > 0,
  };
}