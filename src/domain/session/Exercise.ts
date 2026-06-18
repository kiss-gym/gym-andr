import { ExerciseSet } from './ExerciseSet';

// Entity — identified by id, lifecycle managed by Session aggregate
export interface Exercise {
  readonly id: string;
  readonly autoLabel: string;
  readonly photoUrl: string | null;
  readonly startedAt: Date | undefined;
  readonly realEndAt: Date | undefined;
  readonly properties: { name: string; value: string }[];
  readonly sets: ExerciseSet[];
}

// Derived state — computed from sets, no server-side status needed
export const isExerciseDone = (exercise: Exercise): boolean =>
  exercise.sets.length > 0 && exercise.sets.every(s => s.isCompleted);

export const isExerciseInProgress = (exercise: Exercise): boolean =>
  exercise.sets.some(s => s.isCompleted) && !isExerciseDone(exercise);

export const completedSetCount = (exercise: Exercise): number =>
  exercise.sets.filter(s => s.isCompleted).length;
