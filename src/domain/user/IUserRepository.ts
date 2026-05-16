import { User } from './User';

// Repository interface — User Management bounded context.
// Auth (login/register/logout) is handled by Supabase directly in AuthContext.
// This repository only fetches the user profile from our API.
export interface IUserRepository {
  getMe(): Promise<User>;
}
