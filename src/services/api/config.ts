export function getApiBaseUrl() {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  return baseUrl && baseUrl.length > 0 ? baseUrl.replace(/\/+$/, "") : null;
}
