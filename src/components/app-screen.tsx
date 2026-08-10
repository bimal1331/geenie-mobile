import { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Colors, Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AppScreenProps = {
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
};

const appBackgroundImage = require('../../assets/images/player/background-editorial-paper.png');

export function AppScreen({
  headerLeft,
  headerRight,
  eyebrow,
  title,
  description,
  children,
}: AppScreenProps) {
  const theme = useTheme();

  return (
    <View style={[styles.screenRoot, { backgroundColor: theme.background }]}>
      <Image contentFit="cover" source={appBackgroundImage} style={StyleSheet.absoluteFill} />
      <View style={[styles.backgroundOverlay, { backgroundColor: theme.heroOverlay }]} />

      <ScrollView
        style={[styles.scrollView, { backgroundColor: 'transparent' }]}
        contentContainerStyle={styles.scrollContent}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.hero}>
            {headerLeft || headerRight ? (
              <View style={styles.headerRow}>
                <View style={styles.headerSide}>{headerLeft}</View>
                <View style={styles.headerSideRight}>{headerRight}</View>
              </View>
            ) : null}
            {eyebrow ? (
              <ThemedView type="backgroundElement" style={styles.eyebrowBadge}>
                <ThemedText type="smallBold" style={{ color: theme.accentSecondary }}>
                  {eyebrow}
                </ThemedText>
              </ThemedView>
            ) : null}
            <ThemedText type="title" style={styles.title}>
              {title}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.description}>
              {description}
            </ThemedText>
          </View>

          <View style={styles.body}>{children}</View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}

type SectionCardProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function SectionCard({ title, description, children }: SectionCardProps) {
  const theme = useTheme();

  return (
    <ThemedView
      type="backgroundElement"
      style={[
        styles.card,
        {
          backgroundColor: theme.surfaceElevated,
          borderColor: theme.borderSoft,
          shadowColor: theme.shadowWarm,
        },
      ]}>
      <ThemedText type="subtitle" style={styles.cardTitle}>
        {title}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.cardDescription}>
        {description}
      </ThemedText>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  safeArea: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Platform.select({ web: Spacing.six }) ?? 0,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.four,
  },
  hero: {
    gap: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  headerSide: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerSideRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  eyebrowBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 42,
    lineHeight: 48,
    letterSpacing: -0.8,
  },
  description: {
    fontSize: 18,
    lineHeight: 28,
    maxWidth: 620,
  },
  body: {
    gap: Spacing.three,
  },
  card: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.two,
    borderWidth: 1,
    shadowOpacity: Platform.select({ ios: 0.08, android: 0.12, default: 0.08 }) ?? 0.08,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: Fonts.serif,
  },
  cardDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
});
