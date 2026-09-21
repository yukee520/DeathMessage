import type { Ending, CasePackage } from '@/types/game';
import { readLocalCasePackage } from './content';
import { normalizeError } from '@/utils/errors';

export async function getEndingById(
  caseId: string,
  endingId: string,
): Promise<Ending | null> {
  try {
    const pkg: CasePackage | null = await readLocalCasePackage(caseId);
    if (!pkg) return null;
    return pkg.endings.find((e) => e.id === endingId) ?? null;
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function getAllEndings(caseId: string): Promise<Ending[]> {
  try {
    const pkg: CasePackage | null = await readLocalCasePackage(caseId);
    if (!pkg) return [];
    return pkg.endings;
  } catch (err) {
    throw normalizeError(err);
  }
}