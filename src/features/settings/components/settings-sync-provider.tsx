import { useEffect, useMemo, useRef } from 'react';

import { useAuthStore } from '@/features/auth/store/auth-store';
import {
  fetchUserPlaybackSettings,
  normalizePlaybackSettings,
  upsertUserPlaybackSettings,
} from '@/features/settings/services/user-settings-service';
import { useSettingsStore } from '@/features/settings/store/settings-store';
import type { PlaybackSettings } from '@/features/settings/types';

function serializePlaybackSettings(settings: PlaybackSettings) {
  return JSON.stringify({
    affirmationGapMs: settings.affirmationGapMs,
    musicVolume: settings.musicVolume,
    voiceVolume: settings.voiceVolume,
    bundleRepeatDurationMinutes: settings.bundleRepeatDurationMinutes,
    selectedVoice: settings.selectedVoice,
    selectedMusicTrackId: settings.selectedMusicTrackId,
  });
}

export function SettingsSyncProvider() {
  const authStatus = useAuthStore((state) => state.status);
  const session = useAuthStore((state) => state.session);
  const hasHydrated = useSettingsStore((state) => state.hasHydrated);
  const affirmationGapMs = useSettingsStore((state) => state.affirmationGapMs);
  const musicVolume = useSettingsStore((state) => state.musicVolume);
  const voiceVolume = useSettingsStore((state) => state.voiceVolume);
  const bundleRepeatDurationMinutes = useSettingsStore(
    (state) => state.bundleRepeatDurationMinutes,
  );
  const selectedVoice = useSettingsStore((state) => state.selectedVoice);
  const selectedMusicTrackId = useSettingsStore((state) => state.selectedMusicTrackId);
  const replaceSettings = useSettingsStore((state) => state.replaceSettings);

  // These refs coordinate initial user-level sync so we do not overwrite server data
  // with defaults or save the same settings repeatedly during hydration/login changes.
  const syncedUserIdRef = useRef<string | null>(null);
  const syncingUserIdRef = useRef<string | null>(null);
  const lastPersistedSettingsRef = useRef<string | null>(null);
  const isApplyingRemoteSettingsRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentSettings = useMemo(
    () =>
      normalizePlaybackSettings({
        affirmationGapMs,
        musicVolume,
        voiceVolume,
        bundleRepeatDurationMinutes,
        selectedVoice,
        selectedMusicTrackId,
      }),
    [
      affirmationGapMs,
      bundleRepeatDurationMinutes,
      musicVolume,
      selectedMusicTrackId,
      selectedVoice,
      voiceVolume,
    ],
  );

  const serializedSettings = useMemo(
    () => serializePlaybackSettings(currentSettings),
    [currentSettings],
  );

  useEffect(() => {
    // Wait until local settings hydration finishes, otherwise we could push defaults
    // to the server before the user's real local settings are loaded.
    if (!hasHydrated || authStatus !== 'ready') {
      return;
    }

    const userId = session?.userId ?? null;

    if (!userId) {
      syncedUserIdRef.current = null;
      syncingUserIdRef.current = null;
      lastPersistedSettingsRef.current = null;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      return;
    }

    if (syncedUserIdRef.current === userId) {
      return;
    }

    if (syncingUserIdRef.current === userId) {
      return;
    }

    let isCancelled = false;

    async function syncInitialSettings() {
      syncingUserIdRef.current = userId;

      try {
        const remoteSettings = await fetchUserPlaybackSettings(userId);

        if (isCancelled) {
          return;
        }

        if (remoteSettings) {
          isApplyingRemoteSettingsRef.current = true;
          replaceSettings(remoteSettings);
          lastPersistedSettingsRef.current = serializePlaybackSettings(remoteSettings);
          // Ignore the immediate store update caused by applying server settings.
          queueMicrotask(() => {
            isApplyingRemoteSettingsRef.current = false;
          });
        } else {
          await upsertUserPlaybackSettings(userId, currentSettings);

          if (isCancelled) {
            return;
          }

          lastPersistedSettingsRef.current = serializedSettings;
        }

        syncedUserIdRef.current = userId;
      } catch (error) {
        if (__DEV__) {
          console.error('[SettingsSyncProvider] Unable to sync initial user settings', {
            error,
            userId,
          });
        }
      } finally {
        if (syncingUserIdRef.current === userId) {
          syncingUserIdRef.current = null;
        }
      }
    }

    void syncInitialSettings();

    return () => {
      isCancelled = true;
    };
  }, [authStatus, currentSettings, hasHydrated, replaceSettings, serializedSettings, session?.userId]);

  useEffect(() => {
    const userId = session?.userId ?? null;

    if (!userId || !hasHydrated || authStatus !== 'ready') {
      return;
    }

    if (syncedUserIdRef.current !== userId) {
      return;
    }

    if (isApplyingRemoteSettingsRef.current) {
      return;
    }

    if (lastPersistedSettingsRef.current === serializedSettings) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;

      void upsertUserPlaybackSettings(userId, currentSettings)
        .then(() => {
          lastPersistedSettingsRef.current = serializedSettings;
        })
        .catch((error) => {
          if (__DEV__) {
            console.error('[SettingsSyncProvider] Unable to save user settings', {
              error,
              userId,
            });
          }
        });
    }, 400);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [authStatus, currentSettings, hasHydrated, serializedSettings, session?.userId]);

  return null;
}
