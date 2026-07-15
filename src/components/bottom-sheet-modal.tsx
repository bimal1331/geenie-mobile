import { ReactNode } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type BottomSheetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  sheetStyle?: StyleProp<ViewStyle>;
};

export function BottomSheetModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  sheetStyle,
}: BottomSheetModalProps) {
  const theme = useTheme();

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={isOpen}>
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={styles.backdrop} />
        <ThemedView type="backgroundElement" style={[styles.sheet, sheetStyle]}>
          <View style={styles.sheetHeader}>
            <View style={styles.titleColumn}>
              <ThemedText type="subtitle" style={styles.sheetTitle}>
                {title}
              </ThemedText>
              {description ? (
                <ThemedText themeColor="textSecondary">{description}</ThemedText>
              ) : null}
            </View>
            <Pressable onPress={onClose} style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView type="backgroundSelected" style={styles.closeButton}>
                <SymbolView name="xmark" tintColor={theme.text} size={16} />
              </ThemedView>
            </Pressable>
          </View>

          {children}
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.34)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
    minHeight: '44%',
    maxHeight: '78%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  titleColumn: {
    flex: 1,
    gap: Spacing.one,
  },
  sheetTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.82,
  },
});
