import { getApiBaseUrl } from '@/services/api/config';
import { getSupabaseClient } from '@/services/supabase/client';

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: BodyInit | null;
  auth?: 'none' | 'optional' | 'required';
};

async function getAccessTokenIfNeeded(mode: ApiRequestOptions['auth']) {
  if (mode === 'none') {
    return null;
  }

  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token ?? null;

  if (mode === 'required' && !token) {
    throw new Error('You must sign in before using this feature.');
  }

  return token;
}

async function apiRequest<TResponse>(path: string, options: ApiRequestOptions = {}): Promise<TResponse> {
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
    const accessToken = await getAccessTokenIfNeeded(options.auth ?? 'none');
    const requestInit: RequestInit = {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {}),
      },
    };

    if (typeof options.body !== 'undefined' && options.body !== null) {
      requestInit.body = options.body;
    }

    response = await fetch(`${baseUrl}${path}`, {
      ...requestInit,
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

export async function apiGet<TResponse>(
  path: string,
  options: Pick<ApiRequestOptions, 'auth'> = {},
): Promise<TResponse> {
  return apiRequest<TResponse>(path, {
    method: 'GET',
    auth: options.auth ?? 'none',
  });
}

export async function apiPost<TResponse>(
  path: string,
  options: Pick<ApiRequestOptions, 'auth' | 'body'> = {},
): Promise<TResponse> {
  return apiRequest<TResponse>(path, {
    method: 'POST',
    auth: options.auth ?? 'none',
    body: options.body ?? null,
  });
}

export async function apiDelete<TResponse>(
  path: string,
  options: Pick<ApiRequestOptions, 'auth'> = {},
): Promise<TResponse> {
  return apiRequest<TResponse>(path, {
    method: 'DELETE',
    auth: options.auth ?? 'none',
  });
}
