import { User } from './User';

// Repository interface — User Management bounded context.
// This repository only fetches the user profile from our API.
export interface IUserRepository {
  getMe(): Promise<User>;
}
