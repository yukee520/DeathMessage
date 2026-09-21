import type { CaseDifficulty } from './content';

export type MessageType = 'incoming' | 'outgoing' | 'system' | 'clue';

export type MessageMood =
  | 'calm'
  | 'fearful'
  | 'angry'
  | 'sad'
  | 'neutral'
  | 'hostile';

export interface Suspect {
  id: string;
  name: string;
  avatarUrl?: string;
  description: string;
  relation?: string;
  isGuilty?: boolean;
}

export interface Clue {
  id: string;
  title: string;
  description: string;
  icon?: string;
  discoveredAt?: string;
}

export interface GameMessage {
  id: string;
  type: MessageType;
  text: string;
  senderId?: string;
  senderName?: string;
  delayMs?: number;
  mood?: MessageMood;
  clueId?: string;
  createdAt?: string;
  isDynamic?: boolean;
}

export interface Choice {
  id: string;
  text: string;
  nextChapterId?: string;
  unlockClues?: string[];
  requiresClue?: string;
  endingId?: string;
  tag?: string;
}

export interface Chapter {
  id: string;
  title: string;
  suspects: Suspect[];
  messages: GameMessage[];
  choices: Choice[];
  llmEnabled: boolean;
  llmPersona?: string;
  allowFreeInput?: boolean;
  clueIds?: string[];
}

export interface Ending {
  id: string;
  title: string;
  description: string;
  rank: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  isTrueEnding?: boolean;
}

export interface CasePackage {
  id: string;
  version: number;
  title: string;
  subtitle: string;
  intro: string;
  coverUrl?: string;
  difficulty: CaseDifficulty;
  tags: string[];
  startChapterId: string;
  suspects: Suspect[];
  clues: Clue[];
  chapters: Chapter[];
  endings: Ending[];
  updatedAt: string;
}

export interface ChatSessionState {
  caseId: string;
  chapterId: string;
  revealedMessageIds: string[];
  selectedChoiceIds: string[];
  unlockedClueIds: string[];
  isTyping: boolean;
  isAwaitingLLM: boolean;
}