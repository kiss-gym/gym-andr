import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { User } from '@domain/user/User';
import { serviceLocator } from '@src/ServiceLocator';
import { setAuthToken } from '@infrastructure/api/ApiClient';
import { supabase } from '@infrastructure/auth/SupabaseClient';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  // ── Supabase session listener ─────────────────────────────────────────────
  // Handles startup restore, token refresh, sign-in and sign-out automatically.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      switch (event) {
        case 'SIGNED_IN':
        case 'INITIAL_SESSION':
        case 'TOKEN_REFRESHED':
          if (session) {
            setAuthToken(session.access_token);
            try {
              const user = await serviceLocator.getCurrentUser.execute();
              setState({ user, isLoading: false, error: null });
            } catch {
              setState({ user: null, isLoading: false, error: 'Failed to load profile' });
            }
          } else {
            setState({ user: null, isLoading: false, error: null });
          }
          break;
        case 'SIGNED_OUT':
          setAuthToken(null);
          setState({ user: null, isLoading: false, error: null });
          break;
        default:
          break;
      }
    });

    return (): void => subscription.unsubscribe();
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setState(s => ({ ...s, error: null }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const message = error.message.toLowerCase().includes('invalid')
        ? 'Invalid email or password.'
        : error.message;
      setState(s => ({ ...s, error: message }));
    }
    // On success — onAuthStateChange fires SIGNED_IN and sets the user
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(
    async (email: string, name: string, password: string): Promise<void> => {
      setState(s => ({ ...s, isLoading: true, error: null }));
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });
      if (error) {
        const message = error.message.toLowerCase().includes('already registered')
          ? 'This email is already registered. Try logging in instead.'
          : error.message;
        setState(s => ({ ...s, isLoading: false, error: message }));
        throw new Error(message);
      }
      // On success — onAuthStateChange fires SIGNED_IN and sets the user
    },
    [],
  );

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut();
    // onAuthStateChange fires SIGNED_OUT — clears user and token
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
