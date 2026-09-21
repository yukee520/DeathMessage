import axios from 'axios';
import type { ApiError } from '@/types/api';

export function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (error.code === 'ECONNABORTED') {
      return {
        code: 'TIMEOUT',
        message: 'The request timed out. Please check your connection and try again.',
        status,
        originalError: error,
      };
    }
    if (!error.response) {
      return {
        code: 'NETWORK',
        message: 'Network error. Please check your internet connection.',
        originalError: error,
      };
    }
    if (status === 404) {
      return {
        code: 'NOT_FOUND',
        message: 'The requested content was not found.',
        status,
        originalError: error,
      };
    }
    if (status === 401 || status === 403) {
      return {
        code: 'UNAUTHORIZED',
        message: 'Access denied. Please verify your API credentials in Settings.',
        status,
        originalError: error,
      };
    }
    if (status && status >= 500) {
      return {
        code: 'SERVER',
        message: 'The server is having trouble. Please try again later.',
        status,
        originalError: error,
      };
    }
    return {
      code: 'HTTP',
      message: error.message || 'An unexpected error occurred.',
      status,
      originalError: error,
    };
  }

  if (error instanceof Error) {
    return {
      code: 'UNKNOWN',
      message: error.message || 'An unexpected error occurred.',
      originalError: error,
    };
  }

  return {
    code: 'UNKNOWN',
    message: 'An unexpected error occurred.',
    originalError: error,
  };
}

export function getUserMessage(error: unknown): string {
  return normalizeError(error).message;
}