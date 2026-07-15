function isLocalHostname(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

// Local API responses can contain localhost/127.0.0.1 media URLs from the Mac-hosted
// Supabase stack. Those work on the simulator, but on a physical phone they point
// back to the phone itself. This rewrites only local media hosts to the configured
// LAN-reachable base URL so device builds can stream the same local assets.
export function normalizeMediaUrl(
  assetUrl: string | null,
  options?: { fallbackBaseUrl?: string | null },
) {
  if (!assetUrl) {
    return null;
  }

  try {
    const resolvedAssetUrl = new URL(assetUrl);

    if (!isLocalHostname(resolvedAssetUrl.hostname)) {
      return assetUrl;
    }

    const fallbackBaseUrl = options?.fallbackBaseUrl?.trim();

    if (!fallbackBaseUrl) {
      return assetUrl;
    }

    const resolvedFallbackBaseUrl = new URL(fallbackBaseUrl);
    resolvedAssetUrl.protocol = resolvedFallbackBaseUrl.protocol;
    resolvedAssetUrl.hostname = resolvedFallbackBaseUrl.hostname;
    resolvedAssetUrl.port = resolvedFallbackBaseUrl.port;

    return resolvedAssetUrl.toString();
  } catch {
    return assetUrl;
  }
}
