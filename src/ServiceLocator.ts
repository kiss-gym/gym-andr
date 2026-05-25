import { HttpSessionRepository } from '@infrastructure/session/HttpSessionRepository';
import { HttpUserRepository } from '@infrastructure/user/HttpUserRepository';

import { CreateSessionUseCase } from '@application/session/CreateSessionUseCase';
import { InheritSessionUseCase } from '@application/session/InheritSessionUseCase';
import { RenameSessionUseCase } from '@application/session/RenameSessionUseCase';
import { DeleteSessionUseCase } from '@application/session/DeleteSessionUseCase';
import { AddExerciseUseCase } from '@application/session/AddExerciseUseCase';
import {
  UpdateExerciseUseCase,
  AddSetUseCase,
  UpdateSetUseCase,
  DeleteSetUseCase,
  ToggleSetCompletionUseCase,
} from '@application/session/SetUseCases';
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
  // Session
  createSession: new CreateSessionUseCase(sessionRepo),
  inheritSession: new InheritSessionUseCase(sessionRepo),
  renameSession: new RenameSessionUseCase(sessionRepo),
  deleteSession: new DeleteSessionUseCase(sessionRepo),
  getSessionById: new GetSessionByIdUseCase(sessionRepo),
  getActiveSession: new GetActiveSessionUseCase(sessionRepo),
  getSessions: new GetSessionsUseCase(sessionRepo),
  finishSession: new FinishSessionUseCase(sessionRepo),

  // Exercise
  addExercise: new AddExerciseUseCase(sessionRepo),
  updateExercise: new UpdateExerciseUseCase(sessionRepo),
  startExercise: new StartExerciseUseCase(sessionRepo),
  finishExercise: new FinishExerciseUseCase(sessionRepo),
  deleteExercise: new DeleteExerciseUseCase(sessionRepo),

  // Sets
  addSet: new AddSetUseCase(sessionRepo),
  updateSet: new UpdateSetUseCase(sessionRepo),
  deleteSet: new DeleteSetUseCase(sessionRepo),
  toggleSetCompletion: new ToggleSetCompletionUseCase(sessionRepo),

  // User
  getCurrentUser: new GetCurrentUserUseCase(userRepo),
} as const;
