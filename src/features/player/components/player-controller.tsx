import { useEffect, useRef } from 'react';
import {
  createAudioPlayer,
  setAudioModeAsync,
  useAudioPlayerStatus,
  type AudioPlayer,
} from 'expo-audio';

import { usePlayerStore } from '@/features/player/store/player-store';

export function PlayerController() {
  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playbackRevision = usePlayerStore((state) => state.playbackRevision);
  const setTrackEnded = usePlayerStore((state) => state.setTrackEnded);
  const setPlaybackError = usePlayerStore((state) => state.setPlaybackError);
  const currentItem = queue[currentIndex] ?? null;
  const playerRef = useRef<AudioPlayer | null>(null);
  const currentSourceRef = useRef<string | null>(null);
  const previousDidJustFinishRef = useRef(false);

  if (!playerRef.current) {
    playerRef.current = createAudioPlayer(null);
  }

  const player = playerRef.current;
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    });

    return () => {
      player.remove();
      playerRef.current = null;
    };
  }, [player]);

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

    setTrackEnded();
  }, [status.didJustFinish]);

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

  return null;
}
