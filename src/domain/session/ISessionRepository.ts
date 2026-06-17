import { Exercise } from './Exercise';
import { ExerciseSet } from './ExerciseSet';
import { Session, SessionStatus } from './Session';
import { PagedResponse } from '../PagedResponse';

export interface AddExerciseInput {
  autoLabel: string;
  photoUrl?: string;
  properties?: { name: string; value: string }[];
}

export interface UpdateExerciseInput {
  autoLabel?: string | null;
  photoUrl?: string | null;
  properties?: { name: string; value: string }[] | null;
}

export interface AddSetInput {
  weight?: number | null;
  repetitions?: number | null;
}

export interface UpdateSetInput {
  weight?: number | null;
  repetitions?: number | null;
}

export interface GetSessionsQuery {
  status?: SessionStatus;
  sort?: string;
  page?: number;
  pageSize?: number;
}

// Repository interface — Dependency Inversion boundary.
// NO fetch(), NO HTTP details here.
// userId removed from all methods — server extracts it from JWT.
// startExercise/finishExercise removed — exercise state derived from sets client-side.
export interface ISessionRepository {
  // Session
  createSession(label?: string, inheritFromSessionId?: string): Promise<Session>;
  renameSession(sessionId: string, label: string): Promise<Session>;
  getById(sessionId: string): Promise<Session>;
  deleteSession(sessionId: string): Promise<void>;
  finish(sessionId: string): Promise<Session>;
  getActive(): Promise<Session | null>;
  getSessions(query: GetSessionsQuery): Promise<PagedResponse<Session>>;

  // Exercise
  addExercise(sessionId: string, input: AddExerciseInput): Promise<Exercise>;
  updateExercise(
    sessionId: string,
    exerciseId: string,
    input: UpdateExerciseInput,
  ): Promise<Exercise>;
  deleteExercise(sessionId: string, exerciseId: string): Promise<void>;

  // Sets
  addSet(sessionId: string, exerciseId: string, input: AddSetInput): Promise<ExerciseSet>;
  copyLastSet(sessionId: string, exerciseId: string): Promise<ExerciseSet>;
  updateSet(
    sessionId: string,
    exerciseId: string,
    setId: string,
    input: UpdateSetInput,
  ): Promise<ExerciseSet>;
  deleteSet(sessionId: string, exerciseId: string, setId: string): Promise<void>;
  completeSet(sessionId: string, exerciseId: string, setId: string): Promise<ExerciseSet>;
  uncompleteSet(sessionId: string, exerciseId: string, setId: string): Promise<ExerciseSet>;
}
