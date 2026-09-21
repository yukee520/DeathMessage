import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { CasePackage } from '@/types/game';
import { readLocalCasePackage } from '@/api/content';
import { normalizeError } from '@/utils/errors';

export function useCaseDetail(
  caseId: string | undefined,
): UseQueryResult<CasePackage, Error> {
  return useQuery<CasePackage, Error>({
    queryKey: ['case-package', caseId],
    enabled: typeof caseId === 'string' && caseId.length > 0,
    queryFn: async () => {
      if (!caseId) {
        throw new Error('Missing case id');
      }
      try {
        const pkg = await readLocalCasePackage(caseId);
        if (!pkg) {
          throw new Error('This case is not downloaded yet.');
        }
        return pkg;
      } catch (err) {
        throw new Error(normalizeError(err).message);
      }
    },
    staleTime: 1000 * 60,
  });
}