import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageStyle,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ExerciseSet } from '@domain/session/ExerciseSet';
import { isExerciseDone, isExerciseInProgress } from '@domain/session/Exercise';
import { useSession } from '@presentation/context/SessionContext';
import { AppTheme, useTheme } from '@presentation/theme';
import { ExerciseScreenProps } from '@presentation/navigation/types';

// ── Set row ───────────────────────────────────────────────────────────────────

interface SetRowProps {
  set: ExerciseSet;
  isSessionActive: boolean;
  onToggle: () => void;
  onUpdateWeight: (value: string) => void;
  onUpdateReps: (value: string) => void;
  onDelete: () => void;
  theme: AppTheme;
}

const SetRow: React.FC<SetRowProps> = ({
  set,
  isSessionActive,
  onToggle,
  onUpdateWeight,
  onUpdateReps,
  onDelete,
  theme,
}) => {
  const s = setRowStyles(theme, set.isCompleted);
  const [weightText, setWeightText] = useState(set.weight !== null ? String(set.weight) : '');
  const [repsText, setRepsText] = useState(set.repetitions !== null ? String(set.repetitions) : '');

  // Sync from server updates
  useEffect(() => {
    setWeightText(set.weight !== null ? String(set.weight) : '');
  }, [set.weight]);
  useEffect(() => {
    setRepsText(set.repetitions !== null ? String(set.repetitions) : '');
  }, [set.repetitions]);

  return (
    <View style={s.row}>
      <Text style={s.setNum}>#{set.setNumber}</Text>

      <TextInput
        style={s.input}
        value={weightText}
        onChangeText={setWeightText}
        onBlur={() => onUpdateWeight(weightText)}
        placeholder="—"
        placeholderTextColor={theme.textMuted}
        keyboardType="decimal-pad"
        returnKeyType="next"
        editable={isSessionActive}
      />
      <Text style={s.unit}>kg</Text>

      <TextInput
        style={s.input}
        value={repsText}
        onChangeText={setRepsText}
        onBlur={() => onUpdateReps(repsText)}
        placeholder="—"
        placeholderTextColor={theme.textMuted}
        keyboardType="number-pad"
        returnKeyType="done"
        editable={isSessionActive}
      />
      <Text style={s.unit}>reps</Text>

      <Pressable
        style={[s.check, set.isCompleted && s.checkDone]}
        onPress={onToggle}
        disabled={!isSessionActive}
        hitSlop={8}
      >
        {set.isCompleted && <Text style={s.checkMark}>✓</Text>}
      </Pressable>

      {isSessionActive && (
        <Pressable onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}>
          <Text style={s.deleteIcon}>🗑</Text>
        </Pressable>
      )}
    </View>
  );
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const setRowStyles = (theme: AppTheme, isCompleted: boolean) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.border,
      gap: 6,
    },
    setNum: {
      width: 30,
      fontSize: 12,
      color: theme.textMuted,
      fontVariant: ['tabular-nums'],
    },
    input: {
      width: 60,
      backgroundColor: theme.surface,
      borderWidth: 0.5,
      borderColor: isCompleted ? theme.accent : theme.border,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 6,
      fontSize: 14,
      color: theme.textPrimary,
      textAlign: 'center',
      fontVariant: ['tabular-nums'],
    },
    unit: { fontSize: 11, color: theme.textMuted, width: 26 },
    check: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 4,
    },
    checkDone: { backgroundColor: theme.accent, borderColor: theme.accent },
    checkMark: { fontSize: 14, color: '#0E0E0F', fontWeight: '700' },
    deleteIcon: { fontSize: 15, marginLeft: 4 },
  });

// ── Main screen ───────────────────────────────────────────────────────────────

