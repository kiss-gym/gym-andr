import { Exercise, isExerciseDone } from './Exercise';

export type SessionStatus = 'Active' | 'Finished';

// Aggregate Root — owns the Exercise collection lifecycle
export interface Session {
  readonly id: string;
  readonly userId: string;
  readonly createdAt: Date;
  readonly finishedAt?: Date;
  readonly status: SessionStatus;
  readonly inheritedFromSessionId?: string;
  readonly label?: string;
  readonly exercises: readonly Exercise[];
}

// Derived queries

export const isActive = (session: Session): boolean => session.status === 'Active';

export const durationSeconds = (session: Session): number => {
  const end = session.finishedAt ?? new Date();
  return Math.floor((end.getTime() - session.createdAt.getTime()) / 1000);
};

// Returns exercises that have at least one completed set — used by SessionFinishedScreen
export const finishedExercises = (session: Session): Exercise[] =>
  session.exercises.filter(e => isExerciseDone(e));
