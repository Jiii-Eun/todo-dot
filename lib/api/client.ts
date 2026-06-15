const DEFAULT_API_URL = 'http://localhost:5000';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL;

export const isApiConfigured = API_BASE_URL.length > 0;

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

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  if (!isApiConfigured) {
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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const errorBody = (await response.json()) as { message?: string; error?: string };
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
