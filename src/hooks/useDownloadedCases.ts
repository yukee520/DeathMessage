import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { DownloadedCaseRecord } from '@/types/content';
import { getDownloadedRecords } from '@/api/content';

export function useDownloadedCases(): UseQueryResult<DownloadedCaseRecord[], Error> {
  return useQuery<DownloadedCaseRecord[], Error>({
    queryKey: ['downloaded-cases'],
    queryFn: async () => {
      return await getDownloadedRecords();
    },
    staleTime: 1000 * 30,
  });
}