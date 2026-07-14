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
  const selectedMusicTrack = usePlayerStore((state) => state.selectedMusicTrack);
  const setTrackEnded = usePlayerStore((state) => state.setTrackEnded);
  const setPlaybackError = usePlayerStore((state) => state.setPlaybackError);
  const currentItem = queue[currentIndex] ?? null;
  const playerRef = useRef<AudioPlayer | null>(null);
  const musicPlayerRef = useRef<AudioPlayer | null>(null);
  const currentSourceRef = useRef<string | null>(null);
  const currentMusicSourceRef = useRef<string | null>(null);
  const previousDidJustFinishRef = useRef(false);

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
      player.remove();
      musicPlayer.remove();
      playerRef.current = null;
      musicPlayerRef.current = null;
    };
  }, [musicPlayer, player]);

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
      Boolean(currentItem?.audioUrl) &&
      isPlaying;

    if (shouldPlayMusic) {
      musicPlayer.play();
      return;
    }

    musicPlayer.pause();
  }, [currentItem?.audioUrl, isPlaying, musicPlayer, selectedMusicTrack?.audioUrl]);

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