export const ExerciseScreen: React.FC<ExerciseScreenProps> = ({ route, navigation }) => {
  const { sessionId, exerciseId } = route.params;
  const theme = useTheme();
  const s = styles(theme);

  const {
    currentSession,
    isLoading,
    restoreSession,
    updateExercise,
    addSet,
    updateSet,
    deleteSet,
    toggleSetCompletion,
  } = useSession();

  const [isActing, setIsActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState('');
  const labelInputRef = useRef<TextInput>(null);

  // ── Load session if needed ────────────────────────────────────────────────
  useEffect(() => {
    if (currentSession?.id !== sessionId) {
      void restoreSession(sessionId);
    }
  }, [sessionId, currentSession?.id, restoreSession]);

  const exercise = currentSession?.exercises.find(e => e.id === exerciseId);
  const isSessionActive = currentSession?.status === 'Active';

  const done = exercise ? isExerciseDone(exercise) : false;
  const inProgress = exercise ? isExerciseInProgress(exercise) : false;
  const pillLabel = done ? 'Done' : inProgress ? 'In Progress' : 'No Sets';
  const pillBg = done ? '#1E1A3A' : inProgress ? '#0A1F14' : theme.surface;
  const pillColor = done ? '#AFA9EC' : inProgress ? '#9FE1CB' : theme.textMuted;

  // ── Label rename ──────────────────────────────────────────────────────────
  const startEditing = (): void => {
    if (!isSessionActive || !exercise) return;
    setLabelDraft(exercise.autoLabel);
    setEditingLabel(true);
    setTimeout(() => labelInputRef.current?.focus(), 50);
  };

  const commitLabel = useCallback(async (): Promise<void> => {
    setEditingLabel(false);
    const trimmed = labelDraft.trim();
    if (!trimmed || trimmed === exercise?.autoLabel) return;
    try {
      await updateExercise(exerciseId, { autoLabel: trimmed });
    } catch (e) {
      setActionError((e as Error).message);
    }
  }, [labelDraft, exercise?.autoLabel, exerciseId, updateExercise]);

  // ── Photo ─────────────────────────────────────────────────────────────────
  const handlePickPhoto = useCallback(async (): Promise<void> => {
    if (!isSessionActive) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      try {
        await updateExercise(exerciseId, { photoUrl: result.assets[0].uri });
      } catch (e) {
        setActionError((e as Error).message);
      }
    }
  }, [isSessionActive, exerciseId, updateExercise]);

  // ── Add set ───────────────────────────────────────────────────────────────
  const handleAddSet = useCallback(async (): Promise<void> => {
    if (!exercise) return;
    setIsActing(true);
    setActionError(null);
    try {
      await addSet(exerciseId, exercise.sets.length > 0);
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setIsActing(false);
    }
  }, [exercise, exerciseId, addSet]);

  // ── Update set field ──────────────────────────────────────────────────────
  const handleUpdateWeight = useCallback(
    async (setId: string, text: string): Promise<void> => {
      const parsed = text.trim() === '' ? null : parseFloat(text.replace(',', '.'));
      if (parsed !== null && isNaN(parsed)) return;
      try {
        await updateSet(exerciseId, setId, { weight: parsed });
      } catch (e) {
        setActionError((e as Error).message);
      }
    },
    [exerciseId, updateSet],
  );

  const handleUpdateReps = useCallback(
    async (setId: string, text: string): Promise<void> => {
      const parsed = text.trim() === '' ? null : parseInt(text, 10);
      if (parsed !== null && isNaN(parsed)) return;
      try {
        await updateSet(exerciseId, setId, { repetitions: parsed });
      } catch (e) {
        setActionError((e as Error).message);
      }
    },
    [exerciseId, updateSet],
  );

  // ── Delete set ────────────────────────────────────────────────────────────
  const handleDeleteSet = useCallback(
    (setId: string): void => {
      Alert.alert('Delete set?', 'Remove this set?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async (): Promise<void> => {
            try {
              await deleteSet(exerciseId, setId);
            } catch (e) {
              setActionError((e as Error).message);
            }
          },
        },
      ]);
    },
    [exerciseId, deleteSet],
  );

  // ── Toggle set ────────────────────────────────────────────────────────────
  const handleToggle = useCallback(
    async (setId: string, isCompleted: boolean): Promise<void> => {
      try {
        await toggleSetCompletion(exerciseId, setId, isCompleted);
      } catch {
        // silent
      }
    },
    [exerciseId, toggleSetCompletion],
  );

  // ── Guards ────────────────────────────────────────────────────────────────
  if (isLoading && !currentSession) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={s.centered}>
        <Text style={s.errorText}>Exercise not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* ── Header ── */}
      <View style={s.header}>
        <Pressable style={s.backBtn} hitSlop={12} onPress={() => navigation.goBack()}>
          <Text style={s.backArrow}>‹</Text>
          <Text style={s.backLabel}>Session</Text>
        </Pressable>

        {editingLabel ? (
          <TextInput
            ref={labelInputRef}
            style={s.titleInput}
            value={labelDraft}
            onChangeText={setLabelDraft}
            onSubmitEditing={() => void commitLabel()}
            onBlur={() => void commitLabel()}
            returnKeyType="done"
            selectTextOnFocus
            maxLength={80}
          />
        ) : (
          <Pressable style={s.titleBtn} onPress={startEditing} hitSlop={8}>
            <Text style={s.titleText} numberOfLines={1}>
              {exercise.autoLabel}
            </Text>
            {isSessionActive && <Text style={s.titleEdit}>✎</Text>}
          </Pressable>
        )}

        <View style={[s.statusPill, { backgroundColor: pillBg }]}>
          <Text style={[s.statusPillText, { color: pillColor }]}>{pillLabel}</Text>
        </View>
      </View>

      {/* ── Photo ── */}
      {(exercise.photoUrl || isSessionActive) && (
        <Pressable
          style={s.photoArea}
          onPress={() => void handlePickPhoto()}
          disabled={!isSessionActive}
        >
          {exercise.photoUrl ? (
            <Image source={{ uri: exercise.photoUrl }} style={imageStyles.photo} />
          ) : (
            <View style={s.photoPlaceholder}>
              <Text style={s.photoPlaceholderIcon}>📷</Text>
              <Text style={s.photoPlaceholderLabel}>Add photo</Text>
            </View>
          )}
        </Pressable>
      )}

      {/* ── Set list ── */}
      <ScrollView
        style={s.list}
        contentContainerStyle={s.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {actionError && <Text style={s.errorText}>{actionError}</Text>}

        {/* Column headers */}
        {exercise.sets.length > 0 && (
          <View style={s.colHeader}>
            <Text style={[s.colLabel, { width: 30 }]}>#</Text>
            <Text style={[s.colLabel, { width: 60 }]}>Weight</Text>
            <Text style={[s.colLabel, { width: 26 }]} />
            <Text style={[s.colLabel, { width: 60 }]}>Reps</Text>
            <Text style={[s.colLabel, { flex: 1 }]} />
          </View>
        )}

        {exercise.sets.map(set => (
          <SetRow
            key={set.id}
            set={set}
            isSessionActive={isSessionActive}
            onToggle={() => void handleToggle(set.id, set.isCompleted)}
            onUpdateWeight={text => void handleUpdateWeight(set.id, text)}
            onUpdateReps={text => void handleUpdateReps(set.id, text)}
            onDelete={() => handleDeleteSet(set.id)}
            theme={theme}
          />
        ))}

        {exercise.sets.length === 0 && (
          <Text style={s.emptyText}>
            {isSessionActive ? 'Tap "+ Add Set" to track your sets.' : 'No sets recorded.'}
          </Text>
        )}
      </ScrollView>

      {/* ── Action area — only for active sessions ── */}
      {isSessionActive && (
        <View style={s.actionArea}>
          <Pressable
            style={({ pressed }) => [
              s.addSetBtn,
              isActing && s.addSetBtnDisabled,
              pressed && s.addSetBtnPressed,
            ]}
            onPress={() => void handleAddSet()}
            disabled={isActing}
          >
            {isActing ? (
              <ActivityIndicator color={theme.accentLightText} />
            ) : (
              <Text style={s.addSetBtnLabel}>
                {exercise.sets.length === 0 ? '+ Add Set' : '+ Add Set  (copy last)'}
              </Text>
            )}
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = (theme: AppTheme): ReturnType<typeof StyleSheet.create> =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
    },
    errorText: { fontSize: 12, color: theme.danger, textAlign: 'center', marginBottom: 8 },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 52,
      paddingBottom: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.border,
      gap: 8,
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
    statusPill: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    statusPillText: {
      fontSize: 9,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    // Photo
    photoArea: {
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 12,
      overflow: 'hidden',
    },
    photoPlaceholder: {
      width: '100%',
      height: 72,
      backgroundColor: theme.surface,
      borderWidth: 0.5,
      borderColor: theme.border,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    photoPlaceholderIcon: { fontSize: 18 },
    photoPlaceholderLabel: { fontSize: 13, color: theme.textMuted },

    // Set list
    list: { flex: 1 },
    listContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8 },
    colHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: 6,
      gap: 6,
    },
    colLabel: {
      fontSize: 9,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: theme.textMuted,
    },
    emptyText: { fontSize: 13, color: theme.textMuted, textAlign: 'center', marginTop: 24 },

    // Action area
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
    addSetBtn: {
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
    addSetBtnDisabled: { opacity: 0.45 },
    addSetBtnPressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
    addSetBtnLabel: { fontSize: 15, fontWeight: '700', color: theme.accentLightText },
  });

const imageStyles = StyleSheet.create({
  photo: { width: '100%', height: 160, resizeMode: 'cover' } as ImageStyle,
});
