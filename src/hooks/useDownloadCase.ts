import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import type { RemoteCaseEntry } from '@/types/content';
import { downloadCasePackage, deleteCasePackage } from '@/api/content';
import { useDownloadStore } from '@/store/useDownloadStore';
import { normalizeError } from '@/utils/errors';

export interface UseDownloadCaseResult {
  start: (entry: RemoteCaseEntry) => Promise<void>;
  remove: (caseId: string) => Promise<void>;
  isDownloading: (caseId: string) => boolean;
  progressOf: (caseId: string) => number;
  errorOf: (caseId: string) => string | null;
}

export function useDownloadCase(): UseDownloadCaseResult {
  const queryClient = useQueryClient();
  const jobs = useDownloadStore((s) => s.jobs);
  const beginJob = useDownloadStore((s) => s.beginJob);
  const updateProgress = useDownloadStore((s) => s.updateProgress);
  const completeJob = useDownloadStore((s) => s.completeJob);
  const failJob = useDownloadStore((s) => s.failJob);
  const clearJob = useDownloadStore((s) => s.clearJob);

  const [pending, setPending] = useState<Record<string, boolean>>({});

  const start = useCallback(
    async (entry: RemoteCaseEntry): Promise<void> => {
      if (pending[entry.id]) return;
      setPending((p) => ({ ...p, [entry.id]: true }));
      beginJob(entry.id);

      try {
        await downloadCasePackage(entry, {
          onProgress: (bytesWritten, totalBytes) => {
            updateProgress(entry.id, bytesWritten, totalBytes);
          },
        });

        completeJob(entry.id);
        Toast.show({
          type: 'success',
          text1: 'Download complete',
          text2: `${entry.title} is ready to play.`,
          position: 'bottom',
        });

        await queryClient.invalidateQueries({ queryKey: ['downloaded-cases'] });
        await queryClient.invalidateQueries({ queryKey: ['downloaded-case-version', entry.id] });
        await queryClient.invalidateQueries({ queryKey: ['case-package', entry.id] });
      } catch (err) {
        const message = normalizeError(err).message;
        failJob(entry.id, message);
        Toast.show({
          type: 'error',
          text1: 'Download failed',
          text2: message,
          position: 'bottom',
        });
      } finally {
        setPending((p) => {
          const next = { ...p };
          delete next[entry.id];
          return next;
        });
      }
    },
    [pending, beginJob, updateProgress, completeJob, failJob, queryClient],
  );

  const remove = useCallback(
    async (caseId: string): Promise<void> => {
      try {
        await deleteCasePackage(caseId);
        clearJob(caseId);
        Toast.show({
          type: 'success',
          text1: 'Removed',
          text2: 'Case data deleted from this device.',
          position: 'bottom',
        });
        await queryClient.invalidateQueries({ queryKey: ['downloaded-cases'] });
        await queryClient.invalidateQueries({ queryKey: ['case-package', caseId] });
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Delete failed',
          text2: normalizeError(err).message,
          position: 'bottom',
        });
      }
    },
    [clearJob, queryClient],
  );

  const isDownloading = useCallback(
    (caseId: string): boolean => jobs[caseId]?.status === 'downloading',
    [jobs],
  );

  const progressOf = useCallback(
    (caseId: string): number => jobs[caseId]?.progress?.percent ?? 0,
    [jobs],
  );

  const errorOf = useCallback(
    (caseId: string): string | null => jobs[caseId]?.error ?? null,
    [jobs],
  );

  return { start, remove, isDownloading, progressOf, errorOf };
}