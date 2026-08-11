import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

/**
 * Small wrapper around the background music player.
 * This stays intentionally narrow so the coordinator can describe the
 * higher-level "when should music be active?" rules in one place.
 */
export class BackgroundMusicEngine {
  private readonly player: AudioPlayer = createAudioPlayer(null);
  private currentSource: string | null = null;

  setVolume(volume: number) {
    this.player.volume = volume;
  }

  setTrack(audioUrl: string | null) {
    if (!audioUrl) {
      this.currentSource = null;
      this.player.pause();
      return;
    }

    if (this.currentSource === audioUrl) {
      return;
    }

    this.currentSource = audioUrl;
    this.player.replace(audioUrl);
  }

  play() {
    if (!this.currentSource) {
      return;
    }

    this.player.play();
  }

  pause() {
    this.player.pause();
  }

  destroy() {
    this.player.remove();
  }
}
