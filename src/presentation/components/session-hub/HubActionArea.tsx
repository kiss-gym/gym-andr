import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTheme, useTheme } from '@presentation/theme';

// ── Props ─────────────────────────────────────────────────────────────────────

interface SelectedSessionInfo {
  isActive: boolean;
  label: string | null | undefined;
}

interface HubActionAreaProps {
  selectedSession: SelectedSessionInfo | null;
  hasAnySessions: boolean;
  isActing: boolean;
  onContinue: () => void;
  onInheritSelected: () => void;
  onCreateNew: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const HubActionArea: React.FC<HubActionAreaProps> = ({
  selectedSession,
  hasAnySessions,
  isActing,
  onContinue,
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
        <Pressable
          style={({ pressed }) => [s.btnPrimary, pressed && s.pressed]}
          onPress={onCreateNew}
        >
          <Text style={s.btnPrimaryLabel}>+ Create & Start New</Text>
          <Text style={s.btnPrimaryHint}>Start your first session</Text>
        </Pressable>
      </View>
    );
  }

  // ── Active session selected ─────────────────────────────────────────────────
  if (selectedSession && selectedSession.isActive) {
    return (
      <View style={s.area}>
        <Pressable
          style={({ pressed }) => [s.btnPrimary, pressed && s.pressed]}
          onPress={onContinue}
        >
          <Text style={s.btnPrimaryLabel}>▶ Continue Session</Text>
          <Text style={s.btnPrimaryHint}>Resume your active workout</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [s.btnSecondary, pressed && s.pressed]}
          onPress={onInheritSelected}
        >
          <Text style={s.btnPrimaryLabel}>+ Inherit & Start</Text>
          <Text style={s.btnSecondaryHint}>Will ask to finish active session and inherit it</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [s.btnSecondary, pressed && s.pressed]}
          onPress={onCreateNew}
        >
          <Text style={s.btnSecondaryLabel}>+ Create & Start New</Text>
          <Text style={s.btnSecondaryHint}>Will ask to finish active session first</Text>
        </Pressable>
      </View>
    );
  }

  // ── Finished session selected ───────────────────────────────────────────────
  if (selectedSession && !selectedSession.isActive) {
    const copyHint = selectedSession.label ?? 'selected session';
    return (
      <View style={s.area}>
        <Pressable
          style={({ pressed }) => [s.btnPrimary, pressed && s.pressed]}
          onPress={onInheritSelected}
        >
          <Text style={s.btnPrimaryLabel}>+ Inherit & Start</Text>
          <Text style={s.btnPrimaryHint} numberOfLines={1}>
            {`Inherit exercises from "${copyHint}"`}
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [s.btnSecondary, pressed && s.pressed]}
          onPress={onCreateNew}
        >
          <Text style={s.btnSecondaryLabel}>+ Create New & Start</Text>
          <Text style={s.btnSecondaryHint}>Fresh blank session</Text>
        </Pressable>
      </View>
    );
  }

  // ── Has sessions but nothing selected (shouldn't happen — safety fallback) ──
  return (
    <View style={s.area}>
      <Pressable
        style={({ pressed }) => [s.btnSecondary, pressed && s.pressed]}
        onPress={onCreateNew}
      >
        <Text style={s.btnSecondaryLabel}>+ Create New & Start</Text>
        <Text style={s.btnSecondaryHint}>Fresh blank session</Text>
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

    // All action buttons — very-light-green with accent border
    btnPrimary: {
      backgroundColor: theme.accentLight,
      borderWidth: 1.5,
      borderColor: theme.accent,
      borderRadius: 14,
      padding: 16,
      gap: 2,
      elevation: 2,
      shadowColor: theme.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    btnPrimaryLabel: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.accentLightText,
      letterSpacing: 0.2,
    },
    btnPrimaryHint: {
      fontSize: 12,
      color: theme.accentLightText,
      opacity: 0.7,
      marginTop: 2,
    },

    // Secondary — same family, slightly lighter weight
    btnSecondary: {
      backgroundColor: theme.accentLight,
      borderWidth: 1,
      borderColor: theme.accent,
      borderRadius: 14,
      padding: 16,
      gap: 2,
      opacity: 0.85,
    },
    btnSecondaryLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.accentLightText,
    },
    btnSecondaryHint: {
      fontSize: 12,
      color: theme.accentLightText,
      opacity: 0.65,
      marginTop: 2,
    },

    pressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
  });
