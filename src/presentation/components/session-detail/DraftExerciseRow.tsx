import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppTheme, useTheme } from '@presentation/theme';
import { isSuggestion } from './ExerciseSuggestions';

// ── Props ─────────────────────────────────────────────────────────────────────

interface DraftExerciseRowProps {
  nameInputRef: React.RefObject<TextInput | null>;
  draftName: string;
  onChangeName: (text: string) => void;
  draftPhotoUri: string | null;
  onPickPhoto: () => void;
  onSubmit: () => void;
  onDiscard: () => void;
  isActing: boolean;
  canSubmit: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const DraftExerciseRow: React.FC<DraftExerciseRowProps> = ({
  nameInputRef,
  draftName,
  onChangeName,
  draftPhotoUri,
  onPickPhoto,
  onSubmit,
  onDiscard,
  isActing,
  canSubmit,
}) => {
  const theme = useTheme();
  const s = styles(theme);

  return (
    <View style={s.draftRow}>
      <View style={s.draftCard}>
        <View style={s.draftAccentBar} />
        <View style={s.thumb}>
          <Text style={s.thumbIcon}>💪</Text>
        </View>
        <View style={s.draftContent}>
          <TextInput
            ref={nameInputRef as React.RefObject<TextInput>}
            style={[
              s.draftInput,
              isSuggestion(draftName) ? s.draftInputSuggestion : s.draftInputActive,
            ]}
            value={draftName}
            onChangeText={onChangeName}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
            maxLength={80}
            selectTextOnFocus
          />
          <View style={s.draftActions}>
            <Pressable style={s.photoBtn} onPress={onPickPhoto}>
              <Text>{draftPhotoUri ? '🖼️' : '📷'}</Text>
            </Pressable>
            <Pressable
              style={[s.submitBtn, !canSubmit && s.submitBtnDisabled]}
              onPress={onSubmit}
              disabled={!canSubmit || isActing}
            >
              {isActing ? (
                <ActivityIndicator color="#0E0E0F" size="small" />
              ) : (
                <Text style={s.submitBtnLabel}>Add Exercise</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>

      <Pressable onPress={onDiscard} hitSlop={{ top: 10, bottom: 10, left: 8, right: 12 }}>
        <Text style={s.deleteIcon}>🗑</Text>
      </Pressable>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = (theme: AppTheme): ReturnType<typeof StyleSheet.create> =>
  StyleSheet.create({
    draftRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 10 },
    draftCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.surface,
      borderWidth: 1.5,
      borderColor: '#534AB7',
      borderStyle: 'dashed',
      borderRadius: 12,
      padding: 12,
      overflow: 'hidden',
    },
    draftAccentBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      borderRadius: 12,
      backgroundColor: '#534AB7',
    },
    thumb: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
      marginLeft: 6,
      flexShrink: 0,
    },
    thumbIcon: { fontSize: 20 },
    draftContent: { flex: 1, gap: 8 },
    draftInput: {
      fontSize: 15,
      paddingVertical: 4,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    draftInputSuggestion: { color: '#AFA9EC', fontStyle: 'italic', borderBottomColor: '#534AB7' },
    draftInputActive: { color: theme.accent, borderBottomColor: theme.accent },
    draftActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    photoBtn: {
      width: 36,
      height: 36,
      backgroundColor: theme.surface,
      borderWidth: 0.5,
      borderColor: theme.border,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitBtn: {
      flex: 1,
      backgroundColor: theme.accent,
      borderRadius: 10,
      paddingVertical: 9,
      alignItems: 'center',
    },
    submitBtnDisabled: { opacity: 0.4 },
    submitBtnLabel: { fontSize: 14, fontWeight: '700', color: '#0E0E0F' },
    deleteIcon: { fontSize: 16, marginTop: 14 },
  });
