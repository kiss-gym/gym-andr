// Value Object — immutable, identified by id within an Exercise
export interface ExerciseSet {
  readonly id: string;
  readonly setNumber: number;
  readonly isCompleted: boolean;
  readonly weight: number | null;
  readonly repetitions: number | null;
}
