import { getApiBaseUrl } from '@/services/api/config';

export async function apiGet<TResponse>(path: string): Promise<TResponse> {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    const error = new Error('EXPO_PUBLIC_API_BASE_URL is not configured.');

    if (__DEV__) {
      console.error(`[apiGet] ${path}`, error);
    }

    throw error;
  }

  let response: Response;

  try {
    response = await fetch(`${baseUrl}${path}`, {
      headers: {
        Accept: 'application/json',
      },
    });
  } catch (error) {
    if (__DEV__) {
      console.error(`[apiGet] network failure for ${path}`, error);
    }

    throw error;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJsonResponse = contentType.includes('application/json');
  const payload = isJsonResponse
    ? ((await response.json()) as TResponse & { error?: string })
    : null;
  const textPayload = isJsonResponse ? null : await response.text();

  if (!response.ok) {
    const error = new Error(
      typeof payload === 'object' && payload && 'error' in payload && payload.error
        ? payload.error
        : textPayload
          ? `Request failed with status ${response.status}: ${textPayload.slice(0, 160)}`
          : `Request failed with status ${response.status}.`,
    );

    if (__DEV__) {
      console.error(`[apiGet] ${path}`, {
        status: response.status,
        contentType,
        error,
      });
    }

    throw error;
  }

  if (!isJsonResponse || !payload) {
    const error = new Error(
      `Expected JSON from ${path} but received ${contentType || 'an unknown content type'}.`,
    );

    if (__DEV__) {
      console.error(`[apiGet] ${path}`, {
        status: response.status,
        contentType,
        preview: textPayload?.slice(0, 160) ?? null,
        error,
      });
    }

    throw error;
  }

  return payload;
}
