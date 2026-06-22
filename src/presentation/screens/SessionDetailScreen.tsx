import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { isExerciseDone } from '@domain/session/Exercise';
import { Session } from '@domain/session/Session';
import { useSession } from '@presentation/context/SessionContext';
import { AppTheme, useTheme } from '@presentation/theme';
import { SessionDetailScreenProps } from '@presentation/navigation/types';
import {
  randomExerciseSuggestion,
  stripSuggestionMark,
  isSuggestion,
} from '../components/session-detail/ExerciseSuggestions';
import { ExerciseItem } from '../components/session-detail/ExerciseItem';
import { DraftExerciseRow } from '../components/session-detail/DraftExerciseRow';
import { DetailHeader } from '../components/session-detail/DetailHeader';
import { DetailActionArea } from '../components/session-detail/DetailActionArea';

// ── Screen ────────────────────────────────────────────────────────────────────

export const SessionDetailScreen: React.FC<SessionDetailScreenProps> = ({ route, navigation }) => {
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
    setDraftName(randomExerciseSuggestion());
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
      mediaTypes: ['images'],
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

  // ── Toggle set completion ─────────────────────────────────────────────────
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <DetailHeader
        sessionLabel={sessionLabel}
        isSessionActive={isSessionActive}
        editingTitle={editingTitle}
        titleDraft={titleDraft}
        titleInputRef={titleInputRef}
        onChangeTitleDraft={setTitleDraft}
        onStartEditing={startEditingTitle}
        onCommitRename={() => void commitTitleRename()}
        onCancelEdit={() => setEditingTitle(false)}
        onBack={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate('SessionHub');
        }}
      />

      <ScrollView
        style={s.list}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {(error || actionError) && <Text style={s.errorText}>{actionError ?? error}</Text>}

        {showDraft && (
          <DraftExerciseRow
            nameInputRef={nameInputRef}
            draftName={draftName}
            onChangeName={setDraftName}
            draftPhotoUri={draftPhotoUri}
            onPickPhoto={() => void handlePickPhoto()}
            onSubmit={() => void handleSubmitExercise()}
            onDiscard={() => {
              setShowDraft(false);
              setDraftName('');
              setSelectedId(null);
            }}
            isActing={isActing}
            canSubmit={canSubmit}
          />
        )}

        {sortedExercises.length === 0 && !showDraft && (
          <Text style={s.emptyList}>{'Tap "+ Add Exercise" to start your first exercise.'}</Text>
        )}

        {sortedExercises.map(exercise => (
          <ExerciseItem
            key={exercise.id}
            exercise={exercise}
            isSelected={selectedId === exercise.id}
            isSessionActive={isSessionActive}
            onSelect={() => handleItemTap(exercise.id)}
            onNavigate={() => {
              setSelectedId(exercise.id);
              navigation.navigate('Exercise', { sessionId, exerciseId: exercise.id });
            }}
            onDelete={() => handleDelete(exercise.id)}
            toggleSetCompletion={handleToggleSet}
          />
        ))}
      </ScrollView>

      {isSessionActive && (
        <DetailActionArea
          showDraft={showDraft}
          isActing={isActing}
          onAddNew={handleAddNew}
          onFinishSession={() => void handleFinishSession()}
        />
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
    list: { flex: 1, minHeight: 80 },
    listContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 },
    emptyList: { fontSize: 13, color: theme.textMuted, textAlign: 'center', marginTop: 32 },
  });
