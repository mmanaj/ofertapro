import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Sheet } from '@tamagui/sheet';

interface DrawerProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  children: React.ReactNode;
}

/**
 * iOS 26 Liquid Glass bottom sheet.
 * Uses Tamagui Sheet with glass-inspired styling.
 * Sheet.ScrollView is the scroll host — callers must NOT add their own ScrollView.
 */
export default function Drawer({ visible, onDismiss, title, children }: DrawerProps) {
  return (
    <Sheet
      open={visible}
      onOpenChange={(open) => { if (!open) onDismiss(); }}
      snapPoints={[85]}
      dismissOnSnapToBottom
      modal
      animation="medium"
    >
      {/* Translucent glass backdrop */}
      <Sheet.Overlay
        animation="lazy"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        backgroundColor="rgba(0,0,0,0.38)"
      />

      {/* Glass sheet surface */}
      <Sheet.Frame
        backgroundColor="rgba(248,248,249,0.97)"
        borderTopLeftRadius={22}
        borderTopRightRadius={22}
        paddingBottom={48}
        borderWidth={0.5}
        borderColor="rgba(255,255,255,0.9)"
      >
        {/* iOS 26 grab handle — softer, more subtle */}
        <Sheet.Handle
          backgroundColor="rgba(60,60,67,0.18)"
          marginTop={10}
          marginBottom={4}
          alignSelf="center"
          width={36}
          height={4}
          borderRadius={2}
        />

        {title ? (
          <Text style={styles.title} accessibilityRole="header" allowFontScaling>
            {title}
          </Text>
        ) : null}

        <Sheet.ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </Sheet.ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.3,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60,60,67,0.12)',
  },
});
