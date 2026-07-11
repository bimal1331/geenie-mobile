import { getApiBaseUrl } from '@/services/api/config';

export async function apiGet<TResponse>(path: string): Promise<TResponse> {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL is not configured.');
  }

  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  const payload = (await response.json()) as TResponse & { error?: string };

  if (!response.ok) {
    throw new Error(
      typeof payload === 'object' && payload && 'error' in payload && payload.error
        ? payload.error
        : `Request failed with status ${response.status}.`,
    );
  }

  return payload;
}
