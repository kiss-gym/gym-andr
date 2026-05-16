import { apiRequest } from '@infrastructure/api/ApiClient';
import { IUserRepository } from '@domain/user/IUserRepository';
import { User } from '@domain/user/User';

const mapUser = (raw: Record<string, unknown>): User => ({
  id: raw['id'] as string,
  email: raw['email'] as string,
  name: raw['name'] as string,
});

export class HttpUserRepository implements IUserRepository {
  async getMe(): Promise<User> {
    const raw = await apiRequest<Record<string, unknown>>('/api/users/me');
    return mapUser(raw);
  }
}
