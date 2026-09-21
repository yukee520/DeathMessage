import RNFS from 'react-native-fs';
import type {
  RemoteCaseIndex,
  RemoteCaseEntry,
  DownloadedCaseRecord,
} from '@/types/content';
import type { CasePackage } from '@/types/game';
import { createClient } from './client';
import { normalizeError } from '@/utils/errors';
import { verifyChecksum } from '@/utils/checksum';
import { getItem, setItem, StorageKeys } from '@/utils/storage';

export const CONTENT_BASE_URL =
  'https://raw.githubusercontent.com/yukee520/death-message-content/main';

const CASES_DIR = `${RNFS.DocumentDirectoryPath}/cases`;

async function ensureCasesDir(): Promise<void> {
  const exists = await RNFS.exists(CASES_DIR);
  if (!exists) {
    await RNFS.mkdir(CASES_DIR);
  }
}

function cacheBust(url: string): string {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}t=${Date.now()}`;
}

export async function fetchRemoteIndex(baseUrl: string = CONTENT_BASE_URL): Promise<RemoteCaseIndex> {
  try {
    const client = createClient(baseUrl);
    const res = await client.get<RemoteCaseIndex>('/index.json', {
      params: { t: Date.now() },
    });
    if (!res.data || !Array.isArray(res.data.cases)) {
      throw new Error('Invalid case index format');
    }
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export function getLocalCasePath(caseId: string): string {
  return `${CASES_DIR}/${caseId}.json`;
}

export async function isCaseDownloaded(caseId: string): Promise<boolean> {
  try {
    const path = getLocalCasePath(caseId);
    return await RNFS.exists(path);
  } catch {
    return false;
  }
}

export async function readLocalCasePackage(caseId: string): Promise<CasePackage | null> {
  try {
    const path = getLocalCasePath(caseId);
    const exists = await RNFS.exists(path);
    if (!exists) return null;
    const raw = await RNFS.readFile(path, 'utf8');
    return JSON.parse(raw) as CasePackage;
  } catch {
    return null;
  }
}

export async function getDownloadedRecords(): Promise<DownloadedCaseRecord[]> {
  const records = await getItem<DownloadedCaseRecord[]>(StorageKeys.DOWNLOADED_CASES);
  return records ?? [];
}

export async function saveDownloadedRecords(records: DownloadedCaseRecord[]): Promise<void> {
  await setItem(StorageKeys.DOWNLOADED_CASES, records);
}

export interface DownloadCallbacks {
  onProgress?: (bytesWritten: number, totalBytes: number) => void;
}

export async function downloadCasePackage(
  entry: RemoteCaseEntry,
  callbacks: DownloadCallbacks = {},
): Promise<DownloadedCaseRecord> {
  await ensureCasesDir();

  const destination = getLocalCasePath(entry.id);
  const tempDestination = `${destination}.tmp`;
  const url = cacheBust(entry.packageUrl);

  try {
    const result = await RNFS.downloadFile({
      fromUrl: url,
      toFile: tempDestination,
      progress: (res) => {
        if (callbacks.onProgress) {
          callbacks.onProgress(res.bytesWritten, res.contentLength);
        }
      },
    }).promise;

    if (result.statusCode !== 200) {
      throw new Error(`Download failed with status ${result.statusCode}`);
    }

    const raw = await RNFS.readFile(tempDestination, 'utf8');

    let parsed: CasePackage;
    try {
      parsed = JSON.parse(raw) as CasePackage;
    } catch {
      throw new Error('Downloaded file is not valid JSON');
    }

    if (!parsed.id || !Array.isArray(parsed.chapters)) {
      throw new Error('Downloaded case package is malformed');
    }

    if (entry.checksum && !verifyChecksum(raw, entry.checksum)) {
      throw new Error('Checksum mismatch — file may be corrupted');
    }

    const exists = await RNFS.exists(destination);
    if (exists) {
      await RNFS.unlink(destination);
    }
    await RNFS.moveFile(tempDestination, destination);

    const size = await RNFS.stat(destination);
    const record: DownloadedCaseRecord = {
      id: entry.id,
      version: entry.version,
      localPath: destination,
      downloadedAt: new Date().toISOString(),
      checksum: entry.checksum,
      sizeBytes: Number(size.size) || 0,
    };

    const records = await getDownloadedRecords();
    const filtered = records.filter((r) => r.id !== entry.id);
    filtered.push(record);
    await saveDownloadedRecords(filtered);

    return record;
  } catch (err) {
    try {
      const tmpExists = await RNFS.exists(tempDestination);
      if (tmpExists) await RNFS.unlink(tempDestination);
    } catch {
      // ignore cleanup errors
    }
    throw normalizeError(err);
  }
}

export async function deleteCasePackage(caseId: string): Promise<void> {
  try {
    const path = getLocalCasePath(caseId);
    const exists = await RNFS.exists(path);
    if (exists) {
      await RNFS.unlink(path);
    }
    const records = await getDownloadedRecords();
    await saveDownloadedRecords(records.filter((r) => r.id !== caseId));
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function getCaseLocalVersion(caseId: string): Promise<number | null> {
  const records = await getDownloadedRecords();
  const found = records.find((r) => r.id === caseId);
  return found ? found.version : null;
}