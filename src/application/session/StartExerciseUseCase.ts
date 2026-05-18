import { ISessionRepository } from '@domain/session/ISessionRepository';
import { Exercise } from '@domain/session/Exercise';

// Starts a Pending (inherited) exercise.
// Auto-finishes any currently running exercise
export class StartExerciseUseCase {
  constructor(private readonly sessionRepo: ISessionRepository) {}

  async execute(sessionId: string, exerciseId: string): Promise<Exercise> {
    return this.sessionRepo.startExercise(sessionId, exerciseId);
  }
}
