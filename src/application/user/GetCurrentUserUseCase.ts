import { IUserRepository } from '@domain/user/IUserRepository';
import { User } from '@domain/user/User';

// Fetches the authenticated user profile from the API.
// Called by AuthContext after Supabase confirms a valid session.
export class GetCurrentUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(): Promise<User> {
    return this.userRepo.getMe();
  }
}
