import { setAudioModeAsync, type AudioStatus } from 'expo-audio';

import { BackgroundMusicEngine } from '@/features/player/audio/engines/background-music-engine';
import { VoiceTrackEngine } from '@/features/player/audio/engines/voice-track-engine';
import { createQueueSignature } from '@/features/player/audio/helpers';
import type {
  MusicSelectionSnapshot,
  PlayerAudioSettingsSnapshot,
  PlayerSessionSnapshot,
} from '@/features/player/audio/types';
import { usePlayerStore } from '@/features/player/store/player-store';

/**
 * Coordinates the full spoken-affirmation session.
 *
 * Design choice:
 * We intentionally drive bundle playback from JavaScript using a single voice
 * player rather than a native playlist object. Geenie needs reliable control
 * over custom gaps, visible progress, and background music continuity, and
 * those rules are easier to reason about when the app advances one
 * affirmation at a time.
 */
export class PlayerAudioCoordinator {
  private readonly voiceEngine = new VoiceTrackEngine();
  private readonly musicEngine = new BackgroundMusicEngine();
  private initialized = false;
  private session: PlayerSessionSnapshot | null = null;
  private currentSessionKey: string | null = null;
  private loadedTrackKey: string | null = null;
  private settings: PlayerAudioSettingsSnapshot = {
    affirmationGapMs: 0,
    bundleRepeatDurationMinutes: 0,
    voiceVolume: 1,
    musicVolume: 0.5,
  };
  private sessionRepeatDurationMinutes: number | null = 0;
  private repeatUntil: number | null = null;
  private gapTimeout: ReturnType<typeof setTimeout> | null = null;
  private pendingAdvanceIndex: number | null = null;
  private hasCompletedBundle = false;
  private sawDidJustFinish = false;
  private loadRequestId = 0;

