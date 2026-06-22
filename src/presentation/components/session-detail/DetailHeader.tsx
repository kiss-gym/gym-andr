import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppTheme, useTheme } from '@presentation/theme';

// ── Props ─────────────────────────────────────────────────────────────────────

interface DetailHeaderProps {
  sessionLabel: string;
  isSessionActive: boolean;
  editingTitle: boolean;
  titleDraft: string;
  titleInputRef: React.RefObject<TextInput | null>;
  onChangeTitleDraft: (text: string) => void;
  onStartEditing: () => void;
  onCommitRename: () => void;
  onCancelEdit: () => void;
  onBack: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const DetailHeader: React.FC<DetailHeaderProps> = ({
  sessionLabel,
  isSessionActive,
  editingTitle,
  titleDraft,
  titleInputRef,
  onChangeTitleDraft,
  onStartEditing,
  onCommitRename,
  onCancelEdit,
  onBack,
}) => {
  const theme = useTheme();
  const s = styles(theme);

  return (
    <View style={s.header}>
      <Pressable style={s.backBtn} hitSlop={12} onPress={onBack}>
        <Text style={s.backArrow}>‹</Text>
        <Text style={s.backLabel}>Sessions</Text>
      </Pressable>

      {editingTitle ? (
        <TextInput
          ref={titleInputRef as React.RefObject<TextInput>}
          style={s.titleInput}
          value={titleDraft}
          onChangeText={onChangeTitleDraft}
          onSubmitEditing={onCommitRename}
          onBlur={onCommitRename}
          returnKeyType="done"
          selectTextOnFocus
          maxLength={60}
        />
      ) : (
        <Pressable style={s.titleBtn} onPress={onStartEditing} hitSlop={8}>
          <Text style={s.titleText} numberOfLines={1}>
            {sessionLabel}
          </Text>
          {isSessionActive && <Text style={s.titleEdit}>✎</Text>}
        </Pressable>
      )}

      {editingTitle ? (
        <Pressable style={s.headerRight} hitSlop={12} onPress={onCancelEdit}>
          <Text style={s.cancelLabel}>✕</Text>
        </Pressable>
      ) : (
        <View style={s.headerRight} />
      )}
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = (theme: AppTheme): ReturnType<typeof StyleSheet.create> =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 52,
      paddingBottom: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.border,
    },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, width: 70 },
    backArrow: { fontSize: 22, color: theme.accent, lineHeight: 26 },
    backLabel: { fontSize: 13, color: theme.accent },
    titleBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
    },
    titleText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.textPrimary,
      textAlign: 'center',
      flexShrink: 1,
    },
    titleEdit: { fontSize: 11, color: theme.textMuted },
    titleInput: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: theme.textPrimary,
      textAlign: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.accent,
      paddingVertical: 2,
      paddingHorizontal: 8,
    },
    headerRight: { width: 70, alignItems: 'flex-end' },
    cancelLabel: { fontSize: 15, color: theme.textMuted },
  });
