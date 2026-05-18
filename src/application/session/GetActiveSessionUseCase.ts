import { ISessionRepository } from '@domain/session/ISessionRepository';
import { Session } from '@domain/session/Session';

// Returns the user's current active session, or null if there is none.
export class GetActiveSessionUseCase {
  constructor(private readonly sessionRepo: ISessionRepository) {}

  async execute(): Promise<Session | null> {
    return this.sessionRepo.getActive();
  }
}
