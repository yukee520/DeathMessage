import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { RemoteCaseIndex } from '@/types/content';
import { fetchRemoteIndex, CONTENT_BASE_URL } from '@/api/content';
import { normalizeError } from '@/utils/errors';
import { useSettingsStore } from '@/store/useSettingsStore';

export function useRemoteCases(): UseQueryResult<RemoteCaseIndex, Error> {
  const contentBaseUrl = useSettingsStore((s) => s.contentBaseUrl);

  return useQuery<RemoteCaseIndex, Error>({
    queryKey: ['remote-cases', contentBaseUrl],
    queryFn: async () => {
      try {
        return await fetchRemoteIndex(contentBaseUrl || CONTENT_BASE_URL);
      } catch (err) {
        throw new Error(normalizeError(err).message);
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    refetchOnMount: true,
  });
}