import { ISessionRepository } from '@domain/session/ISessionRepository';
import { Session } from '@domain/session/Session';

// Fetches a single session by ID.
export class GetSessionByIdUseCase {
  constructor(private readonly sessionRepo: ISessionRepository) {}

  async execute(sessionId: string): Promise<Session> {
    return this.sessionRepo.getById(sessionId);
  }
}
