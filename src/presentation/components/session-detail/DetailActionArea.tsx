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
      <Text style={s.actionLabel}>ACTIONS</Text>
      <Pressable
        style={[s.btnPrimary, showDraft && s.btnDisabled]}
        onPress={onAddNew}
        disabled={showDraft}
      >
        <Text style={s.btnPrimaryLabel}>+ Add Exercise</Text>
      </Pressable>
      <Pressable style={s.btnFinishSession} onPress={onFinishSession} disabled={isActing}>
        <Text style={s.btnFinishSessionLabel}>⏹ Finish Session</Text>
      </Pressable>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = (theme: AppTheme): ReturnType<typeof StyleSheet.create> =>
  StyleSheet.create({
    actionArea: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 32,
      borderTopWidth: 0.5,
      borderTopColor: theme.border,
      gap: 8,
    },
    actionLabel: {
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: theme.textMuted,
      marginBottom: 2,
    },
    btnPrimary: {
      backgroundColor: theme.accent,
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: 'center',
    },
    btnDisabled: { opacity: 0.4 },
    btnPrimaryLabel: { fontSize: 15, fontWeight: '700', color: '#0E0E0F' },
    btnFinishSession: {
      backgroundColor: theme.surface,
      borderWidth: 0.5,
      borderColor: theme.border,
      borderRadius: 14,
      paddingVertical: 10,
      alignItems: 'center',
    },
    btnFinishSessionLabel: { fontSize: 12, color: theme.textMuted },
  });
