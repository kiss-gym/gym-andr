import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTheme, useTheme } from '@presentation/theme';

// ── Props ─────────────────────────────────────────────────────────────────────

interface SelectedSessionInfo {
  isThereAnyActiveSession: boolean;
  label: string | null | undefined;
}

interface HubActionAreaProps {
  selectedSession: SelectedSessionInfo | null;
  hasAnySessions: boolean;
  isActing: boolean;
  onInheritSelected: () => void;
  onCreateNew: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const HubActionArea: React.FC<HubActionAreaProps> = ({
  selectedSession,
  hasAnySessions,
  isActing,
  onInheritSelected,
  onCreateNew,
}) => {
  const theme = useTheme();
  const s = styles(theme);

  if (isActing) {
    return (
      <View style={[s.area, s.centered]}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  // ── No sessions at all ──────────────────────────────────────────────────────
  if (!hasAnySessions) {
    return (
      <View style={s.area}>
        <Pressable style={({ pressed }) => [s.btn, pressed && s.pressed]} onPress={onCreateNew}>
          <Text style={s.btnLabel}>+ Create & Start New Session</Text>
        </Pressable>
      </View>
    );
  }

  // ── Active session selected ─────────────────────────────────────────────────
  if (selectedSession && selectedSession.isThereAnyActiveSession) {
    return (
      <View style={s.area}>
        <Pressable
          style={({ pressed }) => [s.btn, pressed && s.pressed]}
          onPress={onInheritSelected}
        >
          <Text style={s.btnLabel}>+ Finish ➔ Inherit & Start Session</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [s.btn, pressed && s.pressed]} onPress={onCreateNew}>
          <Text style={s.btnLabel}>+ Finish ➔ Start New</Text>
        </Pressable>
      </View>
    );
  }

  // ── Finished session selected ───────────────────────────────────────────────
  if (selectedSession && !selectedSession.isThereAnyActiveSession) {
    return (
      <View style={s.area}>
        <Pressable
          style={({ pressed }) => [s.btn, pressed && s.pressed]}
          onPress={onInheritSelected}
        >
          <Text style={s.btnLabel}>+ Inherit & Start Session</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [s.btn, pressed && s.pressed]} onPress={onCreateNew}>
          <Text style={s.btnLabel}>+ Create New & Start Session</Text>
        </Pressable>
      </View>
    );
  }

  // ── Has sessions but nothing selected (shouldn't happen — safety fallback) ──
  return (
    <View style={s.area}>
      <Pressable style={({ pressed }) => [s.btn, pressed && s.pressed]} onPress={onCreateNew}>
        <Text style={s.btnLabel}>+ Create New & Start Session</Text>
      </Pressable>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = (theme: AppTheme): ReturnType<typeof StyleSheet.create> =>
  StyleSheet.create({
    area: {
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 32,
      gap: 10,
      borderTopWidth: 0.5,
      borderTopColor: theme.border,
    },
    centered: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 80,
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
    btnLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.accentLightText,
      letterSpacing: 0.2,
    },
    pressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
  });
