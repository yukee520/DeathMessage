export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface CaseCompletion {
  caseId: string;
  endingId: string;
  rank: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  completedAt: string;
  playDurationMs: number;
}

export interface StatBlock {
  totalCasesStarted: number;
  totalCasesCompleted: number;
  totalPlayTimeMs: number;
  totalCluesFound: number;
  totalEndingsUnlocked: number;
}

export interface PlayerProfile {
  displayName: string;
  createdAt: string;
  stats: StatBlock;
  completions: CaseCompletion[];
  achievements: Achievement[];
}