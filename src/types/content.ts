export type CaseDifficulty = 'easy' | 'normal' | 'hard' | 'nightmare';

export interface RemoteCaseEntry {
  id: string;
  title: string;
  subtitle: string;
  coverUrl: string;
  difficulty: CaseDifficulty;
  tags: string[];
  minAppVersion: string;
  version: number;
  packageUrl: string;
  packageSize: number;
  checksum: string;
  updatedAt: string;
}

export interface RemoteCaseIndex {
  version: number;
  updatedAt: string;
  cases: RemoteCaseEntry[];
}

export type DownloadStatus =
  | 'not-downloaded'
  | 'downloading'
  | 'downloaded'
  | 'update-available'
  | 'error';

export interface DownloadedCaseRecord {
  id: string;
  version: number;
  localPath: string;
  downloadedAt: string;
  checksum: string;
  sizeBytes: number;
}

export interface DownloadProgress {
  caseId: string;
  bytesWritten: number;
  totalBytes: number;
  percent: number;
}

export interface DownloadJob {
  caseId: string;
  status: DownloadStatus;
  progress: DownloadProgress | null;
  error: string | null;
  startedAt: number;
}

export interface MergedCaseEntry extends RemoteCaseEntry {
  status: DownloadStatus;
  localVersion?: number;
  progressPercent?: number;
}