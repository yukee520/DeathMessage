import { create } from 'zustand';
import type { DownloadJob, DownloadProgress, DownloadStatus } from '@/types/content';

interface DownloadState {
  jobs: Record<string, DownloadJob>;
  beginJob: (caseId: string) => void;
  updateProgress: (caseId: string, bytesWritten: number, totalBytes: number) => void;
  completeJob: (caseId: string) => void;
  failJob: (caseId: string, message: string) => void;
  clearJob: (caseId: string) => void;
  clearAll: () => void;
  getStatus: (caseId: string) => DownloadStatus;
}

export const useDownloadStore = create<DownloadState>((set, get) => ({
  jobs: {},
  beginJob: (caseId: string) =>
    set((state) => ({
      jobs: {
        ...state.jobs,
        [caseId]: {
          caseId,
          status: 'downloading',
          progress: {
            caseId,
            bytesWritten: 0,
            totalBytes: 0,
            percent: 0,
          },
          error: null,
          startedAt: Date.now(),
        },
      },
    })),
  updateProgress: (caseId: string, bytesWritten: number, totalBytes: number) =>
    set((state) => {
      const existing = state.jobs[caseId];
      if (!existing) return state;
      const percent = totalBytes > 0 ? Math.min(100, (bytesWritten / totalBytes) * 100) : 0;
      const progress: DownloadProgress = {
        caseId,
        bytesWritten,
        totalBytes,
        percent,
      };
      return {
        jobs: {
          ...state.jobs,
          [caseId]: { ...existing, progress, status: 'downloading' },
        },
      };
    }),
  completeJob: (caseId: string) =>
    set((state) => {
      const existing = state.jobs[caseId];
      if (!existing) return state;
      return {
        jobs: {
          ...state.jobs,
          [caseId]: {
            ...existing,
            status: 'downloaded',
            progress: existing.progress
              ? { ...existing.progress, percent: 100 }
              : null,
            error: null,
          },
        },
      };
    }),
  failJob: (caseId: string, message: string) =>
    set((state) => {
      const existing = state.jobs[caseId];
      if (!existing) return state;
      return {
        jobs: {
          ...state.jobs,
          [caseId]: { ...existing, status: 'error', error: message },
        },
      };
    }),
  clearJob: (caseId: string) =>
    set((state) => {
      const next = { ...state.jobs };
      delete next[caseId];
      return { jobs: next };
    }),
  clearAll: () => set({ jobs: {} }),
  getStatus: (caseId: string): DownloadStatus => {
    const job = get().jobs[caseId];
    return job ? job.status : 'not-downloaded';
  },
}));