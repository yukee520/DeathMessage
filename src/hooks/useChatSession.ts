import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  CasePackage,
  Chapter,
  Choice,
  GameMessage,
} from '@/types/game';
import { useGameStore } from '@/store/useGameStore';
import { useLLMReply } from './useLLMReply';
import { requestLLMReply } from '@/api/llm';
import { useSettingsStore } from '@/store/useSettingsStore';

export interface UseChatSessionResult {
  chapter: Chapter | undefined;
  visibleMessages: GameMessage[];
  availableChoices: Choice[];
  isTyping: boolean;
  isAwaitingLLM: boolean;
  submitChoice: (choice: Choice) => void;
  submitFreeText: (text: string) => Promise<void>;
}

export function useChatSession(
  pkg: CasePackage | undefined,
  initialChapterId?: string,
): UseChatSessionResult {
  const caseId = pkg?.id ?? '';
  const store = useGameStore();
  const session = store.getSession(caseId);

  const startChapterId =
    session?.chapterId ||
    initialChapterId ||
    pkg?.startChapterId ||
    '';

  const [chapterId, setChapterId] = useState<string>(startChapterId);
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isAwaitingLLM, setIsAwaitingLLM] = useState<boolean>(false);
  const [dynamicMessages, setDynamicMessages] = useState<GameMessage[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const settings = useSettingsStore();
  const llmHook = useLLMReply();

  const chapter = useMemo<Chapter | undefined>(() => {
    if (!pkg) return undefined;
    return pkg.chapters.find((c) => c.id === chapterId);
  }, [pkg, chapterId]);

  const revealedFromStore = session?.revealedMessageIds ?? [];

  useEffect(() => {
    if (!chapter) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVisibleCount(0);
    setDynamicMessages([]);
    setIsTyping(false);

    let cancelled = false;
    const baseCount = revealedFromStore.filter((id) =>
      chapter.messages.some((m) => m.id === id),
    ).length;

    const startFrom = Math.max(baseCount, 0);
    let index = startFrom;

    const revealNext = (): void => {
      if (cancelled) return;
      if (index >= chapter.messages.length) {
        setIsTyping(false);
        return;
      }
      const msg = chapter.messages[index];
      const delay = msg.delayMs ?? 800;

      if (msg.type === 'incoming' || msg.type === 'clue') {
        setIsTyping(true);
      }

      timeoutRef.current = setTimeout(() => {
        if (cancelled) return;
        setIsTyping(false);
        setVisibleCount((c) => c + 1);
        store.revealMessage(caseId, msg.id);
        if (msg.clueId) {
          store.unlockClue(caseId, msg.clueId);
        }
        index += 1;
        revealNext();
      }, delay);
    };

    revealNext();

    return () => {
      cancelled = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter?.id, caseId]);

  const visibleMessages = useMemo<GameMessage[]>(() => {
    if (!chapter) return [];
    const scripted = chapter.messages.slice(0, visibleCount);
    return [...scripted, ...dynamicMessages];
  }, [chapter, visibleCount, dynamicMessages]);

  const scriptedDone = chapter ? visibleCount >= chapter.messages.length : false;

  const availableChoices = useMemo<Choice[]>(() => {
    if (!chapter || !scriptedDone) return [];
    return chapter.choices.filter((c) => {
      if (!c.requiresClue) return true;
      return store.hasClue(caseId, c.requiresClue);
    });
  }, [chapter, scriptedDone, caseId, store]);

  const submitChoice = useCallback(
    (choice: Choice): void => {
      if (!chapter) return;
      store.recordChoice(caseId, choice.id);
      if (choice.unlockClues) {
        for (const clueId of choice.unlockClues) {
          store.unlockClue(caseId, clueId);
        }
      }
      if (choice.nextChapterId) {
        store.setChapter(caseId, choice.nextChapterId);
        setChapterId(choice.nextChapterId);
        setVisibleCount(0);
        setDynamicMessages([]);
      }
    },
    [chapter, caseId, store],
  );

  const submitFreeText = useCallback(
    async (text: string): Promise<void> => {
      if (!chapter || !pkg) return;
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMessage: GameMessage = {
        id: `user-${Date.now()}`,
        type: 'outgoing',
        text: trimmed,
        createdAt: new Date().toISOString(),
      };
      setDynamicMessages((prev) => [...prev, userMessage]);
      store.recordChoice(caseId, `free-${userMessage.id}`);
      setIsAwaitingLLM(true);

      try {
        const history = [...visibleMessages, userMessage]
          .filter((m) => m.type === 'incoming' || m.type === 'outgoing')
          .slice(-10)
          .map((m) => ({
            role: (m.type === 'outgoing' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: m.text,
          }));

        const res = await requestLLMReply(
          {
            persona: chapter.llmPersona ?? '你是一名神秘的对话者。',
            history,
            userInput: trimmed,
            caseId: pkg.id,
            chapterId: chapter.id,
          },
          llmHook.config,
        );

        const replyMessage: GameMessage = {
          id: `llm-${Date.now()}`,
          type: 'incoming',
          text: res.reply,
          senderName: chapter.suspects[0]?.name ?? 'Unknown',
          senderId: chapter.suspects[0]?.id,
          mood: res.mood,
          createdAt: new Date().toISOString(),
          isDynamic: true,
        };

        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setDynamicMessages((prev) => [...prev, replyMessage]);
        }, 900);
      } finally {
        setIsAwaitingLLM(false);
      }
    },
    [chapter, pkg, visibleMessages, caseId, store, llmHook.config],
  );

  return {
    chapter,
    visibleMessages,
    availableChoices,
    isTyping,
    isAwaitingLLM,
    submitChoice,
    submitFreeText,
  };
}