import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { isActive } from '@domain/session/Session';
import { useAuth } from '@presentation/context/AuthContext';
import { SessionHubScreenProps } from '@presentation/navigation/types';
import { serviceLocator } from '@src/ServiceLocator';
import { useSessionHubData } from '@presentation/hooks/useSessionHubData';
import { HubHeader } from '../components/session-hub/HubHeader';
import { HubSessionItem } from '../components/session-hub/HubSessionItem';
import { HubActionArea } from '../components/session-hub/HubActionArea';

export const SessionHubScreen: React.FC<SessionHubScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const s = styles();

  const { sessions, selectedSession, isLoading, reload, selectSession } = useSessionHubData();
  const [isActing, setIsActing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  // ── Logout ──────────────────────────────────────────────────────────────────

  const handleLogout = useCallback((): void => {
    Alert.alert('Menu', undefined, [
      { text: 'Log out', style: 'destructive', onPress: logout },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [logout]);

  // ── Navigation ──────────────────────────────────────────────────────────────

  const handleNavigate = useCallback(
    (sessionId: string): void => {
      selectSession(sessionId);
      navigation.navigate('SessionDetail', { sessionId });
    },
    [navigation, selectSession],
  );

  // ── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = useCallback(
    (sessionId: string, active: boolean): void => {
      if (active) {
        Alert.alert(
          'Finish and delete?',
          'This will finish the active session and permanently delete it.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Finish & Delete',
              style: 'destructive',
              onPress: async (): Promise<void> => {
                setIsActing(true);
                try {
                  await serviceLocator.finishSession.execute(sessionId);
                  await serviceLocator.deleteSession.execute(sessionId);
                  await reload();
                } catch (e) {
                  Alert.alert('Error', (e as Error).message);
                } finally {
                  setIsActing(false);
                }
              },
            },
          ],
        );
      } else {
        Alert.alert('Delete session?', 'This session will be permanently removed.', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async (): Promise<void> => {
              setIsActing(true);
              try {
                await serviceLocator.deleteSession.execute(sessionId);
                await reload();
              } catch (e) {
                Alert.alert('Error', (e as Error).message);
              } finally {
                setIsActing(false);
              }
            },
          },
        ]);
      }
    },
    [reload],
  );

  // ── Create New  ────────────────────────────────────────────────────────────

  const handleCreateNew = useCallback((): void => {
    const activeSession = sessions.find(s => isActive(s));
    if (activeSession) {
      Alert.alert(
        'There is an active session',
        'Active session must be finished before starting a new one.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Finish & Create New',
            onPress: async (): Promise<void> => {
              setIsActing(true);
              try {
                await serviceLocator.finishSession.execute(activeSession.id);
                const session = await serviceLocator.createSession.execute();
                navigation.navigate('SessionDetail', { sessionId: session.id });
              } catch (e) {
                Alert.alert('Error', (e as Error).message);
                setIsActing(false);
              }
            },
          },
        ],
      );
      return;
    }

    setIsActing(true);
    serviceLocator.createSession
      .execute()
      .then(session => navigation.navigate('SessionDetail', { sessionId: session.id }))
      .catch(e => {
        Alert.alert('Error', (e as Error).message);
        setIsActing(false);
      });
  }, [sessions, navigation]);

  // ── Copy Selected — userId removed ──────────────────────────────────────────

  const handleInheritSelected = useCallback((): void => {
    if (!selectedSession) return;

    const activeSession = sessions.find(s => isActive(s));
    if (activeSession) {
      Alert.alert(
        'There is an active session',
        'Active session must be finished before starting a new one.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Finish & Inherit & Start',
            onPress: async (): Promise<void> => {
              setIsActing(true);
              try {
                await serviceLocator.finishSession.execute(activeSession.id);
                const session = await serviceLocator.inheritSession.execute(selectedSession.id);
                navigation.navigate('SessionDetail', { sessionId: session.id });
              } catch (e) {
                Alert.alert('Error', (e as Error).message);
                setIsActing(false);
              }
            },
          },
        ],
      );
      return;
    }

    setIsActing(true);
    serviceLocator.inheritSession
      .execute(selectedSession.id)
      .then(session => navigation.navigate('SessionDetail', { sessionId: session.id }))
      .catch(e => {
        Alert.alert('Error', (e as Error).message);
        setIsActing(false);
      });
  }, [selectedSession, sessions, navigation]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={s.root}>
      <HubHeader userName={user?.name ?? user?.email ?? 'Athlete'} onLogout={handleLogout} />

      <ScrollView
        style={s.list}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
      >
        {sessions.map(session => (
          <HubSessionItem
            key={session.id}
            session={session}
            isSelected={selectedSession?.id === session.id}
            onSelect={() => selectSession(session.id)}
            onNavigate={() => handleNavigate(session.id)}
            onDelete={() => handleDelete(session.id, isActive(session))}
          />
        ))}
      </ScrollView>

      <HubActionArea
        selectedSession={
          selectedSession
            ? {
                isThereAnyActiveSession: sessions.find(s => isActive(s)) != null,
                label: selectedSession.label,
              }
            : null
        }
        hasAnySessions={sessions.length > 0}
        isActing={isLoading || isActing}
        onInheritSelected={handleInheritSelected}
        onCreateNew={handleCreateNew}
      />
    </View>
  );
};

const styles = (): ReturnType<typeof StyleSheet.create> =>
  StyleSheet.create({
    root: { flex: 1 },
    list: { flex: 1 },
    listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  });
