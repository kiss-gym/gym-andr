import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Exercise,
  completedSetCount,
  isExerciseDone,
  isExerciseInProgress,
} from '@domain/session/Exercise';
import { AppTheme, useTheme } from '@presentation/theme';

// ── Props ─────────────────────────────────────────────────────────────────────

interface ExerciseItemProps {
  exercise: Exercise;
  isSelected: boolean;
  isSessionActive: boolean;
  onSelect: () => void;
  onNavigate: () => void;
  onDelete: () => void;
  toggleSetCompletion: (exerciseId: string, setId: string, isCompleted: boolean) => Promise<void>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const ExerciseItem: React.FC<ExerciseItemProps> = ({
  exercise,
  isSelected,
  isSessionActive,
  onSelect,
  onNavigate,
  onDelete,
  toggleSetCompletion,
}) => {
  const theme = useTheme();

  const done = isExerciseDone(exercise);
  const inProgress = isExerciseInProgress(exercise);
  const completedCount = completedSetCount(exercise);
  const totalSets = exercise.sets.length;

  const accentColor = done ? '#534AB7' : inProgress ? theme.accent : theme.border;
  const pillBg = done ? '#1E1A3A' : inProgress ? '#0A1F14' : theme.surface;
  const pillLabel = done ? 'Done' : inProgress ? 'In Progress' : '';
  const pillColor = done ? '#AFA9EC' : inProgress ? '#9FE1CB' : theme.textMuted;

  const visibleSets = exercise.sets.filter(
    s => s.weight !== null || s.repetitions !== null || s.isCompleted,
  );

  const s = styles(theme, isSelected, accentColor);

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

        <Pressable
          onPress={onNavigate}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={s.navChevron}
        >
          <View style={s.chevronCircle}>
            <Text style={s.chevron}>›</Text>
          </View>
        </Pressable>
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

// ── Styles ────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const styles = (theme: AppTheme, isSelected: boolean, accentColor: string) =>
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
    pill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
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
    navChevron: { alignSelf: 'center', marginLeft: 20 },
    chevron: {
      fontSize: 22,
      color: isSelected ? theme.accent : theme.textSecondary,
      lineHeight: 26,
    },
    chevronCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isSelected ? '#1A3010' : theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteBtn: { marginLeft: 10 },
    deleteIcon: { fontSize: 16 },
  });
