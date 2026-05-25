import { ExerciseSet } from './ExerciseSet';
import { ExerciseStatus } from './ExerciseStatus';

// Entity — identified by id, lifecycle managed by Session aggregate
export interface Exercise {
  readonly id: string;
  readonly autoLabel: string;
  readonly photoUrl: string | null;
  readonly startedAt: Date | undefined;
  readonly realEndAt: Date | undefined;
  readonly status: ExerciseStatus;
  readonly properties: { name: string; value: string }[];
  readonly sets: ExerciseSet[]; // ← new, always present
}

// Derive elapsed seconds for a running exercise (UI timer)
export const elapsedSeconds = (exercise: Exercise): number => {
  if (!exercise.startedAt) return 0;
  const end = exercise.realEndAt ?? new Date();
  return Math.floor((end.getTime() - exercise.startedAt.getTime()) / 1000);
};
