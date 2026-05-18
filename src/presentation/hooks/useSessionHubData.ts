import { useCallback, useEffect, useState } from 'react';
import { Session, isActive } from '@domain/session/Session';
import { serviceLocator } from '@src/ServiceLocator';

interface SessionHubData {
  sessions: Session[];
  selectedSession: Session | null;
  isLoading: boolean;
  error: string | null;
  selectSession: (id: string) => void;
  reload: () => Promise<void>;
}

const autoSelect = (sessions: Session[]): Session | null =>
  sessions.find(s => isActive(s)) ?? sessions[0] ?? null;

export const useSessionHubData = (): SessionHubData => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const [activeSession, finishedResult] = await Promise.all([
        serviceLocator.getActiveSession.execute(),
        serviceLocator.getSessions.execute({
          status: 'Finished',
          sort: 'finishedAt:desc',
          pageSize: 20,
        }),
      ]);

      const merged: Session[] = [
        ...(activeSession ? [activeSession] : []),
        ...finishedResult.items,
      ];

      setSessions(merged);
      setSelectedId(prev => {
        const stillExists = prev && merged.some(s => s.id === prev);
        if (stillExists) return prev;
        return autoSelect(merged)?.id ?? null;
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectSession = useCallback((id: string): void => {
    setSelectedId(id);
  }, []);

  const selectedSession = sessions.find(s => s.id === selectedId) ?? null;

  return { sessions, selectedSession, isLoading, error, selectSession, reload: load };
};
