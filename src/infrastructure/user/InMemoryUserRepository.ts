import { IUserRepository } from '@domain/user/IUserRepository';
import { User } from '@domain/user/User';

// Mock for offline dev — EXPO_PUBLIC_USE_MOCK=true
// Auth is skipped in mock mode; a hardcoded user is returned.
const MOCK_USER: User = {
  id: 'mock-user-id',
  email: 'dev@gym.local',
  name: 'Dev Athlete',
};

export class InMemoryUserRepository implements IUserRepository {
  async getMe(): Promise<User> {
    return MOCK_USER;
  }
}
