import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import {
  Exercise,
  completedSetCount,
  isExerciseDone,
  isExerciseInProgress,
} from '@domain/session/Exercise';
import { Session } from '@domain/session/Session';
import { useSession } from '@presentation/context/SessionContext';
import { AppTheme, useTheme } from '@presentation/theme';
import { ActiveSessionScreenProps } from '@presentation/navigation/types';

// ── Suggestion pool ───────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'Bench Press',
  'Squat',
  'Deadlift',
  'Pull-up',
  'Row',
  'Overhead Press',
  'Lunge',
  'Plank',
  'Dip',
  'Curl',
];

const randomSuggestion = (): string =>
  SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)] + '?';

const stripSuggestionMark = (name: string): string =>
  name.endsWith('?') ? name.slice(0, -1).trim() : name.trim();

const isSuggestion = (name: string): boolean => name.endsWith('?');

// ── Exercise list item ────────────────────────────────────────────────────────

interface ExerciseItemProps {
  exercise: Exercise;
  isSelected: boolean;
  isSessionActive: boolean;
  onSelect: () => void;
  onNavigate: () => void;
  onDelete: () => void;
  theme: AppTheme;
  toggleSetCompletion: (exerciseId: string, setId: string, isCompleted: boolean) => Promise<void>;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({
  exercise,
  isSelected,
  isSessionActive,
  onSelect,
  onNavigate,
  onDelete,
  theme,
  toggleSetCompletion,
}) => {
  const done = isExerciseDone(exercise);
  const inProgress = isExerciseInProgress(exercise);
  const completedCount = completedSetCount(exercise);
  const totalSets = exercise.sets.length;

  const accentColor = done ? '#534AB7' : inProgress ? theme.accent : theme.border;
  const pillBg = done ? '#1E1A3A' : inProgress ? '#0A1F14' : theme.surface;
  const pillLabel = done ? 'Done' : inProgress ? 'In Progress' : 'No Sets';
  const pillColor = done ? '#AFA9EC' : inProgress ? '#9FE1CB' : theme.textMuted;

  // Non-empty sets: have at least one value or are completed
  const visibleSets = exercise.sets.filter(
    s => s.weight !== null || s.repetitions !== null || s.isCompleted,
  );

  const s = exerciseItemStyles(theme, isSelected, accentColor);

  return (
    <View style={s.row}>
      <Pressable
        style={({ pressed }) => [s.item, pressed && !isSelected && s.itemPressed]}
        onPress={onSelect}
      >
        {isSelected && <View style={s.accentBar} />}

        {/* Thumbnail */}
        <View style={s.thumb}>
          {exercise.photoUrl ? (
            <Image source={{ uri: exercise.photoUrl }} style={s.thumbImg} />
          ) : (
            <Text style={s.thumbIcon}>💪</Text>
          )}
        </View>

        {/* Content */}
        <View style={s.content}>
          <View style={s.topRow}>
            <Text style={s.label} numberOfLines={1}>
              {exercise.autoLabel}
            </Text>
            <View style={[s.pill, { backgroundColor: pillBg }]}>
              <Text style={[s.pillText, { color: pillColor }]}>{pillLabel}</Text>
            </View>
          </View>
          <Text style={s.setCount}>
            {totalSets === 0 ? 'No sets' : `${completedCount} / ${totalSets} sets done`}
          </Text>

          {/* Expanded: set completion toggles */}
          {isSelected && visibleSets.length > 0 && (
            <View style={s.setList}>
              {visibleSets.map(set => (
                <Pressable
                  key={set.id}
                  style={s.setRow}
                  onPress={() => void toggleSetCompletion(exercise.id, set.id, set.isCompleted)}
                  disabled={!isSessionActive}
                >
                  <Text style={s.setNum}>#{set.setNumber}</Text>
                  <Text style={s.setWeight}>{set.weight !== null ? `${set.weight} kg` : '—'}</Text>
                  <Text style={s.setReps}>
                    {set.repetitions !== null ? `×${set.repetitions}` : '—'}
                  </Text>
                  <View style={[s.check, set.isCompleted && s.checkDone]}>
                    {set.isCompleted && <Text style={s.checkMark}>✓</Text>}
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </Pressable>

      {/* Navigate › */}
      <Pressable
        style={s.navBtn}
        onPress={onNavigate}
        hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
      >
        <View style={s.navCircle}>
          <Text style={s.navChevron}>›</Text>
        </View>
      </Pressable>

      {/* Delete 🗑 — only for active sessions */}
      {isSessionActive && (
        <Pressable
          style={s.deleteBtn}
          onPress={onDelete}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 12 }}
        >
          <Text style={s.deleteIcon}>🗑</Text>
        </Pressable>
      )}
    </View>
  );
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const exerciseItemStyles = (theme: AppTheme, isSelected: boolean, accentColor: string) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    item: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.surface,
      borderWidth: isSelected ? 1.5 : 0.5,
      borderColor: isSelected ? accentColor : theme.border,
      borderRadius: 12,
      padding: 12,
      overflow: 'hidden',
    },
    itemPressed: { opacity: 0.8 },
    accentBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      borderRadius: 12,
      backgroundColor: accentColor,
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
      overflow: 'hidden',
      flexShrink: 0,
    },
    thumbImg: { width: 40, height: 40 },
    thumbIcon: { fontSize: 20 },
    content: { flex: 1 },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
    label: { flex: 1, fontSize: 14, fontWeight: '600', color: theme.textPrimary },
    pill: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 4,
    },
    pillText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
    setCount: { fontSize: 12, color: theme.textSecondary, marginBottom: 2 },
    setList: { marginTop: 8, gap: 0 },
    setRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 7,
      borderTopWidth: 0.5,
      borderTopColor: theme.border,
      gap: 10,
    },
    setNum: { width: 28, fontSize: 11, color: theme.textMuted, fontVariant: ['tabular-nums'] },
    setWeight: { width: 64, fontSize: 13, color: theme.textPrimary, fontVariant: ['tabular-nums'] },
    setReps: { flex: 1, fontSize: 13, color: theme.textPrimary, fontVariant: ['tabular-nums'] },
    check: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkDone: { backgroundColor: theme.accent, borderColor: theme.accent },
    checkMark: { fontSize: 13, color: '#0E0E0F', fontWeight: '700' },
    navBtn: { marginLeft: 8 },
    navCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isSelected ? 'rgba(198,241,53,0.15)' : theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navChevron: {
      fontSize: 22,
      color: isSelected ? theme.accent : theme.textSecondary,
      lineHeight: 26,
    },
    deleteBtn: { marginLeft: 10 },
    deleteIcon: { fontSize: 16 },
  });

