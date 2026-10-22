import { apiPost } from '@/services/api/client';

function localDate(value: Date) {
  const offset = value.getTimezoneOffset() * 60_000;

  return new Date(value.getTime() - offset).toISOString().slice(0, 10);
}

export async function recordBundlePlay(bundleId: string) {
  const playedAt = new Date();

  await apiPost('/api/mobile/bundle-plays', {
    auth: 'required',
    body: JSON.stringify({
      bundleId,
      playedAt: playedAt.toISOString(),
      localDate: localDate(playedAt),
    }),
  });
}
