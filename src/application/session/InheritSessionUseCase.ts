import { ISessionRepository } from '@domain/session/ISessionRepository';
import { Session } from '@domain/session/Session';
import { generateSessionLabel } from './CreateSessionUseCase';

export class InheritSessionUseCase {
  constructor(private readonly sessionRepo: ISessionRepository) {}

  async execute(inheritFromSessionId: string, label?: string): Promise<Session> {
    const autoLabel = label ?? generateSessionLabel();
    return this.sessionRepo.createSession(autoLabel, inheritFromSessionId);
  }
}
