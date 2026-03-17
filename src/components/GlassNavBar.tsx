import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

interface GlassNavBarProps {
  title: string;
  /** Shows chevron-back + label on the left */
  onBack?: () => void;
  backLabel?: string;
  /** Custom left element (replaces back button) */
  leftElement?: React.ReactNode;
  /** Custom right element */
  rightElement?: React.ReactNode;
}

/**
 * iOS 26 Liquid Glass navigation bar.
 * Place inside SafeAreaView — does not add top inset itself.
 */
export default function GlassNavBar({
  title, onBack, backLabel = 'Wróć', leftElement, rightElement,
}: GlassNavBarProps) {
  return (
    <BlurView intensity={65} tint="systemMaterial" style={styles.blur}>
      <View style={styles.bar}>
        {/* Left slot */}
        <View style={styles.side}>
          {leftElement ?? (onBack ? (
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel={backLabel}
              style={styles.backBtn}
            >
              <Ionicons name="chevron-back" size={18} color="#007AFF" />
              <Text style={styles.backLabel} allowFontScaling maxFontSizeMultiplier={1.2}>
                {backLabel}
              </Text>
            </Pressable>
          ) : null)}
        </View>

        {/* Title */}
        <Text
          style={styles.title}
          accessibilityRole="header"
          numberOfLines={1}
          allowFontScaling
          maxFontSizeMultiplier={1.2}
        >
          {title}
        </Text>

        {/* Right slot */}
        <View style={[styles.side, styles.sideRight]}>
          {rightElement ?? null}
        </View>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blur: {
    overflow: 'hidden',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60,60,67,0.12)',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  side: {
    minWidth: 80,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideRight: {
    justifyContent: 'flex-end',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 4,
  },
  backLabel: {
    fontSize: 17,
    color: '#007AFF',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.4,
    flex: 1,
    textAlign: 'center',
  },
});