// ── Main screen ───────────────────────────────────────────────────────────────

export const ActiveSessionScreen: React.FC<ActiveSessionScreenProps> = ({ route, navigation }) => {
  const { sessionId } = route.params;
  const theme = useTheme();
  const s = styles(theme);

  const {
    currentSession,
    isLoading,
    error,
    restoreSession,
    addExercise,
    deleteExercise,
    finishSession,
    renameSession,
    toggleSetCompletion,
  } = useSession();

  const [selectedId, setSelectedId] = useState<string | 'new' | null>(null);
  const [showDraft, setShowDraft] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftPhotoUri, setDraftPhotoUri] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const nameInputRef = useRef<TextInput>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const titleInputRef = useRef<TextInput>(null);

  const isSessionActive = currentSession?.status === 'Active';

  // ── Load session ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (currentSession?.id !== sessionId) {
      void restoreSession(sessionId);
    }
  }, [sessionId, currentSession?.id, restoreSession]);

  // ── Auto-select first exercise ────────────────────────────────────────────
  useEffect(() => {
    if (currentSession && !selectedId && currentSession.exercises.length > 0) {
      setSelectedId(currentSession.exercises[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSession?.id]);

  // ── Sorted exercises: done last ───────────────────────────────────────────
  const sortedExercises = currentSession
    ? [...currentSession.exercises].sort((a, b) => {
        const aScore = isExerciseDone(a) ? 1 : 0;
        const bScore = isExerciseDone(b) ? 1 : 0;
        return aScore - bScore;
      })
    : [];

  // ── Item tap — confirm drop draft if exists ───────────────────────────────
  const handleItemTap = useCallback(
    (exerciseId: string): void => {
      if (selectedId === exerciseId) return;

      if (showDraft && selectedId === 'new') {
        Alert.alert('Drop new exercise?', 'You have an unsaved exercise. Drop it?', [
          { text: 'Keep editing', style: 'cancel' },
          {
            text: 'Drop it',
            style: 'destructive',
            onPress: (): void => {
              setShowDraft(false);
              setDraftName('');
              setDraftPhotoUri(null);
              setSelectedId(exerciseId);
            },
          },
        ]);
        return;
      }
      setSelectedId(exerciseId);
    },
    [selectedId, showDraft],
  );

  // ── Add new exercise draft ────────────────────────────────────────────────
  const handleAddNew = useCallback((): void => {
    if (showDraft) return;
    setDraftName(randomSuggestion());
    setDraftPhotoUri(null);
    setShowDraft(true);
    setSelectedId('new');
    setTimeout(() => nameInputRef.current?.focus(), 60);
  }, [showDraft]);

  // ── Photo picker ──────────────────────────────────────────────────────────
  const handlePickPhoto = useCallback(async (): Promise<void> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setDraftPhotoUri(result.assets[0].uri);
    }
  }, []);

  // ── Submit new exercise ───────────────────────────────────────────────────
  const handleSubmitExercise = useCallback(async (): Promise<void> => {
    const name = stripSuggestionMark(draftName);
    if (!name) return;
    setIsActing(true);
    setActionError(null);
    try {
      const exercise = await addExercise({ autoLabel: name, photoUrl: draftPhotoUri ?? undefined });
      setShowDraft(false);
      setDraftName('');
      setDraftPhotoUri(null);
      setSelectedId(exercise.id);
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setIsActing(false);
    }
  }, [draftName, draftPhotoUri, addExercise]);

  // ── Delete exercise ───────────────────────────────────────────────────────
  const handleDelete = useCallback(
    (exerciseId: string): void => {
      Alert.alert('Remove exercise?', 'This exercise will be removed from the session.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async (): Promise<void> => {
            setIsActing(true);
            try {
              await deleteExercise(exerciseId);
              if (selectedId === exerciseId) setSelectedId(null);
            } catch (e) {
              setActionError((e as Error).message);
            } finally {
              setIsActing(false);
            }
          },
        },
      ]);
    },
    [deleteExercise, selectedId],
  );

  // ── Finish session ────────────────────────────────────────────────────────
  const handleFinishSession = useCallback(async (): Promise<void> => {
    Alert.alert('Finish session?', 'Mark this session as complete?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Finish',
        onPress: async (): Promise<void> => {
          setIsActing(true);
          try {
            const session = await finishSession();
            navigation.replace('SessionFinished', { sessionId: session.id });
          } catch (e) {
            setActionError((e as Error).message);
            setIsActing(false);
          }
        },
      },
    ]);
  }, [finishSession, navigation]);

  // ── Toggle set completion (passed to ExerciseItem) ────────────────────────
  const handleToggleSet = useCallback(
    async (exerciseId: string, setId: string, isCompleted: boolean): Promise<void> => {
      try {
        await toggleSetCompletion(exerciseId, setId, isCompleted);
      } catch {
        // silent — optimistic update will revert via context
      }
    },
    [toggleSetCompletion],
  );

  // ── Title rename ──────────────────────────────────────────────────────────
  const startEditingTitle = (): void => {
    if (!isSessionActive) return;
    setTitleDraft(currentSession?.label ?? '');
    setEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 50);
  };

  const commitTitleRename = async (): Promise<void> => {
    setEditingTitle(false);
    const trimmed = titleDraft.trim();
    if (!trimmed || trimmed === currentSession?.label) return;
    try {
      await renameSession(sessionId, trimmed);
    } catch {
      // silent
    }
  };

  // ── Guards ────────────────────────────────────────────────────────────────
  if (isLoading && !currentSession) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
    );
  }

  if (!currentSession) {
    return (
      <View style={s.centered}>
        <Text style={s.errorText}>{error ?? 'Session not found'}</Text>
      </View>
    );
  }

  const session = currentSession as Session;
  const sessionLabel = session.label ?? 'Session';
  const canSubmit = !isSuggestion(draftName)
    ? draftName.trim().length > 0
    : stripSuggestionMark(draftName).length > 0;

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* ── Area 1: Header ── */}
      <View style={s.header}>
        <Pressable
          style={s.backBtn}
          hitSlop={12}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('SessionHub');
            }
          }}
        >
          <Text style={s.backArrow}>‹</Text>
          <Text style={s.backLabel}>Sessions</Text>
        </Pressable>

        {editingTitle ? (
          <TextInput
            ref={titleInputRef}
            style={s.titleInput}
            value={titleDraft}
            onChangeText={setTitleDraft}
            onSubmitEditing={() => void commitTitleRename()}
            onBlur={() => void commitTitleRename()}
            returnKeyType="done"
            selectTextOnFocus
            maxLength={60}
          />
        ) : (
          <Pressable style={s.titleBtn} onPress={startEditingTitle} hitSlop={8}>
            <Text style={s.titleText} numberOfLines={1}>
              {sessionLabel}
            </Text>
            {isSessionActive && <Text style={s.titleEdit}>✎</Text>}
          </Pressable>
        )}

        {editingTitle ? (
          <Pressable style={s.headerRight} hitSlop={12} onPress={() => setEditingTitle(false)}>
            <Text style={s.cancelLabel}>✕</Text>
          </Pressable>
        ) : (
          <View style={s.headerRight} />
        )}
      </View>

      {/* ── Area 2: Exercise list ── */}
      <ScrollView
        style={s.list}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {(error || actionError) && <Text style={s.errorText}>{actionError ?? error}</Text>}

        {/* Draft row — always on top */}
        {showDraft && (
          <View style={s.draftRow}>
            <View style={s.draftCard}>
              <View style={s.draftAccentBar} />
              <View style={s.thumb}>
                <Text style={s.thumbIcon}>💪</Text>
              </View>
              <View style={s.draftContent}>
                <TextInput
                  ref={nameInputRef}
                  style={[
                    s.draftInput,
                    isSuggestion(draftName) ? s.draftInputSuggestion : s.draftInputActive,
                  ]}
                  value={draftName}
                  onChangeText={setDraftName}
                  returnKeyType="done"
                  onSubmitEditing={() => void handleSubmitExercise()}
                  maxLength={80}
                  selectTextOnFocus
                />
                <View style={s.draftActions}>
                  <Pressable style={s.photoBtn} onPress={() => void handlePickPhoto()}>
                    <Text>{draftPhotoUri ? '🖼️' : '📷'}</Text>
                  </Pressable>
                  <Pressable
                    style={[s.submitBtn, !canSubmit && s.submitBtnDisabled]}
                    onPress={() => void handleSubmitExercise()}
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
            <Pressable
              onPress={() => {
                setShowDraft(false);
                setDraftName('');
                setSelectedId(null);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 8, right: 12 }}
            >
              <Text style={s.deleteIcon}>🗑</Text>
            </Pressable>
          </View>
        )}

        {sortedExercises.length === 0 && !showDraft && (
          <Text style={s.emptyList}>{'Tap "+ Add Exercise" to start your first exercise.'}</Text>
        )}

        {sortedExercises.map(exercise => (
          <ExerciseItem
            key={exercise.id}
            exercise={exercise}
            isSelected={selectedId === exercise.id}
            isSessionActive={!!isSessionActive}
            onSelect={() => handleItemTap(exercise.id)}
            onNavigate={() => {
              setSelectedId(exercise.id);
              navigation.navigate('Exercise', { sessionId, exerciseId: exercise.id });
            }}
            onDelete={() => handleDelete(exercise.id)}
            theme={theme}
            toggleSetCompletion={handleToggleSet}
          />
        ))}
      </ScrollView>

      {/* ── Area 3: Action area ── */}
      {isSessionActive && (
        <View style={s.actionArea}>
          <Text style={s.actionLabel}>ACTIONS</Text>
          <Pressable
            style={[s.btnPrimary, showDraft && s.btnDisabled]}
            onPress={handleAddNew}
            disabled={showDraft}
          >
            <Text style={s.btnPrimaryLabel}>+ Add Exercise</Text>
          </Pressable>
          <Pressable
            style={s.btnFinishSession}
            onPress={() => void handleFinishSession()}
            disabled={isActing}
          >
            <Text style={s.btnFinishSessionLabel}>⏹ Finish Session</Text>
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
    errorText: { fontSize: 12, color: theme.danger, textAlign: 'center', marginBottom: 6 },

    // Header
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

    // List
    list: { flex: 1, minHeight: 80 },
    listContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 },
    emptyList: { fontSize: 13, color: theme.textMuted, textAlign: 'center', marginTop: 32 },

    // Draft row
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
