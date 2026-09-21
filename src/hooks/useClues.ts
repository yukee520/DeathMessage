import { useCallback, useMemo } from 'react';
import type { Clue, CasePackage } from '@/types/game';
import { useGameStore } from '@/store/useGameStore';

export interface UseCluesResult {
  unlockedClues: Clue[];
  lockedClues: Clue[];
  allClues: Clue[];
  totalCount: number;
  unlockedCount: number;
  hasClue: (clueId: string) => boolean;
}

export function useClues(
  caseId: string,
  pkg: CasePackage | undefined,
): UseCluesResult {
  const unlockedIds = useGameStore((s) =>
    caseId ? s.sessions[caseId]?.unlockedClueIds ?? [] : [],
  );

  const allClues = useMemo<Clue[]>(() => pkg?.clues ?? [], [pkg]);

  const unlockedClues = useMemo<Clue[]>(
    () => allClues.filter((c) => unlockedIds.includes(c.id)),
    [allClues, unlockedIds],
  );

  const lockedClues = useMemo<Clue[]>(
    () => allClues.filter((c) => !unlockedIds.includes(c.id)),
    [allClues, unlockedIds],
  );

  const hasClue = useCallback(
    (clueId: string): boolean => unlockedIds.includes(clueId),
    [unlockedIds],
  );

  return {
    unlockedClues,
    lockedClues,
    allClues,
    totalCount: allClues.length,
    unlockedCount: unlockedClues.length,
    hasClue,
  };
}