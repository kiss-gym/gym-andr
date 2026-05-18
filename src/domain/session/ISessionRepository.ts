import { Exercise } from './Exercise';
import { Session, SessionStatus } from './Session';
import { PagedResponse } from '../PagedResponse';

export interface AddExerciseInput {
  autoLabel: string;
  photoUrl?: string;
  properties?: { name: string; value: string }[];
}

// Query params for GET /api/sessions — userId removed, server reads it from JWT
export interface GetSessionsQuery {
  status?: SessionStatus;
  sort?: string;
  page?: number;
  pageSize?: number;
}

// Repository interface — Dependency Inversion boundary.
// NO HTTP details here.
export interface ISessionRepository {
  createSession(label?: string, inheritFromSessionId?: string): Promise<Session>;
  renameSession(sessionId: string, label: string): Promise<Session>;
  getById(sessionId: string): Promise<Session>;
  deleteSession(sessionId: string): Promise<void>;
  finish(sessionId: string): Promise<Session>;
  getActive(): Promise<Session | null>;
  getSessions(query: GetSessionsQuery): Promise<PagedResponse<Session>>;
  addExercise(sessionId: string, input: AddExerciseInput): Promise<Exercise>;
  startExercise(sessionId: string, exerciseId: string): Promise<Exercise>;
  finishExercise(sessionId: string, exerciseId: string): Promise<Exercise>;
  deleteExercise(sessionId: string, exerciseId: string): Promise<void>;
}
