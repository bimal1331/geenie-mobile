/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1E1915',
    background: '#FCF8F2',
    backgroundElement: '#F6EFE6',
    backgroundSelected: '#EBDDCC',
    textSecondary: '#7A6A5C',
    // These semantic tokens drive the warmer editorial look across explore, detail, and player.
    accentPrimary: '#BF6C32',
    accentSecondary: '#B86A34',
    textDisplay: '#2B241E',
    textMutedWarm: '#6D6A66',
    textHero: '#1A1613',
    onAccentText: '#FFFAF3',
    backgroundImageOpacity: 1,
    heroOverlay: 'rgba(252, 248, 242, 0.72)',
    playerOverlay: 'rgba(255, 250, 242, 0.58)',
    surfaceFloating: 'rgba(255, 250, 244, 0.86)',
    surfaceElevated: 'rgba(255, 252, 248, 0.84)',
    surfaceElevatedStrong: 'rgba(255, 250, 244, 0.88)',
    surfacePanel: 'rgba(255, 251, 246, 0.9)',
    surfaceButton: 'rgba(255, 250, 244, 0.92)',
    borderSoft: 'rgba(255, 255, 255, 0.62)',
    borderStrong: 'rgba(255, 255, 255, 0.7)',
    progressTrack: 'rgba(216, 200, 182, 0.42)',
    dividerSoft: 'rgba(191, 108, 50, 0.12)',
    modalScrim: 'rgba(0, 0, 0, 0.34)',
    shadowWarm: '#8D5D32',
  },
  dark: {
    text: '#F7EEE6',
    background: '#1A171A',
    backgroundElement: '#242024',
    backgroundSelected: '#382B31',
    textSecondary: '#C9B9AC',
    accentPrimary: '#E0A06B',
    accentSecondary: '#E4A36C',
    textDisplay: '#FFF8F1',
    textMutedWarm: '#D0BFB1',
    textHero: '#FFF8F1',
    onAccentText: '#28170D',
    backgroundImageOpacity: 0,
    heroOverlay: 'rgba(26, 23, 26, 1)',
    playerOverlay: 'rgba(26, 23, 26, 1)',
    surfaceFloating: '#2A252A',
    surfaceElevated: '#302A30',
    surfaceElevatedStrong: '#393138',
    surfacePanel: '#292429',
    surfaceButton: '#40363E',
    borderSoft: 'rgba(255, 238, 222, 0.12)',
    borderStrong: 'rgba(255, 238, 222, 0.18)',
    progressTrack: 'rgba(255, 238, 222, 0.16)',
    dividerSoft: 'rgba(228, 163, 108, 0.22)',
    modalScrim: 'rgba(0, 0, 0, 0.44)',
    shadowWarm: '#090706',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
