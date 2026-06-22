import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@presentation/context/AuthContext';
import { SessionProvider } from '@presentation/context/SessionContext';
import { useTheme } from '@presentation/theme';
import { AppSplashScreen } from '@presentation/components/AppSplashScreen';
import { LoginScreen } from '@presentation/screens/LoginScreen';
import { RegisterScreen } from '@presentation/screens/RegisterScreen';
import { SessionHubScreen } from '@presentation/screens/SessionHubScreen';
import { SessionDetailScreen } from '@presentation/screens/SessionDetailScreen';
import { SessionFinishedScreen } from '@presentation/screens/SessionFinishedScreen';
import { ExerciseScreen } from '@presentation/screens/ExerciseScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Wraps a component in its own SessionProvider instance.
const withSession = <P extends object>(Component: React.ComponentType<P>): React.FC<P> =>
  function WithSession(props: P) {
    return (
      <SessionProvider>
        <Component {...props} />
      </SessionProvider>
    );
  };

const SessionDetailWithProvider = withSession(SessionDetailScreen);
const SessionFinishedWithProvider = withSession(SessionFinishedScreen);
const ExerciseWithProvider = withSession(ExerciseScreen);

export const RootNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();
  const theme = useTheme();

  if (isLoading) {
    return <AppSplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'slide_from_right',
        }}
      >
        {user === null ? (
          // ── Auth stack ────────────────────────────────────────────────────
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // ── App stack ─────────────────────────────────────────────────────
          <>
            <Stack.Screen name="SessionHub" component={SessionHubScreen} />
            <Stack.Screen name="SessionDetail" component={SessionDetailWithProvider} />
            <Stack.Screen name="SessionFinished" component={SessionFinishedWithProvider} />
            <Stack.Screen name="Exercise" component={ExerciseWithProvider} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
