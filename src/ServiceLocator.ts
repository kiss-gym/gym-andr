// Dependency Injection wiring — no framework, just a plain object.

import { HttpSessionRepository } from '@infrastructure/session/HttpSessionRepository';
import { HttpUserRepository } from '@infrastructure/user/HttpUserRepository';

import { CreateSessionUseCase } from '@application/session/CreateSessionUseCase';
import { InheritSessionUseCase } from '@application/session/InheritSessionUseCase';
import { RenameSessionUseCase } from '@application/session/RenameSessionUseCase';
import { DeleteSessionUseCase } from '@application/session/DeleteSessionUseCase';
import { AddExerciseUseCase } from '@application/session/AddExerciseUseCase';
import { StartExerciseUseCase } from '@application/session/StartExerciseUseCase';
import { FinishExerciseUseCase } from '@application/session/FinishExerciseUseCase';
import { DeleteExerciseUseCase } from '@application/session/DeleteExerciseUseCase';
import { FinishSessionUseCase } from '@application/session/FinishSessionUseCase';
import { GetActiveSessionUseCase } from '@application/session/GetActiveSessionUseCase';
import { GetSessionsUseCase } from '@application/session/GetSessionsUseCase';
import { GetSessionByIdUseCase } from '@application/session/GetSessionByIdUseCase';
import { GetCurrentUserUseCase } from '@application/user/GetCurrentUserUseCase';

const sessionRepo = new HttpSessionRepository();
const userRepo = new HttpUserRepository();

export const serviceLocator = {
  // Session use cases
  createSession: new CreateSessionUseCase(sessionRepo),
  inheritSession: new InheritSessionUseCase(sessionRepo),
  renameSession: new RenameSessionUseCase(sessionRepo),
  deleteSession: new DeleteSessionUseCase(sessionRepo),
  getSessionById: new GetSessionByIdUseCase(sessionRepo),
  addExercise: new AddExerciseUseCase(sessionRepo),
  startExercise: new StartExerciseUseCase(sessionRepo),
  finishExercise: new FinishExerciseUseCase(sessionRepo),
  deleteExercise: new DeleteExerciseUseCase(sessionRepo),
  finishSession: new FinishSessionUseCase(sessionRepo),
  getActiveSession: new GetActiveSessionUseCase(sessionRepo),
  getSessions: new GetSessionsUseCase(sessionRepo),

  // User use cases
  getCurrentUser: new GetCurrentUserUseCase(userRepo),
} as const;
