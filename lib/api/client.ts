import Constants from 'expo-constants';

type ApiExtra = { apiUrl?: string };

function readApiUrlFromExtra(extra: unknown): string {
  if (!extra || typeof extra !== 'object') return '';

  const apiUrl = (extra as ApiExtra).apiUrl;
  if (typeof apiUrl !== 'string') return '';

  return apiUrl.trim().replace(/\/$/, '');
}

function parseExpoConfig(value: unknown): Record<string, unknown> | null {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
      return null;
    } catch {
      return null;
    }
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}

function resolveApiBaseUrl(): string {
  const rawSources = [
    Constants.expoConfig,
    Constants.manifest,
    Constants.manifest2,
  ];

  for (const raw of rawSources) {
    const config = parseExpoConfig(raw);
    if (!config) continue;

    const directUrl = readApiUrlFromExtra(config.extra);
    if (directUrl) return directUrl;

    const nestedExtra = (config.extra as { expoClient?: { extra?: ApiExtra } } | undefined)
      ?.expoClient?.extra;
    const nestedUrl = readApiUrlFromExtra(nestedExtra);
    if (nestedUrl) return nestedUrl;
  }

  return '';
}

let cachedApiBaseUrl: string | undefined;

export function getApiBaseUrl(): string {
  if (cachedApiBaseUrl) return cachedApiBaseUrl;

  const url = resolveApiBaseUrl();
  if (url) cachedApiBaseUrl = url;
  return url;
}

export function isApiConfigured(): boolean {
  return getApiBaseUrl().length > 0;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  userId?: string;
  body?: unknown;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    throw new ApiError(0, 'API URL is not configured');
  }

  const { userId, body, headers, ...fetchOptions } = options;

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string> | undefined),
  };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (userId) {
    requestHeaders['X-User-Id'] = userId;
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...fetchOptions,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const errorBody = (await response.json()) as {
        message?: string;
        error?: string;
      };
      message = errorBody.message ?? errorBody.error ?? message;
    } catch {
      try {
        message = (await response.text()) || message;
      } catch {
        // keep statusText
      }
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const result = await apiRequest<{ status?: string; mongo?: string }>('/health');
    return result.status === 'ok' && result.mongo === 'connected';
  } catch {
    return false;
  }
}
