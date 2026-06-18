import {
  ISessionRepository,
  UpdateExerciseInput,
  UpdateSetInput,
} from '@domain/session/ISessionRepository';
import { Exercise } from '@domain/session/Exercise';
import { ExerciseSet } from '@domain/session/ExerciseSet';

// ── UpdateExerciseUseCase ─────────────────────────────────────────────────────

export class UpdateExerciseUseCase {
  constructor(private readonly sessionRepo: ISessionRepository) {}

  async execute(
    sessionId: string,
    exerciseId: string,
    input: UpdateExerciseInput,
  ): Promise<Exercise> {
    return this.sessionRepo.updateExercise(sessionId, exerciseId, input);
  }
}

// ── AddSetUseCase ─────────────────────────────────────────────────────────────
// If no sets exist → creates blank set { weight: null, repetitions: null }
// If sets exist    → copies last set via copy-last endpoint
// Smart behaviour encapsulated in use case — screens don't need to know.

export class AddSetUseCase {
  constructor(private readonly sessionRepo: ISessionRepository) {}

  async execute(sessionId: string, exerciseId: string, hasSets: boolean): Promise<ExerciseSet> {
    if (hasSets) {
      return this.sessionRepo.copyLastSet(sessionId, exerciseId);
    }
    return this.sessionRepo.addSet(sessionId, exerciseId, {
      weight: null,
      repetitions: null,
    });
  }
}

// ── UpdateSetUseCase ──────────────────────────────────────────────────────────

export class UpdateSetUseCase {
  constructor(private readonly sessionRepo: ISessionRepository) {}

  async execute(
    sessionId: string,
    exerciseId: string,
    setId: string,
    input: UpdateSetInput,
  ): Promise<ExerciseSet> {
    return this.sessionRepo.updateSet(sessionId, exerciseId, setId, input);
  }
}

// ── DeleteSetUseCase ──────────────────────────────────────────────────────────

export class DeleteSetUseCase {
  constructor(private readonly sessionRepo: ISessionRepository) {}

  async execute(sessionId: string, exerciseId: string, setId: string): Promise<void> {
    return this.sessionRepo.deleteSet(sessionId, exerciseId, setId);
  }
}

// ── ToggleSetCompletionUseCase ────────────────────────────────────────────────
// Wraps complete + incomplete — screen passes current isCompleted,
// use case picks the right endpoint.

export class ToggleSetCompletionUseCase {
  constructor(private readonly sessionRepo: ISessionRepository) {}

  async execute(
    sessionId: string,
    exerciseId: string,
    setId: string,
    currentlyCompleted: boolean,
  ): Promise<ExerciseSet> {
    if (currentlyCompleted) {
      return this.sessionRepo.uncompleteSet(sessionId, exerciseId, setId);
    }
    return this.sessionRepo.completeSet(sessionId, exerciseId, setId);
  }
}
