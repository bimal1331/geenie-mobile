import { getPlayerAudioCoordinator } from '@/features/player/audio/player-audio-coordinator';

export function togglePlayerPlayback() {
  getPlayerAudioCoordinator().togglePlayback();
}

export function playNextAffirmation() {
  getPlayerAudioCoordinator().goToNext();
}

export function playPreviousAffirmation() {
  getPlayerAudioCoordinator().goToPrevious();
}

export function restartPlayerBundle() {
  getPlayerAudioCoordinator().restartBundle();
}
