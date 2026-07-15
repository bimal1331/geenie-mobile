import { useEffect, useRef } from 'react';
import {
  createAudioPlayer,
  setAudioModeAsync,
  useAudioPlayerStatus,
  type AudioPlayer,
} from 'expo-audio';

import { usePlayerStore } from '@/features/player/store/player-store';
import { usePlaybackSettings } from '@/features/settings/hooks/use-playback-settings';

export function PlayerController() {
  const activeBundleSlug = usePlayerStore((state) => state.activeBundleSlug);
  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const isInAffirmationGap = usePlayerStore((state) => state.isInAffirmationGap);
  const playbackRevision = usePlayerStore((state) => state.playbackRevision);
  const selectedMusicTrack = usePlayerStore((state) => state.selectedMusicTrack);
  const setTrackEnded = usePlayerStore((state) => state.setTrackEnded);
  const restartQueue = usePlayerStore((state) => state.restartQueue);
  const setGapActive = usePlayerStore((state) => state.setGapActive);
  const setPlaybackError = usePlayerStore((state) => state.setPlaybackError);
  const { affirmationGapMs, musicVolume, voiceVolume, loopBundleForever } = usePlaybackSettings();
  const currentItem = queue[currentIndex] ?? null;
  const playerRef = useRef<AudioPlayer | null>(null);
  const musicPlayerRef = useRef<AudioPlayer | null>(null);
  const currentSourceRef = useRef<string | null>(null);
  const currentMusicSourceRef = useRef<string | null>(null);
  const previousDidJustFinishRef = useRef(false);
  const gapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!playerRef.current) {
    playerRef.current = createAudioPlayer(null);
  }

  if (!musicPlayerRef.current) {
    musicPlayerRef.current = createAudioPlayer(null);
  }

  const player = playerRef.current;
  const musicPlayer = musicPlayerRef.current;
  const status = useAudioPlayerStatus(player);
  const musicStatus = useAudioPlayerStatus(musicPlayer);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    });

    return () => {
      if (gapTimeoutRef.current) {
        clearTimeout(gapTimeoutRef.current);
        gapTimeoutRef.current = null;
      }

      player.remove();
      musicPlayer.remove();
      playerRef.current = null;
      musicPlayerRef.current = null;
    };
  }, [musicPlayer, player]);

  useEffect(() => {
    player.volume = voiceVolume;
  }, [player, voiceVolume]);

  useEffect(() => {
    musicPlayer.volume = musicVolume;
  }, [musicPlayer, musicVolume]);

  useEffect(() => {
    const audioUrl = currentItem?.audioUrl ?? null;

    if (!audioUrl) {
      currentSourceRef.current = null;

      if (currentItem) {
        player.pause();
        setPlaybackError('Audio is not available for this affirmation.');
      }

      return;
    }

    setPlaybackError(null);

    if (currentSourceRef.current === audioUrl) {
      return;
    }

    currentSourceRef.current = audioUrl;
    player.replace(audioUrl);
  }, [currentItem, player, setPlaybackError]);

  useEffect(() => {
    if (!currentItem?.audioUrl) {
      return;
    }

    if (isPlaying) {
      player.play();
      return;
    }

    player.pause();
  }, [currentItem?.audioUrl, isPlaying, player]);

  useEffect(() => {
    if (!currentItem?.audioUrl || !isPlaying) {
      return;
    }

    void player.seekTo(0).then(() => {
      player.play();
    }).catch(() => {
      player.play();
    });
  }, [currentItem?.audioUrl, isPlaying, playbackRevision, player]);

  useEffect(() => {
    const justFinishedNow = status.didJustFinish && !previousDidJustFinishRef.current;
    previousDidJustFinishRef.current = status.didJustFinish;

    if (!justFinishedNow) {
      return;
    }

    if (gapTimeoutRef.current) {
      clearTimeout(gapTimeoutRef.current);
      gapTimeoutRef.current = null;
    }

    const hasNextTrack = currentIndex < queue.length - 1;
    const shouldLoopCurrentBundle = Boolean(activeBundleSlug) && loopBundleForever;

    if ((hasNextTrack || shouldLoopCurrentBundle) && affirmationGapMs > 0) {
      setGapActive(true);
      gapTimeoutRef.current = setTimeout(() => {
        gapTimeoutRef.current = null;
        setGapActive(false);
        if (!hasNextTrack && shouldLoopCurrentBundle) {
          restartQueue();
          return;
        }

        setTrackEnded();
      }, affirmationGapMs);
      return;
    }

    setGapActive(false);

    if (!hasNextTrack && shouldLoopCurrentBundle) {
      restartQueue();
      return;
    }

    setTrackEnded();
  }, [
    activeBundleSlug,
    affirmationGapMs,
    currentIndex,
    loopBundleForever,
    queue.length,
    restartQueue,
    setGapActive,
    setTrackEnded,
    status.didJustFinish,
  ]);

  useEffect(() => {
    if (!status.error) {
      return;
    }

    setPlaybackError('Audio playback failed.');

    if (__DEV__) {
      console.error('[PlayerController] Audio playback error', {
        currentIndex,
        currentItem,
        error: status.error,
      });
    }
  }, [currentIndex, currentItem, setPlaybackError, status.error]);

  useEffect(() => {
    const musicUrl = selectedMusicTrack?.audioUrl ?? null;

    if (!musicUrl) {
      currentMusicSourceRef.current = null;
      musicPlayer.pause();
      return;
    }

    if (currentMusicSourceRef.current === musicUrl) {
      return;
    }

    currentMusicSourceRef.current = musicUrl;
    musicPlayer.replace(musicUrl);
  }, [musicPlayer, selectedMusicTrack?.audioUrl]);

  useEffect(() => {
    const shouldPlayMusic =
      Boolean(selectedMusicTrack?.audioUrl) &&
      queue.length > 0 &&
      isPlaying;

    if (shouldPlayMusic) {
      musicPlayer.play();
      return;
    }

    musicPlayer.pause();
  }, [isPlaying, musicPlayer, queue.length, selectedMusicTrack?.audioUrl]);

  useEffect(() => {
    if (isPlaying) {
      return;
    }

    if (!gapTimeoutRef.current) {
      return;
    }

    clearTimeout(gapTimeoutRef.current);
    gapTimeoutRef.current = null;
    setGapActive(false);
  }, [isPlaying, setGapActive]);

  useEffect(() => {
    if (!musicStatus.error) {
      return;
    }

    if (__DEV__) {
      console.error('[PlayerController] Background music playback error', {
        selectedMusicTrack,
        error: musicStatus.error,
      });
    }
  }, [musicStatus.error, selectedMusicTrack]);

  return null;
}
