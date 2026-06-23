import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTheme, useTheme } from '@presentation/theme';

// ── Props ─────────────────────────────────────────────────────────────────────

interface DetailActionAreaProps {
  showDraft: boolean;
  isActing: boolean;
  onAddNew: () => void;
  onFinishSession: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const DetailActionArea: React.FC<DetailActionAreaProps> = ({
  showDraft,
  isActing,
  onAddNew,
  onFinishSession,
}) => {
  const theme = useTheme();
  const s = styles(theme);

  return (
    <View style={s.actionArea}>
      <Pressable
        style={({ pressed }) => [s.btn, showDraft && s.btnDisabled, pressed && s.pressed]}
        onPress={onAddNew}
        disabled={showDraft}
      >
        <Text style={s.btnLabel}>+ Add Exercise</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          s.btn,
          s.btnSecondary,
          isActing && s.btnDisabled,
          pressed && s.pressed,
        ]}
        onPress={onFinishSession}
        disabled={isActing}
      >
        <Text style={s.btnLabel}>Finish Session</Text>
      </Pressable>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = (theme: AppTheme): ReturnType<typeof StyleSheet.create> =>
  StyleSheet.create({
    actionArea: {
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 32,
      borderTopWidth: 0.5,
      borderTopColor: theme.border,
      gap: 10,
    },
    btn: {
      backgroundColor: theme.accentLight,
      borderWidth: 1.5,
      borderColor: theme.accent,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      elevation: 2,
      shadowColor: theme.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    btnSecondary: {
      borderWidth: 1,
      opacity: 0.85,
      elevation: 0,
      shadowOpacity: 0,
    },
    btnDisabled: { opacity: 0.35 },
    btnLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.accentLightText,
      letterSpacing: 0.2,
    },
    pressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
  });
