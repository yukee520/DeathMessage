import axios, { AxiosInstance } from 'axios';

const DEFAULT_TIMEOUT_MS = 20000;

export const apiClient: AxiosInstance = axios.create({
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export function createClient(baseURL: string, timeoutMs = DEFAULT_TIMEOUT_MS): AxiosInstance {
  return axios.create({
    baseURL,
    timeout: timeoutMs,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
}

export function createAuthClient(
  baseURL: string,
  apiKey: string,
  timeoutMs = 60000,
): AxiosInstance {
  return axios.create({
    baseURL,
    timeout: timeoutMs,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: apiKey ? `Bearer ${apiKey}` : undefined,
    },
  });
}