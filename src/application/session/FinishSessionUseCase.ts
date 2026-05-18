import { ISessionRepository } from '@domain/session/ISessionRepository';
import { Session } from '@domain/session/Session';

// Finishes the session. Auto-finishes all exercises.
export class FinishSessionUseCase {
  constructor(private readonly sessionRepo: ISessionRepository) {}

  async execute(sessionId: string): Promise<Session> {
    return this.sessionRepo.finish(sessionId);
  }
}
