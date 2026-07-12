import { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AppScreenProps = {
  headerLeft?: ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function AppScreen({ headerLeft, eyebrow, title, description, children }: AppScreenProps) {
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.hero}>
          {headerLeft ? <View style={styles.headerRow}>{headerLeft}</View> : null}
          {eyebrow ? (
            <ThemedView type="backgroundElement" style={styles.eyebrowBadge}>
              <ThemedText type="smallBold">{eyebrow}</ThemedText>
            </ThemedView>
          ) : null}
          <ThemedText type="title" style={styles.title}>
            {title}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.description}>
            {description}
          </ThemedText>
        </ThemedView>

        <View style={styles.body}>{children}</View>
      </SafeAreaView>
    </ScrollView>
  );
}

type SectionCardProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  eyebrowBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  title: {
    fontSize: 44,
    lineHeight: 50,
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
  },
  cardTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  cardDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
});