  initialize() {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });

    this.voiceEngine.subscribe((status) => {
      void this.handleVoiceStatusChange(status);
    });
  }

  dispose() {
    this.clearAffirmationGap();
    this.voiceEngine.destroy();
    this.musicEngine.destroy();
    this.initialized = false;
    this.session = null;
    this.currentSessionKey = null;
    this.loadedTrackKey = null;
    this.pendingAdvanceIndex = null;
    this.hasCompletedBundle = false;
    this.sawDidJustFinish = false;
    this.sessionRepeatDurationMinutes = 0;
    this.repeatUntil = null;
  }

  syncSession(session: PlayerSessionSnapshot) {
    this.session = session;
    const nextSessionKey = `${session.sessionRevision}:${createQueueSignature(session.queue)}`;

    if (session.queue.length === 0) {
      this.currentSessionKey = null;
      this.loadedTrackKey = null;
      this.pendingAdvanceIndex = null;
      this.hasCompletedBundle = false;
      this.sessionRepeatDurationMinutes = 0;
      this.repeatUntil = null;
      this.clearAffirmationGap();
      void this.voiceEngine.clearTrack();
      return;
    }

    const isNewSession = nextSessionKey !== this.currentSessionKey;

    if (isNewSession) {
      this.currentSessionKey = nextSessionKey;
      this.loadedTrackKey = null;
      this.pendingAdvanceIndex = null;
      this.hasCompletedBundle = false;
      this.sawDidJustFinish = false;
      this.startBundleRepeatWindow();
      this.clearAffirmationGap();
      void this.loadTrackAtIndex(session.currentIndex, {
        shouldAutoPlay: session.isPlaying,
        forceReload: true,
      });
      return;
    }

    const currentItem = session.queue[session.currentIndex] ?? null;
    const desiredTrackKey =
      currentItem && currentItem.audioUrl
        ? `${currentItem.affirmationId}:${currentItem.audioUrl}`
        : null;

    if (desiredTrackKey && desiredTrackKey !== this.loadedTrackKey) {
      void this.loadTrackAtIndex(session.currentIndex, {
        shouldAutoPlay: session.isPlaying,
        forceReload: true,
      });
      return;
    }

    // External playback state changes are rare because transport actions come
    // through the coordinator, but we still keep the engine aligned here.
    if (!session.isPlaying) {
      this.voiceEngine.pause();
      return;
    }

    if (this.pendingAdvanceIndex === null && !usePlayerStore.getState().isInAffirmationGap) {
      void this.voiceEngine.play();
    }
  }

  syncSettings(settings: PlayerAudioSettingsSnapshot) {
    this.settings = settings;
    this.voiceEngine.setVolume(settings.voiceVolume);
    this.musicEngine.setVolume(settings.musicVolume);
  }

  syncMusicSelection(selection: MusicSelectionSnapshot) {
    this.musicEngine.setTrack(selection.selectedTrack?.audioUrl ?? null);

    if (selection.shouldKeepPlaying) {
      void this.musicEngine.play();
      return;
    }

    this.musicEngine.pause();
  }

  togglePlayback() {
    const store = usePlayerStore.getState();

    if (store.queue.length === 0) {
      return;
    }

    if (store.isPlaying) {
      this.clearAffirmationGap();
      store.setGapActive(false);
      store.syncPlaybackSnapshot({ isPlaying: false });
      this.voiceEngine.pause();
      this.musicEngine.pause();
      return;
    }

    if (this.hasCompletedBundle) {
      this.hasCompletedBundle = false;
      this.clearAffirmationGap();
      this.startBundleRepeatWindow();
      void this.advanceToIndex(0, true);
      void this.musicEngine.play();
      return;
    }

    store.syncPlaybackSnapshot({ isPlaying: true, playbackError: null });

    if (this.pendingAdvanceIndex !== null) {
      this.scheduleAdvanceAfterGap(this.pendingAdvanceIndex);
      return;
    }

    void this.voiceEngine.play();
    void this.musicEngine.play();
  }

  goToNext() {
    const store = usePlayerStore.getState();
    const nextIndex = Math.min(store.currentIndex + 1, Math.max(store.queue.length - 1, 0));

    if (nextIndex === store.currentIndex) {
      return;
    }

    this.pendingAdvanceIndex = null;
    this.hasCompletedBundle = false;
    this.clearAffirmationGap();
    store.setGapActive(false);
    void this.advanceToIndex(nextIndex, true);
  }

  goToPrevious() {
    const store = usePlayerStore.getState();
    const previousIndex = Math.max(store.currentIndex - 1, 0);

    if (previousIndex === store.currentIndex) {
      return;
    }

    this.pendingAdvanceIndex = null;
    this.hasCompletedBundle = false;
    this.clearAffirmationGap();
    store.setGapActive(false);
    void this.advanceToIndex(previousIndex, true);
  }

  restartBundle() {
    const store = usePlayerStore.getState();

    if (store.queue.length === 0) {
      return;
    }

    this.pendingAdvanceIndex = null;
    this.hasCompletedBundle = false;
    this.clearAffirmationGap();
    this.startBundleRepeatWindow();
    store.setGapActive(false);
    void this.advanceToIndex(0, true);
  }

  private async handleVoiceStatusChange(status: AudioStatus) {
    const store = usePlayerStore.getState();
    const effectiveIsPlaying =
      store.isInAffirmationGap || status.playing || store.isPlaying;

    store.syncPlaybackSnapshot({
      isPlaying: effectiveIsPlaying,
      playbackError: status.error ?? null,
    });

    if (status.error) {
      store.setGapActive(false);
      this.clearAffirmationGap();
      this.pendingAdvanceIndex = null;
      this.musicEngine.pause();
      return;
    }

    const didJustFinishNow = status.didJustFinish && !this.sawDidJustFinish;
    this.sawDidJustFinish = status.didJustFinish;

    if (!didJustFinishNow) {
      return;
    }

    await this.handleTrackFinished();
  }

  private async handleTrackFinished() {
    const store = usePlayerStore.getState();
    const queue = this.session?.queue ?? store.queue;

    if (queue.length === 0) {
      store.syncPlaybackSnapshot({ isPlaying: false });
      this.musicEngine.pause();
      return;
    }

    const currentIndex = Math.min(store.currentIndex, queue.length - 1);
    const hasNextTrack = currentIndex < queue.length - 1;
    const shouldLoopCurrentBundle =
      Boolean(store.activeBundleSlug) && this.shouldRepeatCurrentBundle();

    if (!hasNextTrack && !shouldLoopCurrentBundle) {
      store.setGapActive(false);
      store.syncPlaybackSnapshot({ isPlaying: false });
      this.pendingAdvanceIndex = null;
      this.hasCompletedBundle = true;
      this.musicEngine.pause();
      return;
    }

    const nextIndex = hasNextTrack ? currentIndex + 1 : 0;
    this.pendingAdvanceIndex = nextIndex;
    this.scheduleAdvanceAfterGap(nextIndex);
  }

  private scheduleAdvanceAfterGap(nextIndex: number) {
    const store = usePlayerStore.getState();

    this.clearAffirmationGap();

    if (!store.isPlaying) {
      return;
    }

    if (this.settings.affirmationGapMs <= 0) {
      void this.advanceToIndex(nextIndex, true);
      return;
    }

    store.setGapActive(true);
    store.syncPlaybackSnapshot({ isPlaying: true });

    this.gapTimeout = setTimeout(() => {
      this.gapTimeout = null;

      if (!usePlayerStore.getState().isPlaying) {
        return;
      }

      void this.advanceToIndex(nextIndex, true);
    }, this.settings.affirmationGapMs);
  }

  private async advanceToIndex(index: number, shouldAutoPlay: boolean) {
    const store = usePlayerStore.getState();

    this.pendingAdvanceIndex = null;
    this.hasCompletedBundle = false;
    this.sawDidJustFinish = false;
    store.setGapActive(false);
    store.syncPlaybackSnapshot({
      currentIndex: index,
      isPlaying: shouldAutoPlay,
      playbackError: null,
    });

    await this.loadTrackAtIndex(index, {
      shouldAutoPlay,
      forceReload: true,
    });
  }

  private async loadTrackAtIndex(
    index: number,
    options: {
      shouldAutoPlay: boolean;
      forceReload: boolean;
    },
  ) {
    const session = this.session;

    if (!session) {
      return;
    }

    const item = session.queue[index] ?? null;

    if (!item?.audioUrl) {
      usePlayerStore.getState().syncPlaybackSnapshot({
        isPlaying: false,
        playbackError: 'Audio is not available for this affirmation.',
      });
      return;
    }

    const nextTrackKey = `${item.affirmationId}:${item.audioUrl}`;
    const requestId = ++this.loadRequestId;

    await this.voiceEngine.loadTrack(
      item,
      {
        bundleTitle: session.bundleTitle,
        bundleCoverImageUrl: session.bundleCoverImageUrl,
      },
      {
        forceReload: options.forceReload || this.loadedTrackKey !== nextTrackKey,
      },
    );

    if (requestId !== this.loadRequestId) {
      return;
    }

    this.loadedTrackKey = nextTrackKey;

    if (options.shouldAutoPlay) {
      await this.voiceEngine.play();
      return;
    }

    this.voiceEngine.pause();
  }

  private clearAffirmationGap() {
    if (!this.gapTimeout) {
      return;
    }

    clearTimeout(this.gapTimeout);
    this.gapTimeout = null;
  }

  private startBundleRepeatWindow() {
    this.sessionRepeatDurationMinutes = this.settings.bundleRepeatDurationMinutes;
    this.repeatUntil =
      typeof this.sessionRepeatDurationMinutes === 'number' &&
      this.sessionRepeatDurationMinutes > 0
        ? Date.now() + this.sessionRepeatDurationMinutes * 60 * 1000
        : null;
  }

  private shouldRepeatCurrentBundle() {
    if (this.sessionRepeatDurationMinutes === null) {
      return true;
    }

    if (this.sessionRepeatDurationMinutes <= 0) {
      return false;
    }

    return this.repeatUntil !== null && Date.now() < this.repeatUntil;
  }
}

let playerAudioCoordinator: PlayerAudioCoordinator | null = null;

export function getPlayerAudioCoordinator() {
  if (!playerAudioCoordinator) {
    playerAudioCoordinator = new PlayerAudioCoordinator();
  }

  return playerAudioCoordinator;
}

export function disposePlayerAudioCoordinator() {
  if (!playerAudioCoordinator) {
    return;
  }

  playerAudioCoordinator.dispose();
  playerAudioCoordinator = null;
}
